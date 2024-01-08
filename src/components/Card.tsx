import styled, { css } from 'styled-components';

import { CardState } from '../gameState';

interface Props {
  card: CardState;
  isActive?: boolean;
  scale?: number;
  className?: string;
  onClick?: () => void;
}

function getCardText(card: CardState) {
  const message = [];
  if (card.target?.damage != null) {
    message.push(<Number key="damage">{card.target.damage}</Number>, `⚔️`, ' ');
  }
  if (card.target?.effects?.bleed != null) {
    message.push(<Number key="bleed">{card.target.effects.bleed}</Number>, `🩸`, ' ');
  }
  return message;
}

export default function Card({ card, isActive = false, scale = 1, className, onClick }: Props) {
  return (
    <Container $isActive={isActive} $scale={scale} className={className} onClick={onClick}>
      {getCardText(card)}
    </Container>
  );
}

const Container = styled.div<{ $scale: number; $isActive: boolean }>`
  border: 1px solid #ccc;
  border-radius: 4px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  width: ${({ $scale }) => $scale * 192}rem;
  height: ${({ $scale }) => $scale * 256}rem;

  ${({ $isActive }) =>
    $isActive &&
    css`
      transform: scale(1.2);
      box-shadow: 7rem 7rem 10rem 0 rgba(0, 0, 0, 0.5);
    `}
`;

const Number = styled.span``;
