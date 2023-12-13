import { endTurn, playCard, processEvent, startGame, startRound, startTurn } from './actions';
import { GameState, createInitialGameState } from '../';

let game: GameState;
beforeEach(() => {
  game = createInitialGameState();
});

it('plays a damaging card', () => {
  startGame(game);
  startRound(game);

  const startingOpponentHealth = game.opponent.health;
  game.user.cards = [{ text: 'dmg 1' }];

  startTurn(game);

  playCard(game);
  processEvent(game);

  endTurn(game);

  expect(startingOpponentHealth - game.opponent.health).toBe(1);
});
