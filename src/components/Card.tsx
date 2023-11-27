import styled from 'styled-components';

import rel from './shared/rel';
import { Card as CardState } from '../state/game';

interface Props {
  card: CardState;
  isActive?: boolean;
  scale?: number;
}

export default function Card({ card, isActive = false, scale = 1 }: Props) {
  // const game = useGame();
  //
  // const isOpponentTurn = getIsOpponentTurn(game);
  // const isActive = !forceInactive && (isOpponent ? isOpponentTurn : !isOpponentTurn);
  //
  // const { opponent, user } = game;
  // const player = isOpponent ? opponent : user;

  return (
    <CardContainer $isActive={isActive} $scale={scale}>
      {card.text}
    </CardContainer>
  );
}

const CardContainer = styled.div<{ $scale: number; $isActive: boolean }>`
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: transform 0.2s;
  margin: auto;

  width: ${({ $scale }) => rel($scale * 24)};
  height: ${({ $scale }) => rel($scale * 32)};
`;
