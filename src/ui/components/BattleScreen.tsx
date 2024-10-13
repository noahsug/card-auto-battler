import { useEffect, useRef, useState } from 'react';
import { styled } from 'styled-components';

import { BattleEvent } from '../../game/actions';
import { getBattleWinner, getIsUserTurn, getPlayerTargets } from '../../game/utils';
import livesImage from '../images/icons/heart.png';
import battleImage from '../images/icons/swords.png';
import { getHandDrawnBorderRadius, maskImage } from '../style';
import BattleControls from './BattleControls';
import { CardStack } from './CardStack/CardStack';
import { FloatingCombatText } from './FloatingCombatText';
import { useActions, useGameState, useUndo } from './GameStateContext';
import HealthBar from './HealthBar';
import { PlayerProfile } from './PlayerProfile';
import Container from './shared/Container';

interface Props {
  onBattleOver: () => void;
  hasOverlay?: boolean;
}

// TODO: Freeze game state after battle is over so we don't show next stage?
// TODO: Have "playedCard" and "currentGameState" local state, which we update to next game state
// after the card animation is complete (instead of using 200ms everywhere)
export default function BattleScreen({ onBattleOver, hasOverlay = false }: Props) {
  const game = useGameState();
  const { user, enemy, turn } = game;

  const { playCard } = useActions();
  const { canUndo, undo } = useUndo();

  const [isPlaying, setIsPlaying] = useState(false);

  const [userBattleEvents, setUserBattleEvents] = useState<BattleEvent[]>([]);
  const [enemyBattleEvents, setEnemyBattleEvents] = useState<BattleEvent[]>([]);

  const userProfileRef = useRef<HTMLDivElement>(null);
  const enemyProfileRef = useRef<HTMLDivElement>(null);

  const endBattleTimeout = useRef<NodeJS.Timeout>();

  const isBattleOver = getBattleWinner(game) != null;

  function handleTogglePlayPause() {
    setIsPlaying((prev) => !prev);
  }

  function handleUndo() {
    undo();
    setUserBattleEvents([]);
    setEnemyBattleEvents([]);
  }

  function handlePlayNextCard() {
    const battleEvents = playCard();

    const [userTarget, enemyTarget] = getPlayerTargets(game);
    setUserBattleEvents(battleEvents.filter(({ target }) => target === userTarget));
    setEnemyBattleEvents(battleEvents.filter(({ target }) => target === enemyTarget));
  }

  useEffect(() => {
    clearTimeout(endBattleTimeout.current);

    if (isBattleOver) {
      endBattleTimeout.current = setTimeout(onBattleOver, 1500);
    }

    return () => clearTimeout(endBattleTimeout.current);
  }, [isBattleOver, onBattleOver]);

  return (
    <Container>
      <IconsRow>
        <Label>
          <Icon src={livesImage} />
          <div>{game.lives} lives</div>
        </Label>

        <Label>
          <Icon src={battleImage} />
          <div>round {game.wins + 1}</div>
        </Label>
      </IconsRow>

      <PlayersRow>
        <Player className={getIsUserTurn(game) ? 'active' : ''}>
          <PlayerProfile
            src={user.image}
            profileRef={userProfileRef}
            battleEvents={userBattleEvents}
            isDead={user.health <= 0}
          />
          <FloatingCombatText
            battleEvents={userBattleEvents}
            targetElement={userProfileRef.current}
          />
          <HealthBar health={user.health} maxHealth={user.startingHealth} />
        </Player>

        <Player className={getIsUserTurn(game) ? '' : 'active'}>
          <PlayerProfile
            src={enemy.image}
            flip={true}
            profileRef={enemyProfileRef}
            battleEvents={enemyBattleEvents}
            isDead={enemy.health <= 0}
          />
          <FloatingCombatText
            battleEvents={enemyBattleEvents}
            targetElement={userProfileRef.current}
          />
          <HealthBar health={enemy.health} maxHealth={enemy.startingHealth} />
        </Player>
      </PlayersRow>

      <CardStackRow>
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
      </CardStackRow>

      <BattleControls
        onBack={canUndo ? handleUndo : undefined}
        onTogglePlay={isBattleOver || hasOverlay ? undefined : handleTogglePlayPause}
        isPlaying={isPlaying}
        onNext={isBattleOver || hasOverlay ? undefined : handlePlayNextCard}
      />
    </Container>
  );
}

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
`;

const IconsRow = styled(Row)`
  align-items: start;
  flex: 1;
`;

const PlayersRow = styled(Row)`
  margin-bottom: 3rem;
  justify-content: space-around;
`;

const CardStackRow = styled(Row)`
  justify-content: space-around;
`;

const Label = styled(Row)`
  font-size: 2rem;
  font-family: var(--font-heading);
  letter-spacing: var(--letter-spacing-heading);
  background-color: var(--color-bg-opaque);
  justify-content: center;
  padding: 0 0.5rem;

  ${getHandDrawnBorderRadius()}
  border: solid 0.75rem var(--color-bg-opaque);

  > div {
    line-height: 0.85;
    height: 1em;
  }
`;

const Icon = styled.div<{ src: string }>`
  height: 2rem;
  width: 2rem;
  margin-right: 1rem;
  ${maskImage}
  background-color: var(--color-primary);
`;

const Player = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
