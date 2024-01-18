import clonedeep from 'lodash/clonedeep';
import merge from 'lodash/merge';

import { endTurn, playCard, startGame, startBattle, startTurn } from './actions';
import { createInitialGameState } from '../';
import {
  BLEED_DAMAGE,
  CardState,
  PlayerState,
  getCanPlayCard,
  getIsBattleOver,
  getIsOpponentTurn,
} from '../gameState';

function runBattle({
  user,
  opponent,
  stopAfterTurn = Infinity,
  stopAfterNUserCardsPlayed = Infinity,
}: {
  user?: Partial<PlayerState>;
  opponent?: Partial<PlayerState>;
  stopAfterTurn?: number;
  stopAfterNUserCardsPlayed?: number;
}) {
  const game = merge(
    createInitialGameState(),
    { user: { maxHealth: 10 }, opponent: { maxHealth: 10 } },
    { user, opponent },
  );

  startGame(game);
  startBattle(game);

  const startingState = clonedeep(game);

  // unshuffle the cards
  game.user.cards = user?.cards || [{ target: { damage: 0 } }];
  game.opponent.cards = opponent?.cards || [{ target: { damage: 0 } }];

  let userCardsPlayed = 0;

  while (
    !getIsBattleOver(game) &&
    game.turn < stopAfterTurn &&
    userCardsPlayed < stopAfterNUserCardsPlayed
  ) {
    startTurn(game);

    while (
      !getIsBattleOver(game) &&
      getCanPlayCard(game) &&
      userCardsPlayed < stopAfterNUserCardsPlayed
    ) {
      playCard(game);
      if (!getIsOpponentTurn(game)) {
        userCardsPlayed++;
      }
    }

    endTurn(game);
  }

  return { endingState: game, startingState };
}

function playCards(cards: CardState[]) {
  return runBattle({
    user: { cards },
    stopAfterNUserCardsPlayed: cards.length,
  });
}

describe('damage effect', () => {
  it('reduces health', () => {
    const { endingState, startingState } = playCards([{ target: { damage: 1 } }]);

    expect(startingState.opponent.health - endingState.opponent.health).toBe(1);
  });
});

describe('dodge effect', () => {
  it('dodges the next source of damage', () => {
    const userCards: CardState[] = [{ self: { statusEffects: { dodge: 1 } } }];
    const opponentCards: CardState[] = [{ target: { damage: 1 } }];
    const { endingState, startingState } = runBattle({
      user: { cards: userCards },
      opponent: { cards: opponentCards },
      stopAfterNUserCardsPlayed: userCards.length,
    });

    expect(startingState.user.health).toBe(endingState.user.health);
  });
});

describe('repeat effect', () => {
  it('deals damage N times', () => {
    const { endingState, startingState } = playCards([{ target: { damage: 1, repeat: 1 } }]);

    expect(startingState.opponent.health - endingState.opponent.health).toBe(2);
  });
  it('applies effects N times', () => {
    const { endingState } = playCards([{ target: { statusEffects: { bleed: 1 }, repeat: 1 } }]);

    expect(endingState.opponent.statusEffects.bleed).toBe(2);
  });
});

describe('gainEffectBasedOnEffect effect', () => {
  describe('for each bleed', () => {
    // TODO: rename to forEachOpponentBleed
    const forEachBleed: CardState = {
      self: {
        repeat: -1,
        effectBasedOnEffect: {
          effect: {
            target: 'self',
            isCardEffect: true,
            isStatusEffect: false,
            valueName: 'repeat',
          },
          basedOn: {
            target: 'target',
            isCardEffect: false,
            isStatusEffect: true,
            valueName: 'bleed',
          },
          ratio: 1,
        },
      },
    };

    it('repeats card target bleed - 1 times', () => {
      const { endingState, startingState } = playCards([
        { target: { statusEffects: { bleed: 2 } } },
        merge(forEachBleed, { target: { damage: 1 } }),
      ]);
      expect(startingState.opponent.health - endingState.opponent.health).toBe(
        BLEED_DAMAGE * 2 + 2,
      );
      expect(endingState.opponent.statusEffects.bleed).toBe(0);
    });
    it('causes the card to do nothing when target has no bleed', () => {
      const { endingState, startingState } = playCards([
        merge(forEachBleed, { target: { damage: 1 } }),
      ]);
      expect(startingState.opponent.health - endingState.opponent.health).toBe(0);
    });
    it('does not count bleed inflicted at the same time', () => {
      const { endingState, startingState } = playCards([
        { target: { statusEffects: { bleed: 2 } } },
        merge(forEachBleed, { target: { damage: 1, statusEffects: { bleed: 50 } } }),
      ]);

      expect(startingState.opponent.health - endingState.opponent.health).toBe(
        BLEED_DAMAGE * 2 + 2,
      );
      expect(endingState.opponent.statusEffects.bleed).toBe(50 * 2);
    });
    it('is additive with existing repeat', () => {
      const { endingState, startingState } = playCards([
        { target: { statusEffects: { bleed: 2 } } },
        merge(forEachBleed, { target: { damage: 1, repeat: 1 } }),
      ]);

      expect(startingState.opponent.health - endingState.opponent.health).toBe(
        BLEED_DAMAGE * 2 + 3,
      );
    });
  });
});

describe('bleed status effect', () => {
  it('deals flat damage when damage is delt', () => {
    const { endingState, startingState } = playCards([
      { target: { statusEffects: { bleed: 50 } } },
      { target: { damage: 1 } },
    ]);
    expect(startingState.opponent.health - endingState.opponent.health).toBe(BLEED_DAMAGE + 1);
  });
  it('decreases by 1 when damage is delt', () => {
    const { endingState, startingState } = playCards([
      { target: { statusEffects: { bleed: 2 } } },
      { target: { repeat: 1, damage: 1 } }, // 7 damage
      { target: { damage: 1 } }, // 1 damage
    ]);
    expect(startingState.opponent.health - endingState.opponent.health).toBe(BLEED_DAMAGE * 2 + 3);
  });
  it('does not apply to damage delt at the same time', () => {
    const { endingState, startingState } = playCards([
      { target: { damage: 1, statusEffects: { bleed: 1 } } },
    ]);

    expect(startingState.opponent.health - endingState.opponent.health).toBe(1);
  });
});

describe('strength status effect', () => {
  it('increases card damage by N', () => {
    const { endingState, startingState } = playCards([
      { self: { statusEffects: { strength: 1 } } },
      { target: { damage: 1 } },
    ]);

    expect(startingState.opponent.health - endingState.opponent.health).toBe(2);
  });
  it('does not apply to damage delt at the same time', () => {
    const { endingState, startingState } = playCards([
      { target: { damage: 1 }, self: { statusEffects: { strength: 1 } } },
      { target: { damage: 0 } },
    ]);

    expect(startingState.opponent.health - endingState.opponent.health).toBe(2);
  });
});

describe('extraCardPlays status effect', () => {
  it('plays an extra card', () => {
    const userCards: CardState[] = [
      { target: { damage: 1 }, self: { statusEffects: { extraCardPlays: 1 } } },
      { target: { damage: 1 } },
      { target: { damage: 10 } }, // should not be played
    ];
    const { endingState, startingState } = runBattle({
      user: { cards: userCards },
      stopAfterTurn: 1,
    });

    expect(startingState.opponent.health - endingState.opponent.health).toBe(2);
  });
});
