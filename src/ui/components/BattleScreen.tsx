import { useEffect } from 'react';
import { styled } from 'styled-components';

import { useActions, useGameState, useUndo } from './GameStateContext';
import Container from './shared/Container';
import HealthBar from './HealthBar';
import Card from './Card';
import { getHandDrawnBorderRadius, maskImage } from '../style';

import battleImage from '../images/icons/swords.png';
import livesImage from '../images/icons/heart.png';
import pauseImage from '../images/icons/pause.png';
import playImage from '../images/icons/play.png';
import nextImage from '../images/icons/arrow.png';
import CardStack from './CardStack';

interface Props {
  onBattleOver: () => void;
}

export default function BattleScreen({ onBattleOver }: Props) {
  const { user, enemy } = useGameState();
  // const { increment } = useActions();
  const { canUndo, undo } = useUndo();

  useEffect(() => {
    if (user.health <= 0 || enemy.health <= 0) {
      onBattleOver();
    }
  }, [onBattleOver]);

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
          <Profile src={user.image} />
          <HealthBar health={user.health} maxHealth={user.startingHealth} />
        </Player>

        <Player>
          <Profile src={enemy.image} />
          <HealthBar health={user.health} maxHealth={user.startingHealth} />
        </Player>
      </PlayersRow>

      <Row>
        <CardStack cards={user.cards} currentCardIndex={user.currentCardIndex} direction="left" />
        <CardStack
          cards={enemy.cards}
          currentCardIndex={enemy.currentCardIndex}
          direction="right"
        />
      </Row>

      <ControlsRow>
        <button>
          <img src={playImage} />
        </button>

        <button>
          <img src={pauseImage} />
        </button>

        <button>
          <img src={nextImage} />
        </button>
      </ControlsRow>

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

const Profile = styled.img`
  width: 12rem;
  margin-bottom: 0.5rem;
  filter: ${getDropShadow};
`;

const ControlsRow = styled(Row)`
  align-items: end;
  flex: 1;

  > button {
    background: none;
    border: none;
  }

  img {
    height: 2rem;
  }
`;

const ActiveCardContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
`;
