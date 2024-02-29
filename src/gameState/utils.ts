import { CardEffects, CardState } from './gameState';

export function createCard(...effects: CardEffects[]): CardState {
  return { effects, name: '' };
}
