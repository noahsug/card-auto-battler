import styled from 'styled-components';

import Card from './Card';
import HealthBar from './HealthBar';
import StatusEffects from './StatusEffects';
import { Screen } from './shared';
import { getCurrentCard, CardState, PlayerState } from '../gameState';

interface Props {
  player: PlayerState;
  activeCard?: CardState;
}

export default function Player({ player, activeCard }: Props) {
  const { health, maxHealth } = player;

  const card = activeCard || getCurrentCard(player);

  return (
    <Root>
      <CardContainer>
        <Card card={card} isActive={!!activeCard} />
      </CardContainer>
      <StatusEffects statusEffects={player} />
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
