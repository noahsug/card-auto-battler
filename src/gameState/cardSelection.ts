import { starterCards, nonStarterCards } from './cards';
import { STARTING_CARDS, CARD_SELECTION_OPTIONS } from './constants';

export function getCardSelectionsForBattle() {
  const cards = [];
  for (let i = 0; i < CARD_SELECTION_OPTIONS; i++) {
    const card = nonStarterCards[Math.floor(Math.random() * nonStarterCards.length)];
    cards.push(card);
  }
  return cards;
}

export function getStartingCards() {
  const cards = [];
  for (let i = 0; i < STARTING_CARDS; i++) {
    const card = starterCards[Math.floor(Math.random() * starterCards.length)];
    cards.push(card);
  }
  return cards;
}
