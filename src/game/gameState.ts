export interface GameState {
  counter: number;
  won: boolean;
}

export function createGameState(): GameState {
  return {
    counter: 0,
    won: false,
  };
}
