import { useEffect } from 'react';
import { styled } from 'styled-components';

import { useActions, useGameState, useUndo } from './GameStateContext';
import Container from './shared/Container';
import HealthBar from './HealthBar';
import Card from './Card';

import userImage from '../images/characters/warrior.png';
import enemyImage from '../images/characters/green-monster.png';
import battleImage from '../images/swords.png';
import livesImage from '../images/heart.png';
import { getHandDrawnBorderRadius, maskImage } from '../style';

interface Props {
  onBattleOver: () => void;
}

export default function BattleScreen({ onBattleOver }: Props) {
  const { counter, won } = useGameState();
  const { increment } = useActions();
  const { canUndo, undo } = useUndo();

  async function handleIncrement() {
    increment();
  }

  useEffect(() => {
    if (won) {
      onBattleOver();
    }
  }, [onBattleOver, won]);

  return (
    <Container>
      <Row>
        <Label>
          <Icon src={livesImage} />
          <div>3 lives</div>
        </Label>

        <Label>
          <Icon src={battleImage} />
          <div>round 2</div>
        </Label>
      </Row>

      <Row>
        <Player>
          <Profile src={userImage} />
          <HealthBar health={10} maxHealth={10} />
        </Player>

        <Player>
          <Profile src={enemyImage} />
          <HealthBar health={10} maxHealth={10} />
        </Player>
      </Row>

      <Row>
        <Card size="small" type="user" />
        <Card size="small" type="enemyGreen" />
      </Row>
    </Container>
  );
}

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
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
