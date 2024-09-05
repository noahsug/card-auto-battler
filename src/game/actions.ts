import { GameState } from './gameState';

export function increment(state: GameState, amount: number = 1) {
  state.counter += amount;
}

export function reset(state: GameState) {
  state.counter = 0;
}
