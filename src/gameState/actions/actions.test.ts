import { startTurn } from './actions';
import { GameState, createInitialGameState } from '../';

let game: GameState;
beforeEach(() => {
  game = createInitialGameState();
});

describe('startTurn', () => {
  it('handles damage', () => {
    game.user.cards = [{ text: 'dmg 1' }];

    const opponentStartingHealth = game.opponent.health;

    startTurn();

    expect(game.opponent.health).toEqual(opponentStartingHealth - 1);
  });
});
