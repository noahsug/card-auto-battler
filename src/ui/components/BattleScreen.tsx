import { useEffect, useRef, useState } from 'react';
import { styled } from 'styled-components';

import { getHandDrawnBorderRadius, maskImage } from '../style';
import BattleControls from './BattleControls';
import CardStack from './CardStack';
import { useActions, useGameState, useUndo } from './GameStateContext';
import HealthBar from './HealthBar';
import Container from './shared/Container';

import livesImage from '../images/icons/heart.png';
import battleImage from '../images/icons/swords.png';

interface Props {
  onBattleOver: () => void;
}

export default function BattleScreen({ onBattleOver }: Props) {
  const { user, enemy } = useGameState();
  const { playCard } = useActions();
  const { canUndo, undo } = useUndo();
  const [isPlaying, setIsPlaying] = useState(false);

  const userProfile = useRef<HTMLImageElement>(null);
  const enemyProfile = useRef<HTMLImageElement>(null);

  function handleTogglePlayPause() {
    setIsPlaying((prev) => !prev);
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
        <Player>
          <Profile src={user.image} ref={userProfile} />
          <HealthBar health={user.health} maxHealth={user.startingHealth} />
        </Player>

        <Player>
          <Profile src={enemy.image} $flip={true} ref={enemyProfile} />
          <HealthBar health={enemy.health} maxHealth={enemy.startingHealth} />
        </Player>
      </PlayersRow>

      <CardStackRow>
        <CardStack
          cards={user.cards}
          currentCardIndex={user.currentCardIndex}
          target={enemyProfile.current}
        />
        <CardStack
          cards={enemy.cards}
          currentCardIndex={enemy.currentCardIndex}
          target={userProfile.current}
        />
      </CardStackRow>

      <BattleControls
        onBack={undo}
        canGoBack={canUndo}
        onTogglePlay={handleTogglePlayPause}
        isPlaying={isPlaying}
        onNext={playCard}
      />

      {/* <ActiveCardContainer>
        <Card size="medium" type="user" card="punch" />
      </ActiveCardContainer> */}
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
  flex: 3;
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
  display: flex;
  flex-direction: column;
  align-items: center;
`;

function getDropShadow() {
  const dropShadow = 'drop-shadow(0 0 0.04rem var(--color-primary))';
  return new Array(4).fill(dropShadow).join(' ');
}

const Profile = styled.img<{ $flip?: boolean }>`
  width: 12rem;
  margin-bottom: 0.5rem;
  filter: ${getDropShadow};
  transform: ${(props) => (props.$flip ? 'scaleX(-1)' : 'none')};
`;

const ActiveCardContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
`;
