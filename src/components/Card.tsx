import styled, { css } from 'styled-components';

import { CardState } from '../gameState';
import { STATUS_EFFECT_SYMBOLS } from './StatusEffects';

interface Props {
  card: CardState;
  isActive?: boolean;
  scale?: number;
  className?: string;
  onClick?: () => void;
}

function getCardText(card: CardState) {
  const selfEffects = card.self;
  const targetEffects = card.target;

  const message = [];
  if (targetEffects?.damage != null) {
    message.push(<Number key="damage">{targetEffects.damage}</Number>, `⚔️`, ' ');
  }
  if (targetEffects?.statusEffects?.bleed != null) {
    message.push(
      <Number key="bleed">{targetEffects.statusEffects.bleed}</Number>,
      STATUS_EFFECT_SYMBOLS.bleed,
      ' ',
    );
  }
  if (selfEffects?.statusEffects?.extraCardPlays != null) {
    message.push(
      <Number key="extraCardPlayers">{selfEffects?.statusEffects?.extraCardPlays}</Number>,
      STATUS_EFFECT_SYMBOLS.extraCardPlays,
      ' ',
    );
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
