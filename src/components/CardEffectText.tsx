import styled from 'styled-components';

import { CardEffects, PlayerState } from '../gameState';
import { STATUS_EFFECT_SYMBOLS } from './StatusEffects';
import { Conditional } from '../gameState/gameState';

interface Props {
  effectName: keyof CardEffectsWithSymbols;
  value: number;
}

export type CardEffectsWithSymbols = Omit<
  CardEffects,
  'target' | 'trashSelf' | 'gainEffectsList' | 'growEffectsList' | keyof Conditional<unknown>
>;

type NameWithSymbol = keyof (PlayerState & CardEffectsWithSymbols);

export const CARD_TEXT_SYMBOLS: Record<NameWithSymbol, string> = {
  ...STATUS_EFFECT_SYMBOLS,
  damage: '⚔️',
  randomNegativeStatusEffects: 'random negative effect',
  randomPositiveStatusEffects: 'random positive effect',
  activations: 'x times',
  trash: 'trash',
  health: '❤️',
  maxHealth: 'max ❤️',
  cards: 'cards in deck',
  currentCardIndex: 'cards in discard',
  cardsPlayedThisTurn: 'cards played this turn',
  trashedCards: 'trashed cards',
} as const;

export default function CardEffectText({ effectName, value }: Props) {
  const symbol = CARD_TEXT_SYMBOLS[effectName];

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
