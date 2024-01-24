import styled from 'styled-components';

import Card from './Card';
import HealthBar from './HealthBar';
import StatusEffects from './StatusEffects';
import { Screen } from './shared';
import { getCurrentCard, CardState, PlayerState } from '../gameState';

interface Props {
  player: PlayerState;
  activeCard?: CardState;
  children?: React.ReactNode;
}

export default function Player({ player, activeCard, children }: Props) {
  const { health, maxHealth } = player;
  const card = activeCard || getCurrentCard(player);

  return (
    <Root>
      <CardContainer>
        <Card card={card} isActive={!!activeCard} />
      </CardContainer>
      <StatusEffects statusEffects={player} />
      <HealthBar health={health} maxHealth={maxHealth} />
      {children}
    </Root>
  );
}

const Root = styled(Screen)`
  margin-bottom: 20rem;
  position: relative;
`;

const CardContainer = styled.div`
  margin-bottom: 30rem;
`;
