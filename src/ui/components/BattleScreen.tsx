import { useCallback, useEffect, useRef, useState } from 'react';
import { styled } from 'styled-components';

import { BattleEvent, createStartBattleEvent } from '../../game/actions/battleEvent';
import { GameState } from '../../game/gameState';
import { getBattleWinner, getIsUserTurn, getPlayerTargets } from '../../game/utils/selectors';
import { CanUndo, PlayCard, Undo } from '../hooks/useGameState';
import { useInterval } from '../hooks/useInterval';
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
import { CombatState } from './CardStack/CardStackAnimation';
import { doNothing } from '../../utils/functions';

interface Props {
  game: GameState;
  playCard: PlayCard;
  canUndo: CanUndo;
  undo: Undo;
  onBattleOver: () => void;
  onViewDeck: () => void;
  hasOverlay?: boolean;
}

// TODO: Remove
function getBattleEventsByCombatState(
  battleEvents: BattleEvent[],
): Record<CombatState, BattleEvent[]> {
  let cardPlayed = false;

  return battleEvents.reduce(
    (acc, event) => {
      if (event.type === 'cardPlayed') {
        cardPlayed = true;
      }

      if (cardPlayed) {
        acc.cardPlayed.push(event);
      } else {
        acc.turnStart.push(event);
      }
      return acc;
    },
    { turnStart: [], cardPlayed: [] } as Record<CombatState, BattleEvent[]>,
  );
}

// TODO: separate functions for startTurn, playCard, endTurn
//  - remove active battle event filtering (we get this for free now)
//  - manually add "playCard" battle event for card animation
//  - call playCard() after animation is complete, which updates game state
//  - remove turn ref (we get this for free now)
export function BattleScreen({
  game,
  playCard,
  canUndo,
  undo,
  onBattleOver,
  onViewDeck,
  hasOverlay = false,
}: Props) {
  const { user, enemy } = game;
  const isBattleOver = getBattleWinner(game) != null;
  const canPlayNextCard = !isBattleOver && !hasOverlay;

  const [userProfileElement, setUserProfileElement] = useState<HTMLDivElement | null>(null);
  const [enemyProfileElement, setEnemyProfileElement] = useState<HTMLDivElement | null>(null);

  const [isPaused, setIsPaused] = useState(true);
  const [combatState, setCombatState] = useState<CombatState>('turnStart');

  const [battleEvents, setBattleEvents] = useState<BattleEvent[]>([
    createStartBattleEvent('self'),
    createStartBattleEvent('opponent'),
  ]);
  // TODO: Remove
  const battleEventsTurn = useRef(game.turn);

  const [userTarget, enemyTarget] = getPlayerTargets({ turn: battleEventsTurn.current });
  const userBattleEvents = battleEvents.filter(({ target }) => target === userTarget);
  const enemyBattleEvents = battleEvents.filter(({ target }) => target === enemyTarget);

  const activeBattleEvents = getBattleEventsByCombatState(battleEvents)[combatState];
  const activeUserBattleEvents = activeBattleEvents.filter(({ target }) => target === userTarget);
  const activeEnemyBattleEvents = activeBattleEvents.filter(({ target }) => target === enemyTarget);

  const playNextCard = useCallback(async () => {
    battleEventsTurn.current = game.turn;
    const events = await playCard();
    setBattleEvents(events);
  }, [game.turn, playCard]);

  const handleNextCombatState = useCallback(
    async (newCombatState: CombatState) => {
      if (newCombatState === 'turnStart') {
        if (isPaused) return;
        playNextCard();
      }
      setCombatState(newCombatState);
    },
    [isPaused, playNextCard],
  );

  // change combat state based only on the active player actions
  const userHandleNextCombatState = getIsUserTurn({ turn: battleEventsTurn.current })
    ? handleNextCombatState
    : doNothing;
  const enemyHandleNextCombatState = getIsUserTurn({ turn: battleEventsTurn.current })
    ? doNothing
    : handleNextCombatState;

  const handleUndo = useCallback(() => {
    undo();
    setBattleEvents([]);
    setIsPaused(true);
  }, [undo]);

  // TODO: Remove
  const handlePlayNextCard = useCallback(async () => {
    setCombatState('turnStart');
    playNextCard();
    setIsPaused(true);
  }, [playNextCard]);

  const handleTogglePlayPause = useCallback(() => {
    setIsPaused((isPaused) => {
      if (isPaused) {
        // immediately play next card when unpausing
        setCombatState('turnStart');
        playNextCard();
      }
      return !isPaused;
    });
  }, [playNextCard]);

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
              battleEvents={activeUserBattleEvents}
              isDead={user.health <= 0}
            />
            <FloatingCombatText
              battleEvents={activeUserBattleEvents}
              targetElement={userProfileElement}
            />
            <HealthBar
              // TODO: Add
              // battleEvents={activeUserBattleEvents}
              health={user.health}
              maxHealth={user.startingHealth}
            />
          </Player>

          <Player className={getIsUserTurn(game) ? '' : 'active'}>
            <StatusEffects statusEffects={enemy} />
            <PlayerProfile
              src={enemy.image}
              flip={true}
              setProfileElement={setEnemyProfileElement}
              battleEvents={activeEnemyBattleEvents}
              isDead={enemy.health <= 0}
            />
            <FloatingCombatText
              battleEvents={activeEnemyBattleEvents}
              targetElement={enemyProfileElement}
            />
            <HealthBar health={enemy.health} maxHealth={enemy.startingHealth} />
          </Player>
        </PlayersRow>

        <ContentRow>
          <CardStack
            cards={user.cards}
            currentCardIndex={user.currentCardIndex}
            onNextCombatState={userHandleNextCombatState}
            events={userBattleEvents}
            targetElement={enemyProfileElement}
          />
          {
            <CardStack
              cards={enemy.cards}
              currentCardIndex={enemy.currentCardIndex}
              onNextCombatState={enemyHandleNextCombatState}
              events={enemyBattleEvents}
              targetElement={userProfileElement}
            />
          }
        </ContentRow>
      </CenterContent>

      <BattleControls
        onBack={hasOverlay || !canUndo() ? undefined : handleUndo}
        onTogglePlay={hasOverlay ? undefined : handleTogglePlayPause}
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
