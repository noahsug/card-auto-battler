import { useCallback, useEffect, useRef, useState } from 'react';
import { styled } from 'styled-components';
import cloneDeep from 'lodash/cloneDeep';

import { BattleEvent } from '../../game/actions';
import { GameState } from '../../game/gameState';
import { getBattleWinner, getIsUserTurn, getPlayerTargets } from '../../game/utils/selectors';
import { BattleControls } from './BattleControls';
import { CardStack } from './CardStack';
import { FloatingCombatText } from './FloatingCombatText';
import { HealthBar } from './HealthBar';
import { HUD } from './HUD';
import { PlayerProfile } from './PlayerProfile';
import { Container } from './shared/Container';
import { Row } from './shared/Row';
import { CenterContent } from './shared/CenterContent';
import { StatusEffects } from './StatusEffects';
import { CanUndo, PlayCard, Undo } from '../hooks/useGameState';

const EMPTY_BATTLE_EVENTS: { user: BattleEvent[]; enemy: BattleEvent[] } = { user: [], enemy: [] };

interface Props {
  game: GameState;
  playCard: PlayCard;
  canUndo: CanUndo;
  undo: Undo;
  onBattleOver: () => void;
  onViewDeck: () => void;
  hasOverlay?: boolean;
}

// TODO: Have "playedCard" and "currentGameState" local state, which we update to next game state
// after the card animation is complete (instead of using 200ms delay everywhere)
export function BattleScreen({
  game,
  playCard,
  canUndo,
  undo,
  onBattleOver,
  onViewDeck,
  hasOverlay = false,
}: Props) {
  const { user, enemy, turn } = game;
  const [userTarget, enemyTarget] = getPlayerTargets(game);

  const [isPaused, setIsPaused] = useState(false);

  const [battleEvents, setBattleEvents] = useState(EMPTY_BATTLE_EVENTS);

  const userProfileRef = useRef<HTMLDivElement>(null);
  const enemyProfileRef = useRef<HTMLDivElement>(null);

  const handleUndo = useCallback(() => {
    undo();
    setBattleEvents(EMPTY_BATTLE_EVENTS);
  }, [undo]);

  const handlePlayNextCard = useCallback(async () => {
    // TODO: battle events are F'd, maybe due to useGameState changes
    const battleEvents = await playCard();
    setBattleEvents({
      user: battleEvents.filter(({ target }) => target === userTarget),
      enemy: battleEvents.filter(({ target }) => target === enemyTarget),
    });
  }, [playCard, userTarget, enemyTarget]);

  const handleTogglePlayPause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const isBattleOver = getBattleWinner(game) != null;
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
              profileRef={userProfileRef}
              battleEvents={battleEvents.user}
              isDead={user.health <= 0}
            />
            <FloatingCombatText
              battleEvents={battleEvents.user}
              targetElement={userProfileRef.current}
            />
            <HealthBar health={user.health} maxHealth={user.startingHealth} />
          </Player>

          <Player className={getIsUserTurn(game) ? '' : 'active'}>
            <StatusEffects statusEffects={enemy} />
            <PlayerProfile
              src={enemy.image}
              flip={true}
              profileRef={enemyProfileRef}
              battleEvents={battleEvents.enemy}
              isDead={enemy.health <= 0}
            />
            <FloatingCombatText
              battleEvents={battleEvents.enemy}
              targetElement={userProfileRef.current}
            />
            <HealthBar health={enemy.health} maxHealth={enemy.startingHealth} />
          </Player>
        </PlayersRow>

        <ContentRow>
          <CardStack
            cards={user.cards}
            currentCardIndex={user.currentCardIndex}
            targetElement={enemyProfileRef.current}
            playerType="user"
            turn={turn}
          />
          {
            <CardStack
              cards={enemy.cards}
              currentCardIndex={enemy.currentCardIndex}
              targetElement={userProfileRef.current}
              playerType="enemy"
              turn={turn}
            />
          }
        </ContentRow>
      </CenterContent>

      <BattleControls
        onBack={hasOverlay || !canUndo() ? undefined : handleUndo}
        onTogglePlay={hasOverlay ? undefined : handleTogglePlayPause}
        isPaused={isPaused}
        onNext={isBattleOver || hasOverlay ? undefined : handlePlayNextCard}
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
