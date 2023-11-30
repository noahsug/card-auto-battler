import { startTurn } from './actions';
import { Game, createInitialGame } from '../';

let game: Game;
beforeEach(() => {
  game = createInitialGame();
});

describe('startTurn', () => {
  it('handles damage', () => {
    // state.acrds;

    startTurn();
    const cards = [];
  });
});
