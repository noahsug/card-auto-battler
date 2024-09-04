import { Value, Card } from './engine';
import chalk from 'chalk';

const readableSuits = { heart: '♥', diamond: '♦', club: '♣', spade: '♠' };

export const CARD_VALUE_TO_NUMERIC_VALUE: Record<Value, number> = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

export function getReadableCard({ value, suit }: Card) {
  const colorFn = suit === 'heart' || suit === 'diamond' ? chalk.red : chalk.black;
  return colorFn(`${value}${readableSuits[suit]}`);
}

export function getReadableCards(cards: Card[]) {
  return sortCards(cards).map(getReadableCard).join(' ');
}

export function sortCards(cards: Card[]) {
  return cards.slice().sort((a, b) => {
    const numericValueA = CARD_VALUE_TO_NUMERIC_VALUE[a.value];
    const numericValueB = CARD_VALUE_TO_NUMERIC_VALUE[b.value];
    return numericValueA - numericValueB || a.suit.localeCompare(b.suit);
  });
}
