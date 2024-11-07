import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { styled } from 'styled-components';

import {
  BattleEvent,
  createStartBattleEvent,
  createCardEvent,
} from '../../game/actions/battleEvent';
import { GameState } from '../../game/gameState';
import {
  getActivePlayer,
  getBattleWinner,
  getIsUserTurn,
  getPlayerTargets,
} from '../../game/utils/selectors';
import { doNothing } from '../../utils/functions';
import { CanUndo, EndTurn, PlayCard, StartTurn, Undo } from '../hooks/useGameState';
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

export type AnimationState = 'startTurn' | 'applyCardEffects' | 'endTurn';

interface Props {
  game: GameState;
  startTurn: StartTurn;
  playCard: PlayCard;
  endTurn: EndTurn;
  canUndo: CanUndo;
  undo: Undo;
  onBattleOver: () => void;
  onViewDeck: () => void;
  hasOverlay?: boolean;
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
  hasOverlay = false,
}: Props) {
  const { user, enemy } = game;
  const isBattleOver = getBattleWinner(game) != null;
  const activePlayer = getActivePlayer(game);

  const [userProfileElement, setUserProfileElement] = useState<HTMLDivElement | null>(null);
  const [enemyProfileElement, setEnemyProfileElement] = useState<HTMLDivElement | null>(null);

  const [isPaused, setIsPaused] = useState(true);
  const [isWaitingForAnimation, setIsWaitingForAnimation] = useState(false);
  const [nextAnimation, setNextAnimation] = useState<AnimationState>('startTurn');

  const [battleEvents, setBattleEvents] = useState<BattleEvent[]>([
    createStartBattleEvent('self'),
    createStartBattleEvent('opponent'),
  ]);
  const [userTarget, enemyTarget] = getPlayerTargets(game);
  const [userBattleEvents, enemyBattleEvents] = useMemo(() => {
    return [
      battleEvents.filter(({ target }) => target === userTarget),
      battleEvents.filter(({ target }) => target === enemyTarget),
    ];
  }, [battleEvents, userTarget, enemyTarget]);

  const handleStartTurn = useCallback(async () => {
    const events = await startTurn();
    const card = activePlayer.cards[activePlayer.currentCardIndex];
    if (card) {
      // start the play card animation
      events.push(createCardEvent('playCard', card.acquiredId));
    }
    setBattleEvents(events);
    setNextAnimation('applyCardEffects');
  }, [activePlayer.cards, activePlayer.currentCardIndex, startTurn]);

  const handleApplyCardEffects = useCallback(async () => {
    const events = await playCard();
    setBattleEvents(events);
    setNextAnimation('endTurn');
    setIsWaitingForAnimation(true);
  }, [playCard]);

  const handleEndTurn = useCallback(() => {
    endTurn();
    // there is no end turn animation, so we immediately start the next turn
    handleStartTurn();
  }, [endTurn, handleStartTurn]);

  // TODO: add a 500ms wait before apply card effects
  const startNextAnimation = useCallback(() => {
    if (nextAnimation === 'startTurn') {
      handleStartTurn();
    } else if (nextAnimation === 'applyCardEffects') {
      handleApplyCardEffects();
    } else if (nextAnimation === 'endTurn') {
      handleEndTurn();
    }
  }, [handleApplyCardEffects, handleEndTurn, handleStartTurn, nextAnimation]);

  const handleAnimationComplete = useCallback(async () => {
    setIsWaitingForAnimation(false);

    if (isPaused) {
      if (nextAnimation === 'endTurn') {
        // end the turn and don't start the next turn until we're unpaused
        endTurn();
        setBattleEvents([]);
        setNextAnimation('startTurn');
        return;
      }
      if (nextAnimation === 'startTurn') return;
    }

    startNextAnimation();
  }, [endTurn, isPaused, nextAnimation, startNextAnimation]);

  // change combat state based only on the active player animations
  const userHandleAnimationComplete = getIsUserTurn(game) ? handleAnimationComplete : doNothing;
  const enemyHandleAnimationComplete = getIsUserTurn(game) ? doNothing : handleAnimationComplete;

  // TODO: handle undo animations
  const handleUndo = useCallback(() => {
    undo();
    setBattleEvents([]);
    setIsPaused(true);
  }, [undo]);

  const canPlayNextCard = !isBattleOver && !hasOverlay && isPaused && !isWaitingForAnimation;
  const canTogglePlayPause = !isBattleOver && !hasOverlay;

  // TODO: Remove and make this fast forward instead?
  const handlePlayNextCard = useCallback(async () => {
    startNextAnimation();
  }, [startNextAnimation]);

  const handleTogglePlayPause = useCallback(() => {
    setIsPaused((isCurrentlyPaused) => {
      if (isCurrentlyPaused && !isWaitingForAnimation) {
        startNextAnimation();
      }
      return !isCurrentlyPaused;
    });
  }, [startNextAnimation, isWaitingForAnimation]);

  // TODO: replace with useTimeout
  const endBattleTimeout = useRef<NodeJS.Timeout>();
  if (!isBattleOver) {
    clearTimeout(endBattleTimeout.current);
    endBattleTimeout.current = undefined;
  }
  useEffect(() => {
    if (isBattleOver && endBattleTimeout.current == null) {
      endBattleTimeout.current = setTimeout(onBattleOver, 1500);
    }
    return () => clearTimeout(endBattleTimeout.current);
  }, [isBattleOver, onBattleOver]);

  return (
    <Container>
      <HUD game={game} onViewDeck={onViewDeck} />

      <CenterContent>
        <PlayersRow>
          <Player className={getIsUserTurn(game) ? 'active' : ''}>
            <StatusEffects statusEffects={user} />
            <PlayerProfile
              src={user.image}
              setProfileElement={setUserProfileElement}
              battleEvents={userBattleEvents}
              isDead={user.health <= 0}
            />
            <FloatingCombatText
              battleEvents={userBattleEvents}
              targetElement={userProfileElement}
            />
            <HealthBar health={user.health} maxHealth={user.startingHealth} />
          </Player>

          <Player className={getIsUserTurn(game) ? '' : 'active'}>
            <StatusEffects statusEffects={enemy} />
            <PlayerProfile
              src={enemy.image}
              flip={true}
              setProfileElement={setEnemyProfileElement}
              battleEvents={enemyBattleEvents}
              isDead={enemy.health <= 0}
            />
            <FloatingCombatText
              battleEvents={enemyBattleEvents}
              targetElement={enemyProfileElement}
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
            targetElement={enemyProfileElement}
          />
          {
            <CardStack
              cards={enemy.cards}
              currentCardIndex={enemy.currentCardIndex}
              onAnimationComplete={enemyHandleAnimationComplete}
              events={enemyBattleEvents}
              targetElement={userProfileElement}
            />
          }
        </ContentRow>
      </CenterContent>

      <BattleControls
        onBack={hasOverlay || !canUndo() ? undefined : handleUndo}
        onTogglePlay={canTogglePlayPause ? handleTogglePlayPause : undefined}
        isPaused={isPaused}
        onNext={canPlayNextCard ? handlePlayNextCard : undefined}
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
