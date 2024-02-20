import styled from 'styled-components';

import Card from './Card';
import HealthBar from './HealthBar';
import StatusEffects from './StatusEffects';
import { Screen } from './shared';
import { getCurrentCard, CardState, PlayerState, createCard } from '../gameState';

interface Props {
  player: PlayerState;
  activeCard?: CardState;
  children?: React.ReactNode;
}

const EMPTY_CARD = createCard();

export default function Player({ player, activeCard, children }: Props) {
  const { health, startingHealth } = player;
  const card = activeCard || getCurrentCard(player) || EMPTY_CARD;

  return (
    <Root>
      <CardContainer>
        <Card card={card} isActive={!!activeCard} />
      </CardContainer>
      <StatusEffects statusEffects={player} />
      <HealthBar health={health} startingHealth={startingHealth} />
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
