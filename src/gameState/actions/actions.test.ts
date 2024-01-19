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
  getIsEnemyTurn,
} from '../gameState';

function runBattle({
  user,
  enemy,
  stopAfterTurn = Infinity,
  stopAfterNUserCardsPlayed = Infinity,
}: {
  user?: Partial<PlayerState>;
  enemy?: Partial<PlayerState>;
  stopAfterTurn?: number;
  stopAfterNUserCardsPlayed?: number;
}) {
  const game = merge(
    createInitialGameState(),
    { user: { maxHealth: 10 }, enemy: { maxHealth: 10 } },
    { user, enemy },
  );

  startGame(game);
  startBattle(game);

  const startingState = clonedeep(game);

  // unshuffle the cards
  game.user.cards = user?.cards || [{ opponent: { damage: 0 } }];
  game.enemy.cards = enemy?.cards || [{ opponent: { damage: 0 } }];

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
      if (!getIsEnemyTurn(game)) {
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
    const { endingState, startingState } = playCards([{ opponent: { damage: 1 } }]);

    expect(startingState.enemy.health - endingState.enemy.health).toBe(1);
  });
});

describe('dodge effect', () => {
  it('dodges the next source of damage', () => {
    const userCards: CardState[] = [{ self: { statusEffects: { dodge: 1 } } }];
    const enemyCards: CardState[] = [{ opponent: { damage: 1 } }];
    const { endingState, startingState } = runBattle({
      user: { cards: userCards },
      enemy: { cards: enemyCards },
      stopAfterNUserCardsPlayed: userCards.length,
    });

    expect(startingState.user.health).toBe(endingState.user.health);
  });
});

describe('repeat effect', () => {
  it('deals damage N times', () => {
    const { endingState, startingState } = playCards([{ opponent: { damage: 1, repeat: 1 } }]);

    expect(startingState.enemy.health - endingState.enemy.health).toBe(2);
  });

  it('applies effects N times', () => {
    const { endingState } = playCards([{ opponent: { statusEffects: { bleed: 1 }, repeat: 1 } }]);

    expect(endingState.enemy.statusEffects.bleed).toBe(2);
  });
});

describe('gainEffectBasedOnEffect effect', () => {
  describe('for each bleed', () => {
    let forEachEnemyBleed: CardState;
    beforeEach(() => {
      forEachEnemyBleed = {
        opponent: {
          repeat: -1,
          effectBasedOnPlayerValue: {
            effect: {
              isStatusEffect: false,
              name: 'repeat',
            },
            basedOn: {
              target: 'opponent',
              isStatusEffect: true,
              name: 'bleed',
            },
            ratio: 1,
          },
        },
      };
    });

    it('repeats card enemy bleed - 1 times', () => {
      const { endingState, startingState } = playCards([
        { opponent: { statusEffects: { bleed: 2 } } },
        merge(forEachEnemyBleed, { opponent: { damage: 1 } }),
      ]);
      expect(startingState.enemy.health - endingState.enemy.health).toBe(BLEED_DAMAGE * 2 + 2);
      expect(endingState.enemy.statusEffects.bleed).toBe(0);
    });

    it('causes the card to do nothing when opponent has no bleed', () => {
      const { endingState, startingState } = playCards([
        merge(forEachEnemyBleed, { opponent: { damage: 1 } }),
      ]);
      expect(startingState.enemy.health - endingState.enemy.health).toBe(0);
    });

    it('does not count bleed inflicted at the same time', () => {
      const { endingState, startingState } = playCards([
        { opponent: { statusEffects: { bleed: 2 } } },
        merge(forEachEnemyBleed, { opponent: { damage: 1, statusEffects: { bleed: 50 } } }),
      ]);
      expect(startingState.enemy.health - endingState.enemy.health).toBe(BLEED_DAMAGE * 2 + 2);
      expect(endingState.enemy.statusEffects.bleed).toBe(50 * 2);
    });

    it('is additive with existing repeat', () => {
      const { endingState, startingState } = playCards([
        { opponent: { statusEffects: { bleed: 2 } } },
        merge(forEachEnemyBleed, { opponent: { damage: 1, repeat: 1 } }),
      ]);
      expect(startingState.enemy.health - endingState.enemy.health).toBe(BLEED_DAMAGE * 2 + 4);
    });
  });
});

describe('bleed status effect', () => {
  it('deals flat damage when damage is delt', () => {
    const { endingState, startingState } = playCards([
      { opponent: { statusEffects: { bleed: 50 } } },
      { opponent: { damage: 1 } },
    ]);
    expect(startingState.enemy.health - endingState.enemy.health).toBe(BLEED_DAMAGE + 1);
  });

  it('decreases by 1 when damage is delt', () => {
    const { endingState, startingState } = playCards([
      { opponent: { statusEffects: { bleed: 2 } } },
      { opponent: { repeat: 1, damage: 1 } }, // 7 damage
      { opponent: { damage: 1 } }, // 1 damage
    ]);
    expect(startingState.enemy.health - endingState.enemy.health).toBe(BLEED_DAMAGE * 2 + 3);
  });

  it('does not apply to damage delt at the same time', () => {
    const { endingState, startingState } = playCards([
      { opponent: { damage: 1, statusEffects: { bleed: 1 } } },
    ]);

    expect(startingState.enemy.health - endingState.enemy.health).toBe(1);
  });
});

describe('strength status effect', () => {
  it('increases card damage by N', () => {
    const { endingState, startingState } = playCards([
      { self: { statusEffects: { strength: 1 } } },
      { opponent: { damage: 1 } },
    ]);

    expect(startingState.enemy.health - endingState.enemy.health).toBe(2);
  });

  it('does not apply to damage delt at the same time', () => {
    const { endingState, startingState } = playCards([
      { opponent: { damage: 1 }, self: { statusEffects: { strength: 1 } } },
      { opponent: { damage: 0 } },
    ]);

    expect(startingState.enemy.health - endingState.enemy.health).toBe(2);
  });
});

describe('extraCardPlays status effect', () => {
  it('plays an extra card', () => {
    const userCards: CardState[] = [
      { opponent: { damage: 1 }, self: { statusEffects: { extraCardPlays: 1 } } },
      { opponent: { damage: 1 } },
      { opponent: { damage: 10 } }, // should not be played
    ];
    const { endingState, startingState } = runBattle({
      user: { cards: userCards },
      stopAfterTurn: 1,
    });

    expect(startingState.enemy.health - endingState.enemy.health).toBe(2);
  });
});
