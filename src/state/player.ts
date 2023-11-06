import { CardState } from './card';

export interface PlayerState {
  cards: CardState[];
  cardIndex: number;
  health: number;
  maxHealth: number;
}

export function createPlayerState(): PlayerState {
  const maxHealth = 30;

  return {
    cards: [],
    cardIndex: 0,
    health: maxHealth,
    maxHealth,
  };
}

export function getActiveCard(state: PlayerState) {
  return state.cards[state.cardIndex];
}
