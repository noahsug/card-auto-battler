import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { styled } from 'styled-components';

import {
  BattleEvent,
  createBattleEvent,
  eventAppliesToTarget,
} from '../../game/actions/battleEvent';
import { GameState, PlayerState } from '../../game/gameState';
import {
  getActivePlayer,
  getBattleWinner,
  getIsUserTurn,
  getPlayerTargets,
  getIsTurnOver,
  getIsStartOfBattle,
} from '../../game/utils/selectors';
import { noop } from '../../utils/functions';
import { useGetBoundingRect } from '../hooks/useBoundingRect';
import { EndTurnAction, PlayCardAction, StartTurnAction } from '../hooks/useGameState';
import { useTimeout } from '../hooks/useTimeout';
import { BattleControls } from './BattleControls';
import { CardStack } from './CardStack';
import { FloatingCombatText } from './FloatingCombatText';
import { HealthBar } from './HealthBar';
import { HUD } from './HUD';
import { PlayerProfile } from './PlayerProfile';
import { CenterContent } from './shared/CenterContent';
import { Container } from './shared/Container';
import { Row } from './shared/Row';
import { StatusEffects } from './StatusEffects';

type AnimationState = 'playNextCard' | 'applyCardEffects' | 'endPlayCard';

// TODO: don't start the card animation if dead or stunned (need to return updated player state
// from action, or use sync selectors like Jotai)
// TODO: the game hangs forever after the play card animation when the opponent is stunned
function getPlayCardBattleEvents(player: PlayerState): BattleEvent[] {
  const card = player.cards[player.currentCardIndex];
  if (card) {
    return [createBattleEvent('startPlayCard', card.acquiredId)];
  }
  return [];
}

interface Props {
  game: GameState;
  hasOverlay: boolean;
  startTurn: StartTurnAction;
  playCard: PlayCardAction;
  endTurn: EndTurnAction;
  setGameState: (game: GameState) => void;
  onBattleOver: () => void;
  onViewDeck: () => void;
}

// TODO: Move messy battle static logic into separate component and clean up code
// TODO: initial card order is incorrect
export function BattleScreen({
  game,
  hasOverlay,
  startTurn,
  playCard,
  setGameState,
  endTurn,
  onBattleOver,
  onViewDeck,
}: Props) {
  const { user, enemy } = game;
  const isBattleOver = getBattleWinner(game) != null;
  const activePlayer = getActivePlayer(game);
  const isStartOfBattle = getIsStartOfBattle(game);

  const [userProfileHandleRef, getUserProfileBoundingRect] = useGetBoundingRect();
  const [enemyProfileHandleRef, getEnemyProfileBoundingRect] = useGetBoundingRect();

  const [isPaused, setIsPaused] = useState(true);
  const [isFastForwarding, setIsFastForwarding] = useState(false);
  const nextAnimationState = useRef<AnimationState>('playNextCard');
  const undoHistory = useRef<GameState[]>([]);

  const [battleEvents, setBattleEvents] = useState<BattleEvent[]>([
    createBattleEvent('startBattle'),
  ]);
  const [userTarget, enemyTarget] = getPlayerTargets(game);
  const [userBattleEvents, enemyBattleEvents] = useMemo(() => {
    return [
      battleEvents.filter((e) => eventAppliesToTarget(e, userTarget)),
      battleEvents.filter((e) => eventAppliesToTarget(e, enemyTarget)),
    ];
  }, [battleEvents, userTarget, enemyTarget]);

  const playNextCard = useCallback(async () => {
    const events: BattleEvent[] = [];
    undoHistory.current.push(structuredClone(game));

    if (activePlayer.cardsPlayedThisTurn === 0) {
      // console.log('-------------------- start turn');
      const startTurnEvents = await startTurn();
      events.push(...startTurnEvents);
    } else {
      // console.log('-------------------- play next card');
    }

    // start play card animation early
    setBattleEvents([
      ...events,
      ...getPlayCardBattleEvents(activePlayer),
      createBattleEvent('animationComplete'),
    ]);
    nextAnimationState.current = 'applyCardEffects';
  }, [activePlayer, game, startTurn]);

  const handleAnimationComplete = useCallback(async () => {
    // console.log('B start', nextAnimationState.current);
    if (isBattleOver) return;
    if (nextAnimationState.current === 'applyCardEffects') {
      const events = await playCard();
      setBattleEvents([...events, createBattleEvent('animationComplete')]);
      nextAnimationState.current = 'endPlayCard';
    } else if (nextAnimationState.current === 'endPlayCard') {
      if (getIsTurnOver(game)) {
        // console.log('-------------------- end turn');
        endTurn();
        setBattleEvents([]);
        nextAnimationState.current = 'playNextCard';
      } else {
        playNextCard();
      }
    }
  }, [endTurn, game, isBattleOver, playCard, playNextCard]);

  // change combat state based only on the active player animations
  const userHandleAnimationComplete = getIsUserTurn(game) ? handleAnimationComplete : noop;
  const enemyHandleAnimationComplete = getIsUserTurn(game) ? noop : handleAnimationComplete;

  // auto-play cards
  useEffect(() => {
    if (isBattleOver) return;
    // console.log('B auto-play', !isPaused, nextAnimationState.current === 'playNextCard');
    if (!isPaused && nextAnimationState.current === 'playNextCard') {
      playNextCard();
    }
  }, [isBattleOver, isPaused, playNextCard]);

  const handleViewDeck = useCallback(() => {
    onViewDeck();
    setIsPaused(true);
  }, [onViewDeck]);

  const handleTogglePlayPause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleToggleFastForwarding = useCallback(() => {
    setIsFastForwarding((prev) => !prev);
    setIsPaused(false);
  }, []);

  const handleUndo = useCallback(() => {
    setGameState(undoHistory.current.pop()!);
    nextAnimationState.current = 'playNextCard';
    setBattleEvents([createBattleEvent('undo')]);
    setIsPaused(true);
  }, [setGameState]);

  const canUndo = !hasOverlay && undoHistory.current.length > 0 && !isStartOfBattle;
  const canPauseOrFastForward = !hasOverlay && !isBattleOver;
  const undoCallback = useMemo(() => (canUndo ? handleUndo : undefined), [canUndo, handleUndo]);
  const togglePlayCallback = useMemo(
    () => (canPauseOrFastForward ? handleTogglePlayPause : undefined),
    [canPauseOrFastForward, handleTogglePlayPause],
  );
  const toggleFastForwardCallback = useMemo(
    () => (canPauseOrFastForward ? handleToggleFastForwarding : undefined),
    [canPauseOrFastForward, handleToggleFastForwarding],
  );

  useTimeout(onBattleOver, 1500, { enabled: isBattleOver });

  return (
    <Container>
      <HUD game={game} onViewDeck={handleViewDeck} />

      <CenterContent>
        <PlayersRow>
          <Player className={getIsUserTurn(game) ? 'active' : ''}>
            <StatusEffects player={user} />
            <PlayerProfile
              src={user.image}
              handleRef={userProfileHandleRef}
              battleEvents={userBattleEvents}
              isDead={user.health <= 0}
            />
            <FloatingCombatText
              battleEvents={userBattleEvents}
              targetBoundingRect={getUserProfileBoundingRect()}
            />
            <HealthBar health={user.health} maxHealth={user.startingHealth} />
          </Player>

          <Player className={getIsUserTurn(game) ? '' : 'active'}>
            <StatusEffects player={enemy} />
            <PlayerProfile
              src={enemy.image}
              flip={true}
              handleRef={enemyProfileHandleRef}
              battleEvents={enemyBattleEvents}
              isDead={enemy.health <= 0}
            />
            <FloatingCombatText
              battleEvents={enemyBattleEvents}
              targetBoundingRect={getEnemyProfileBoundingRect()}
            />
            <HealthBar health={enemy.health} maxHealth={enemy.startingHealth} />
          </Player>
        </PlayersRow>

        <ContentRow>
          <CardStack
            cards={user.cards}
            currentCardIndex={user.currentCardIndex}
            onAnimationComplete={userHandleAnimationComplete}
            events={userBattleEvents}
            opponentBoundingRect={getEnemyProfileBoundingRect()}
            isPaused={isPaused}
            isFastForwarding={isFastForwarding}
          />
          <CardStack
            cards={enemy.cards}
            currentCardIndex={enemy.currentCardIndex}
            onAnimationComplete={enemyHandleAnimationComplete}
            events={enemyBattleEvents}
            opponentBoundingRect={getUserProfileBoundingRect()}
            isPaused={isPaused}
            isFastForwarding={isFastForwarding}
          />
        </ContentRow>
      </CenterContent>

      <BattleControls
        onBack={undoCallback}
        onTogglePlay={togglePlayCallback}
        isPaused={isPaused}
        onToggleFastForward={toggleFastForwardCallback}
        isFastForwarding={isFastForwarding}
      />
    </Container>
  );
}

const ContentRow = styled(Row)`
  justify-content: space-around;
  width: 100%;
`;

const PlayersRow = styled(ContentRow)`
  margin-bottom: 4rem;
`;

const Player = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
