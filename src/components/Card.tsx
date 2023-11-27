import styled, { css } from 'styled-components';

import rel from './shared/rel';
import { Card as CardState } from '../state/game';

interface Props {
  card: CardState;
  isActive?: boolean;
  scale?: number;
  className?: string;
}

export default function Card({ card, isActive = false, scale = 1, className }: Props) {
  return (
    <Container $isActive={isActive} $scale={scale} className={className}>
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

  width: ${({ $scale }) => rel($scale * 240)};
  height: ${({ $scale }) => rel($scale * 320)};

  ${({ $isActive }) =>
    $isActive &&
    css`
      transform: scale(1.2);
      box-shadow: ${rel(7)} ${rel(7)} ${rel(10)} 0 rgba(0, 0, 0, 0.5);
    `}
`;
