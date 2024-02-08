import clonedeep from 'lodash/clonedeep';
import merge from 'lodash/merge';

import { endTurn, playCard, startGame, startBattle, startTurn } from './actions';
import {
  BLEED_DAMAGE,
  CardEffects,
  CardState,
  MAX_TURNS_IN_BATTLE,
  PlayerState,
  createInitialGameState,
  getCanPlayCard,
  getIsBattleOver,
  getIsEnemyTurn,
} from '../gameState';
import { createCard } from '../utils';

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
  game.user.cards = user?.cards || [createCard({ target: 'opponent', damage: 0 })];
  game.enemy.cards = enemy?.cards || [createCard({ target: 'opponent', damage: 0 })];

  let userCardsPlayed = 0;

  while (game.turn <= stopAfterTurn && userCardsPlayed < stopAfterNUserCardsPlayed) {
    startTurn(game);

    while (getCanPlayCard(game) && userCardsPlayed < stopAfterNUserCardsPlayed) {
      playCard(game);
      if (!getIsEnemyTurn(game)) {
        userCardsPlayed++;
      }

      if (getIsBattleOver(game)) return { endingState: game, startingState };
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
  it('reduces opponent health', () => {
    const { endingState, startingState } = playCards([
      createCard({ target: 'opponent', damage: 1 }),
    ]);

    expect(startingState.enemy.health - endingState.enemy.health).toBe(1);
  });

  it('reduces own health', () => {
    const { endingState, startingState } = playCards([createCard({ target: 'self', damage: 1 })]);

    expect(startingState.user.health - endingState.user.health).toBe(1);
  });
});

describe('heal effect', () => {
  const { endingState, startingState } = playCards([createCard({ target: 'self', heal: 1 })]);

  expect(startingState.user.health - endingState.user.health).toBe(-1);
});

describe('dodge effect', () => {
  it('dodges the next source of damage', () => {
    const userCards: CardState[] = [createCard({ target: 'self', dodge: 1 })];
    const enemyCards: CardState[] = [createCard({ target: 'opponent', damage: 1 })];
    const { endingState, startingState } = runBattle({
      user: { cards: userCards },
      enemy: { cards: enemyCards },
      stopAfterNUserCardsPlayed: userCards.length,
    });

    expect(startingState.user.health).toBe(endingState.user.health);
  });
});

describe('trash effect', () => {
  it('trashes the played card', () => {
    const userCards = [
      createCard({ trashSelf: true, target: 'opponent', damage: 3 }),
      createCard({ target: 'opponent', damage: 1 }),
    ];
    const { endingState, startingState } = runBattle({
      user: { cards: userCards },
      stopAfterTurn: 4, // 3 player turns
    });

    expect(startingState.enemy.health - endingState.enemy.health).toBe(3 + 1 + 1);
  });

  it('trashes next two cards', () => {
    const userCards = [
      createCard({ target: 'opponent', damage: 1 }),
      createCard({ target: 'opponent', damage: 2 }),
      createCard({ trash: 4, target: 'self' }, { target: 'opponent', damage: 3 }),
      createCard({ target: 'opponent', damage: 4 }),
      createCard({ target: 'opponent', damage: 5 }),
      createCard({ target: 'opponent', damage: 6 }),
    ];
    const { endingState, startingState } = runBattle({
      user: { cards: userCards },
      stopAfterNUserCardsPlayed: 4,
    });

    expect(endingState.user.cards.length).toBe(2);
    expect(startingState.enemy.health - endingState.enemy.health).toBe(1 + 2 + 3 + 2);
  });

  it('trash X does not trash current card', () => {
    const userCards = [
      createCard({ trash: 4, target: 'self' }, { target: 'opponent', damage: 3 }),
      createCard({ target: 'opponent', damage: 1 }),
    ];
    const { endingState, startingState } = runBattle({
      user: { cards: userCards },
      stopAfterNUserCardsPlayed: 2,
    });

    expect(endingState.user.cards.length).toBe(1);
    expect(startingState.enemy.health - endingState.enemy.health).toBe(3 + 3);
  });

  it('causes a loss when no cards are left', () => {
    const userCards = [createCard({ trashSelf: true, target: 'opponent', damage: 1 })];
    const { endingState } = runBattle({
      user: { cards: userCards },
      stopAfterTurn: 2, // 2 player turns
    });

    expect(endingState.user.health).toBe(0);
  });

  it('causes a win when the opponent has no cards left', () => {
    const userCards = [createCard({ target: 'opponent', trash: 1 })];
    const { endingState } = runBattle({
      user: { cards: userCards },
      stopAfterTurn: 1, // 1 opponent turn
    });

    expect(endingState.enemy.health).toBe(0);
  });

  it('does not cause a loss when final trashed card wins the game', () => {
    const userCards = [createCard({ trashSelf: true, target: 'opponent', damage: 10 })];
    const { endingState } = runBattle({
      user: { cards: userCards },
      stopAfterTurn: 2, // 2 player turns
    });

    expect(endingState.enemy.health).toBe(0);
    expect(endingState.user.health).not.toBe(0);
  });
});

describe('activations effect', () => {
  it('deals damage N times', () => {
    const { endingState, startingState } = playCards([
      createCard({ target: 'opponent', damage: 1, activations: 2 }),
    ]);

    expect(startingState.enemy.health - endingState.enemy.health).toBe(2);
  });

  it('applies effects N times', () => {
    const { endingState } = playCards([
      createCard({ target: 'opponent', bleed: 1, activations: 2 }),
    ]);

    expect(endingState.enemy.bleed).toBe(2);
  });
});

describe('gainEffects', () => {
  it('applies strength twice', () => {
    const strengthEffectsTwice: CardEffects = {
      target: 'opponent',
      gainEffectsList: [
        {
          effects: { damage: 1 },
          forEveryPlayerValue: {
            target: 'self',
            name: 'strength',
          },
        },
      ],
    };

    const { endingState, startingState } = playCards([
      createCard({ target: 'self', strength: 2 }),
      createCard({ ...strengthEffectsTwice, damage: 2 }),
    ]);
    expect(startingState.enemy.health - endingState.enemy.health).toBe(6);
  });

  it('doubles strength', () => {
    const doubleStrength: CardState = createCard({
      target: 'self',
      gainEffectsList: [
        {
          effects: { strength: 1 },
          forEveryPlayerValue: {
            target: 'self',
            name: 'strength',
          },
        },
      ],
    });

    const { endingState } = playCards([
      createCard({ target: 'self', strength: 2 }),
      doubleStrength,
    ]);
    expect(endingState.user.strength).toBe(4);
  });

  describe('damage for each bleed', () => {
    const forEachOpponentBleed: CardEffects = {
      target: 'opponent',
      activations: 0,
      gainEffectsList: [
        {
          effects: { activations: 1 },
          forEveryPlayerValue: {
            target: 'opponent',
            name: 'bleed',
          },
        },
      ],
    };

    it('repeats card enemy bleed - 1 times', () => {
      const { endingState, startingState } = playCards([
        createCard({ target: 'opponent', bleed: 2 }),
        createCard({ ...forEachOpponentBleed, damage: 1 }),
      ]);
      expect(startingState.enemy.health - endingState.enemy.health).toBe(BLEED_DAMAGE * 2 + 2);
      expect(endingState.enemy.bleed).toBe(0);
    });

    it('causes the card to do nothing when opponent has no bleed', () => {
      const { endingState, startingState } = playCards([
        createCard({ ...forEachOpponentBleed, damage: 1 }),
      ]);
      expect(startingState.enemy.health - endingState.enemy.health).toBe(0);
    });

    it('does not count bleed inflicted at the same time', () => {
      const { endingState, startingState } = playCards([
        createCard({ target: 'opponent', bleed: 2 }),
        createCard({ ...forEachOpponentBleed, damage: 1, bleed: 50 }),
      ]);
      expect(startingState.enemy.health - endingState.enemy.health).toBe(BLEED_DAMAGE * 2 + 2);
      expect(endingState.enemy.bleed).toBe(50 * 2);
    });

    it('is additive with existing activations', () => {
      const { endingState, startingState } = playCards([
        createCard({ target: 'opponent', bleed: 2 }),
        createCard({ ...forEachOpponentBleed, damage: 1, activations: 2 }),
      ]);
      expect(startingState.enemy.health - endingState.enemy.health).toBe(BLEED_DAMAGE * 2 + 4);
    });
  });

  it('heals for each damage', () => {
    const healForEachDamage: CardEffects = {
      target: 'self',
      gainEffectsList: [
        {
          effects: { heal: 1 },
          forEveryBattleStat: 'damageDealt',
        },
      ],
    };

    const { endingState, startingState } = playCards([
      createCard({ target: 'opponent', damage: 2 }, healForEachDamage),
    ]);
    expect(startingState.enemy.health - endingState.enemy.health).toBe(2);
    expect(startingState.user.health - endingState.user.health).toBe(-2);
  });

  it('gains dodge for each hit', () => {
    const dodgeForEachHit: CardEffects = {
      target: 'self',
      gainEffectsList: [
        {
          effects: { dodge: 1 },
          forEveryBattleStat: 'numberOfHits',
        },
      ],
    };

    const { endingState, startingState } = playCards([
      createCard({ target: 'opponent', dodge: 1 }),
      createCard({ target: 'opponent', activations: 3, damage: 2 }, dodgeForEachHit),
    ]);
    expect(startingState.enemy.health - endingState.enemy.health).toBe(4);
    expect(endingState.user.dodge).toBe(2);
  });

  it('damage for each card played this turn', () => {
    const damageForEachCardPlayed: CardEffects = {
      target: 'opponent',
      damage: 1,
      gainEffectsList: [
        {
          effects: { damage: 1 },
          forEveryPlayerValue: {
            name: 'cardsPlayedThisTurn',
            target: 'self',
          },
        },
      ],
    };

    const { endingState, startingState } = playCards([
      createCard({ target: 'self', extraCardPlays: 1 }),
      createCard({ target: 'self', extraCardPlays: 1 }),
      createCard({ target: 'self', extraCardPlays: 1 }),
      createCard(damageForEachCardPlayed),
    ]);
    expect(startingState.enemy.health - endingState.enemy.health).toBe(4);
  });
});

describe('bleed status effect', () => {
  it('deals flat damage when damage is dealt', () => {
    const { endingState, startingState } = playCards([
      createCard({ target: 'opponent', bleed: 50 }),
      createCard({ target: 'opponent', damage: 1 }),
    ]);
    expect(startingState.enemy.health - endingState.enemy.health).toBe(BLEED_DAMAGE + 1);
  });

  it('decreases by 1 when damage is dealt', () => {
    const { endingState, startingState } = playCards([
      createCard({ target: 'opponent', bleed: 2 }),
      createCard({ target: 'opponent', activations: 2, damage: 1 }), // 7 damage
      createCard({ target: 'opponent', damage: 1 }), // 1 damage
    ]);
    expect(startingState.enemy.health - endingState.enemy.health).toBe(BLEED_DAMAGE * 2 + 3);
  });

  it('does not apply to damage dealt at the same time', () => {
    const { endingState, startingState } = playCards([
      createCard({ target: 'opponent', damage: 1, bleed: 1 }),
    ]);

    expect(startingState.enemy.health - endingState.enemy.health).toBe(1);
  });
});

describe('strength status effect', () => {
  it('increases card damage by N', () => {
    const { endingState, startingState } = playCards([
      createCard({ target: 'self', strength: 1 }),
      createCard({ target: 'opponent', damage: 1 }),
    ]);

    expect(startingState.enemy.health - endingState.enemy.health).toBe(2);
  });

  it('applies to damage dealt at the same time, depending on effect order', () => {
    const { endingState, startingState } = playCards([
      createCard({ target: 'opponent', damage: 1 }, { target: 'self', strength: 1 }), // 1 dmg
      createCard({ target: 'self', strength: 1 }, { target: 'opponent', damage: 1 }), // 3 dmg
      createCard({ target: 'opponent', damage: 0 }), // 2 dmg
    ]);

    expect(startingState.enemy.health - endingState.enemy.health).toBe(6);
  });
});

describe('extraCardPlays status effect', () => {
  it('plays an extra card', () => {
    const userCards: CardState[] = [
      createCard({ target: 'opponent', damage: 1 }, { target: 'self', extraCardPlays: 1 }),
      createCard({ target: 'opponent', damage: 1 }),
      createCard({ target: 'opponent', damage: 10 }), // should not be played
    ];
    const { endingState, startingState } = runBattle({
      user: { cards: userCards },
      stopAfterTurn: 0,
    });

    expect(startingState.enemy.health - endingState.enemy.health).toBe(2);
  });
});

describe('ends the game after X turns', () => {
  it('with the user winning if they have more health', () => {
    const userCards: CardState[] = [
      createCard({ trashSelf: true, target: 'opponent', damage: 1 }),
      createCard({ target: 'opponent', damage: 0 }),
    ];
    const { endingState } = runBattle({
      user: { cards: userCards },
      stopAfterTurn: MAX_TURNS_IN_BATTLE - 1,
    });

    expect(endingState.enemy.health).toBe(0);
  });

  it('with the enemy winning if they have more or equal health', () => {
    const { endingState } = runBattle({
      stopAfterTurn: MAX_TURNS_IN_BATTLE - 1,
    });

    expect(endingState.user.health).toBe(0);
  });
});
