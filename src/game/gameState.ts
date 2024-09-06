export interface GameState {
  counter: number;
  won: boolean;
}

export function createNewGameState(): GameState {
  return {
    counter: 0,
    won: false,
  };
}
