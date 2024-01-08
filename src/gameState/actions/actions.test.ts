import { endTurn, playCard, startGame, startBattle, startTurn } from './actions';
import { GameState, createInitialGameState } from '../';
import { BLEED_DAMAGE } from '../gameState';

let game: GameState;
beforeEach(() => {
  game = createInitialGameState();
});

describe('damage effect', () => {
  it('reduces health', () => {
    startGame(game);
    startBattle(game);

    const startingOpponentHealth = game.opponent.health;
    game.user.cards = [{ target: { damage: 1 } }];

    startTurn(game);
    playCard(game);

    expect(startingOpponentHealth - game.opponent.health).toBe(1);
  });
});

describe('multihit effect', () => {
  it('deals damage twice', () => {
    startGame(game);
    startBattle(game);

    const startingOpponentHealth = game.opponent.health;
    game.user.cards = [{ target: { damage: 1, multihit: 1 } }];

    startTurn(game);
    playCard(game);

    expect(startingOpponentHealth - game.opponent.health).toBe(2);
  });
  it('applies effects twice', () => {
    startGame(game);
    startBattle(game);

    game.user.cards = [{ target: { statusEffects: { bleed: 1 }, multihit: 1 } }];

    startTurn(game);
    playCard(game);

    expect(game.opponent.statusEffects.bleed).toBe(2);
  });
});

describe('bleed status effect', () => {
  it('is decreased when damage is delt', () => {
    startGame(game);
    startBattle(game);

    const startingOpponentHealth = game.opponent.health;
    game.user.cards = [
      { target: { statusEffects: { bleed: 1 } } },
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

    expect(game.opponent.statusEffects.bleed).toBe(0);
    expect(game.opponent.health).toBe(startingOpponentHealth - BLEED_DAMAGE - 1 - 1);
  });

  it('does not apply to damage delt at the same time as bleed is applied', () => {
    const startingOpponentHealth = game.opponent.health;
    game.user.cards = [{ target: { damage: 1, statusEffects: { bleed: 1 } } }];

    startTurn(game);
    playCard(game); // bleed 1, dmg 1

    expect(game.opponent.statusEffects.bleed).toBe(1);
    expect(game.opponent.health).toBe(startingOpponentHealth - 1);
  });
});

describe('extraCardPlays status effect', () => {
  it('plays an extra card', () => {
    startGame(game);
    startBattle(game);

    const startingOpponentHealth = game.opponent.health;
    game.user.cards = [
      { target: { damage: 1 }, self: { statusEffects: { extraCardPlays: 1 } } },
      { target: { damage: 1 } },
    ];

    startTurn(game);
    playCard(game); // dmg 1, extraCardPlays 1
    playCard(game); // dmg 1

    expect(startingOpponentHealth - game.opponent.health).toBe(2);
  });
});
