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
  game.user.cards = [{ target: { damage: 1 } }];

  startTurn(game);
  playCard(game);

  expect(startingOpponentHealth - game.opponent.health).toBe(1);
});

describe('bleed effect', () => {
  it('is decreased when damage is delt', () => {
    startGame(game);
    startBattle(game);

    const startingOpponentHealth = game.opponent.health;
    game.user.cards = [
      { target: { effects: { bleed: 1 } } },
      { target: { damage: 1 } },
      { target: { damage: 1 } },
    ];
    game.opponent.cards = [{ target: { damage: 0 } }, { target: { damage: 0 } }];

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
    game.user.cards = [{ target: { damage: 1, effects: { bleed: 1 } } }];

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
  game.user.cards = [
    { target: { damage: 1 }, self: { effects: { extraCardPlays: 1 } } },
    { target: { damage: 1 } },
  ];

  startTurn(game);
  playCard(game); // dmg 1, extraCardPlays 1
  playCard(game); // dmg 1

  expect(startingOpponentHealth - game.opponent.health).toBe(2);
});
