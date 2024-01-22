import { CardEffects, CardState } from './gameState';

export function createCustomCard(
  cardState: Omit<CardState, 'effects'>,
  ...cardEffects: CardEffects[]
): CardState {
  return {
    effects: cardEffects,
    ...cardState,
  };
}

export function createCard(...cardEffects: CardEffects[]): CardState {
  return {
    effects: cardEffects,
  };
}

export function extendCard(card: CardState, ...cardEffects: CardEffects[]): CardState {
  return {
    ...card,
    effects: [...card.effects, ...cardEffects],
  };
}
