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
  isTurnOver,
} from '../../game/utils/selectors';
import { doNothing } from '../../utils/functions';
import { useGetBoundingRect } from '../hooks/useBoundingRect';
import { CanUndo, EndTurn, PlayCard, StartTurn, Undo } from '../hooks/useGameState';
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

type AnimationState = 'startTurn' | 'applyCardEffects' | 'endPlayCard';

function getPlayCardBattleEvents(player: PlayerState): BattleEvent[] {
  const card = player.cards[player.currentCardIndex];
  if (card) {
    return [createBattleEvent('playCard', card.acquiredId)];
  }
  return [];
}

interface Props {
  game: GameState;
  startTurn: StartTurn;
  playCard: PlayCard;
  endTurn: EndTurn;
  canUndo: CanUndo;
  undo: Undo;
  onBattleOver: () => void;
  onViewDeck: () => void;
}

export function BattleScreen({
  game,
  startTurn,
  playCard,
  endTurn,
  canUndo,
  undo,
  onBattleOver,
  onViewDeck,
}: Props) {
  const { user, enemy } = game;
  const isBattleOver = getBattleWinner(game) != null;
  const activePlayer = getActivePlayer(game);

  const [userProfileHandleRef, getUserProfileBoundingRect] = useGetBoundingRect();
  const [enemyProfileHandleRef, getEnemyProfileBoundingRect] = useGetBoundingRect();

  const [isPaused, setIsPaused] = useState(true);
  const nextAnimationState = useRef<AnimationState>('startTurn');

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

  const startNextTurn = useCallback(async () => {
    const events = await startTurn();
    // start play card animation early
    setBattleEvents([...events, ...getPlayCardBattleEvents(activePlayer)]);
    nextAnimationState.current = 'applyCardEffects';
  }, [activePlayer, startTurn]);

  const handleAnimationComplete = useCallback(async () => {
    if (isBattleOver) return;
    if (nextAnimationState.current === 'applyCardEffects') {
      const events = await playCard();
      setBattleEvents(events);
      nextAnimationState.current = 'endPlayCard';
    } else if (nextAnimationState.current === 'endPlayCard') {
      if (isTurnOver(activePlayer)) {
        endTurn();
        setBattleEvents([]);
        nextAnimationState.current = 'startTurn';
      } else {
        setBattleEvents(getPlayCardBattleEvents(activePlayer));
        nextAnimationState.current = 'applyCardEffects';
      }
    }
  }, [activePlayer, endTurn, isBattleOver, playCard]);

  // change combat state based only on the active player animations
  const userHandleAnimationComplete = getIsUserTurn(game) ? handleAnimationComplete : doNothing;
  const enemyHandleAnimationComplete = getIsUserTurn(game) ? doNothing : handleAnimationComplete;

  // auto-play cards
  useEffect(() => {
    if (isBattleOver) return;
    if (!isPaused && nextAnimationState.current === 'startTurn') {
      startNextTurn();
    }
  }, [isBattleOver, isPaused, startNextTurn]);

  // TODO: make this fast forward instead?
  const handlePlayNextCard = useCallback(() => {
    startNextTurn();
  }, [startNextTurn]);

  const handleTogglePlayPause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleUndo = useCallback(() => {
    undo();
    setBattleEvents([createBattleEvent('undo')]);
    nextAnimationState.current = 'startTurn';
    setIsPaused(true);
  }, [undo]);

  useTimeout(onBattleOver, 1500, { enabled: isBattleOver });

  return (
    <Container>
      <HUD game={game} onViewDeck={onViewDeck} />

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
          />
          <CardStack
            cards={enemy.cards}
            currentCardIndex={enemy.currentCardIndex}
            onAnimationComplete={enemyHandleAnimationComplete}
            events={enemyBattleEvents}
            opponentBoundingRect={getUserProfileBoundingRect()}
          />
        </ContentRow>
      </CenterContent>

      <BattleControls
        onBack={canUndo() ? handleUndo : undefined}
        onTogglePlay={!isBattleOver ? handleTogglePlayPause : undefined}
        isPaused={isPaused}
        onNext={
          !isBattleOver && isPaused && nextAnimationState.current === 'startTurn'
            ? handlePlayNextCard
            : undefined
        }
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
