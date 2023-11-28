import styled from 'styled-components';

import Card from './Card';
import HealthBar from './HealthBar';
import { useGame } from './GameContext';
import { Screen } from './shared';
import { getIsOpponentTurn, getActiveCard } from '../state/game';

interface Props {
  isOpponent: boolean;
  forceInactive: boolean;
}

export default function Player({ isOpponent, forceInactive }: Props) {
  const game = useGame();
  const { opponent, user } = game;

  const player = isOpponent ? opponent : user;
  const { health, maxHealth } = player;

  const isOpponentTurn = getIsOpponentTurn(game);
  const isActive = !forceInactive && (isOpponent ? isOpponentTurn : !isOpponentTurn);

  const card = getActiveCard(player);

  return (
    <Root>
      <CardContainer>
        <Card card={card} isActive={isActive} />
      </CardContainer>
      <HealthBar health={health} maxHealth={maxHealth} />
    </Root>
  );
}

const Root = styled(Screen)`
  margin-bottom: 20rem;
`;

const CardContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;
