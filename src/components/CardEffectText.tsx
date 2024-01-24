import styled from 'styled-components';

import { CardEffects, PlayerState } from '../gameState';
import { STATUS_EFFECT_SYMBOLS } from './StatusEffects';

interface Props {
  effectName: keyof CardEffectsithSymbols;
  value: number;
}

export type CardEffectsithSymbols = Omit<CardEffects, 'target' | 'effectBasedOnPlayerValue'>;

type NameWithSymbol = keyof (PlayerState & CardEffectsithSymbols);

export const CARD_TEXT_SYMBOLS: Record<NameWithSymbol, string> = {
  ...STATUS_EFFECT_SYMBOLS,
  damage: '⚔️',
  health: '❤️',
  maxHealth: 'max ❤️',
  repeat: 'x times',
  cards: 'cards in deck',
  trashedCards: 'trashed cards',
  currentCardIndex: 'cards in discard',
  cardsPlayedThisTurn: 'cards played this turn',
} as const;

export default function CardEffectText({ effectName, value }: Props) {
  const symbol = CARD_TEXT_SYMBOLS[effectName];

  if (effectName === 'repeat') {
    // repeat 1 = hit two times
    value += 1;
  }

  return (
    <CardText>
      <span>{value}</span>
      {symbol}
    </CardText>
  );
}

export const CardText = styled.div`
  margin: 0 4rem;
  display: inline-block;
`;
