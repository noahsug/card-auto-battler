import styled from 'styled-components';

import Card from './Card';
import HealthBar from './HealthBar';
import StatusEffects from './StatusEffects';
import { useGameState } from './GameStateContext';
import { Screen } from './shared';
import { getCurrentCard, CardState } from '../gameState';

interface Props {
  isOpponent: boolean;
  activeCard?: CardState;
}

export default function Player({ isOpponent, activeCard }: Props) {
  const game = useGameState();
  const { opponent, user } = game;

  const player = isOpponent ? opponent : user;
  const { health, maxHealth } = player;

  const card = activeCard || getCurrentCard(player);

  return (
    <Root>
      <CardContainer>
        <Card card={card} isActive={!!activeCard} />
      </CardContainer>
      <StatusEffects />
      <HealthBar health={health} maxHealth={maxHealth} />
    </Root>
  );
}

const Root = styled(Screen)`
  margin-bottom: 20rem;
`;

const CardContainer = styled.div`
  margin-bottom: 30rem;
`;
