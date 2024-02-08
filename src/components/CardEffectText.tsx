import styled from 'styled-components';

import { CardEffects } from '../gameState';
import { STATUS_EFFECT_SYMBOLS } from './StatusEffects';
import {
  Conditional,
  IdentifiablePlayerValue,
  IdentifiableBattleStats,
} from '../gameState/gameState';

interface Props {
  effectName: CardEffectWithSymbols;
  value?: number;
}

export type CardEffectWithSymbols = keyof Omit<
  CardEffects,
  'target' | 'gainEffectsList' | 'growEffectsList' | keyof Conditional<unknown>
>;

type NameWithSymbol = CardEffectWithSymbols | IdentifiablePlayerValue | IdentifiableBattleStats;

export const CARD_TEXT_SYMBOLS: Record<NameWithSymbol, string> = {
  ...STATUS_EFFECT_SYMBOLS,

  damage: '⚔️',
  heal: '❤️',
  randomNegativeStatusEffects: 'random negative effect',
  randomPositiveStatusEffects: 'random positive effect',
  activations: 'x times',
  trash: 'trash',
  trashSelf: 'trash this card',

  health: 'health',
  maxHealth: 'max health',
  cards: 'cards in deck',
  currentCardIndex: 'cards in discard',
  cardsPlayedThisTurn: 'cards played this turn',
  trashedCards: 'trashed cards',

  damageDealt: 'damage dealt',
  healthRestored: 'health restored',
  numberOfHits: 'hits',
} as const;

export default function CardEffectText({ effectName, value }: Props) {
  const symbol = CARD_TEXT_SYMBOLS[effectName];

  return (
    <CardText>
      {value == null ? null : <span>{value}</span>}
      {symbol}
    </CardText>
  );
}

export const CardText = styled.div`
  margin: 0 4rem;
  display: inline-block;
`;
