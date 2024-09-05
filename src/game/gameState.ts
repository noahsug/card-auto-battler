export interface GameState {
  counter: number;
}

export function createNewGameState(): GameState {
  return {
    counter: 0,
  };
}
