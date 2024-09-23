import { useEffect, useRef, useState } from 'react';
import { styled } from 'styled-components';

import { getHandDrawnBorderRadius, maskImage } from '../style';
import BattleControls from './BattleControls';
import { CardStack } from './CardStack/CardStack';
import { useActions, useGameState, useUndo } from './GameStateContext';
import HealthBar from './HealthBar';
import Container from './shared/Container';
import livesImage from '../images/icons/heart.png';
import battleImage from '../images/icons/swords.png';
import { getIsUserTurn, getPlayerTargets } from '../../game/utils';
import { BattleEvent } from '../../game/actions';
import { FloatingCombatText } from './FloatingCombatText';
import { PlayerProfile } from './PlayerProfile';

interface Props {
  onBattleOver: () => void;
}

export default function BattleScreen({ onBattleOver }: Props) {
  const game = useGameState();
  const { user, enemy, turn } = game;

  const { playCard } = useActions();
  const { canUndo, undo } = useUndo();

  const [isPlaying, setIsPlaying] = useState(false);

  const [userBattleEvents, setUserBattleEvents] = useState<BattleEvent[]>([]);
  const [enemyBattleEvents, setEnemyBattleEvents] = useState<BattleEvent[]>([]);

  const userProfileRef = useRef<HTMLDivElement>(null);
  const enemyProfileRef = useRef<HTMLDivElement>(null);

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
    if (user.health <= 0 || enemy.health <= 0) {
      onBattleOver();
    }
  }, [user.health, enemy.health, onBattleOver]);

  return (
    <Root>
      <IconsRow>
        <Label>
          <Icon src={livesImage} />
          <div>3 lives</div>
        </Label>

        <Label>
          <Icon src={battleImage} />
          <div>round 2</div>
        </Label>
      </IconsRow>

      <PlayersRow>
        <Player className={getIsUserTurn(game) ? 'active' : ''}>
          <PlayerProfile
            src={user.image}
            profileRef={userProfileRef}
            battleEvents={userBattleEvents}
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
        <CardStack
          cards={enemy.cards}
          currentCardIndex={enemy.currentCardIndex}
          targetElement={userProfileRef.current}
          playerType="enemy"
          turn={turn}
        />
      </CardStackRow>

      <BattleControls
        onBack={handleUndo}
        canGoBack={canUndo}
        onTogglePlay={handleTogglePlayPause}
        isPlaying={isPlaying}
        onNext={handlePlayNextCard}
      />
    </Root>
  );
}

const Root = styled(Container)``;

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
  background-color: var(--color-bg-opacity);
  justify-content: center;
  padding: 0 0.5rem;

  ${getHandDrawnBorderRadius()}
  border: solid 0.75rem var(--color-bg-opacity);

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
