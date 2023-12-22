import { endTurn, playCard, startGame, startBattle, startTurn } from './actions';
import { GameState, createInitialGameState } from '../';

let game: GameState;
beforeEach(() => {
  game = createInitialGameState();
});

it('plays a damaging card', () => {
  startGame(game);
  startBattle(game);

  const startingOpponentHealth = game.opponent.health;
  game.user.cards = [{ text: 'dmg 1' }];

  startTurn(game);
  playCard(game);
  endTurn(game);

  expect(startingOpponentHealth - game.opponent.health).toBe(1);
});

it('plays a card that allows a 2nd card to be played', () => {
  startGame(game);
  startBattle(game);

  const startingOpponentHealth = game.opponent.health;
  game.user.cards = [{ text: 'dmg 1, actions 1' }, { text: 'dmg 1' }];

  startTurn(game);
  playCard(game);
  playCard(game);
  endTurn(game);

  expect(startingOpponentHealth - game.opponent.health).toBe(2);
});
