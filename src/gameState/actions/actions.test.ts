import { endTurn, playCard, startGame, startBattle, startTurn } from './actions';
import { GameState, createInitialGameState } from '../';
import { BLEED_DAMAGE } from '../gameState';

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

  expect(startingOpponentHealth - game.opponent.health).toBe(1);
});

describe('bleed effect', () => {
  it('is decreased when damage is delt', () => {
    startGame(game);
    startBattle(game);

    const startingOpponentHealth = game.opponent.health;
    game.user.cards = [{ text: 'bleed 1' }, { text: 'dmg 1' }, { text: 'dmg 1' }];
    game.opponent.cards = [{ text: 'dmg 0' }, { text: 'dmg 0' }];

    startTurn(game);
    playCard(game); // bleed 1
    endTurn(game);

    // opponent turn
    startTurn(game);
    playCard(game);
    endTurn(game);

    startTurn(game);
    playCard(game); // dmg 1 (with bleed 1 applied)
    endTurn(game);

    // opponent turn
    startTurn(game);
    playCard(game);
    endTurn(game);

    startTurn(game);
    playCard(game); // dmg 1 (without any bleed)
    endTurn(game);

    expect(game.opponent.effects.bleed).toBe(0);
    expect(game.opponent.health).toBe(startingOpponentHealth - BLEED_DAMAGE - 1 - 1);
  });

  it('does not apply to damage delt at the same time as bleed is applied', () => {
    const startingOpponentHealth = game.opponent.health;
    game.user.cards = [{ text: 'bleed 1, dmg 1' }];

    startTurn(game);
    playCard(game); // bleed 1, dmg 1

    expect(game.opponent.effects.bleed).toBe(1);
    expect(game.opponent.health).toBe(startingOpponentHealth - 1);
  });
});

it('gains a bonus action', () => {
  startGame(game);
  startBattle(game);

  const startingOpponentHealth = game.opponent.health;
  game.user.cards = [{ text: 'dmg 1, extraCardPlays 1' }, { text: 'dmg 1' }];

  startTurn(game);
  playCard(game); // dmg 1, extraCardPlays 1
  playCard(game); // dmg 1

  expect(startingOpponentHealth - game.opponent.health).toBe(2);
});
