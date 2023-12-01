import styled, { css } from 'styled-components';

import { CardState } from '../gameState';

interface Props {
  card: CardState;
  isActive?: boolean;
  scale?: number;
  className?: string;
  onClick?: () => void;
}

export default function Card({ card, isActive = false, scale = 1, className, onClick }: Props) {
  return (
    <Container $isActive={isActive} $scale={scale} className={className} onClick={onClick}>
      {card.text}
    </Container>
  );
}

const Container = styled.div<{ $scale: number; $isActive: boolean }>`
  border: 1px solid #ccc;
  border-radius: 4px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  width: ${({ $scale }) => $scale * 240}rem;
  height: ${({ $scale }) => $scale * 320}rem;

  ${({ $isActive }) =>
    $isActive &&
    css`
      transform: scale(1.2);
      box-shadow: 7rem 7rem 10rem 0 rgba(0, 0, 0, 0.5);
    `}
`;
