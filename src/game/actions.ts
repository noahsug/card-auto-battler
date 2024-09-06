import { GameState } from './gameState';

export function increment(state: GameState, amount: number = 1) {
  state.counter += amount;
  if (state.counter === 5) {
    state.won = true;
  }
}

export function reset(state: GameState) {
  state.counter = 0;
  state.won = false;
}
