import { relicsByType } from '../../content/relics';
import {
  createCard,
  createEffect,
  ifCompare,
  ifHas,
  value as v,
} from '../../content/utils/createCard';
import { diffValues } from '../../utils/objects';
import { BLEED_DAMAGE } from '../constants';
import {
  CardEffect,
  CardState,
  createGameState,
  PlayerState,
  SetValueCardEffect,
} from '../gameState';
import { applyCardEffects } from './applyCardEffects';

const {
  reduceLowDamage,
  regenForHighDamage,
  sharedPain,
  strengthAffectsHealing,
  strengthOnSelfDamage,
} = relicsByType;

let card: CardState;
let effect: CardEffect;

beforeEach(() => {
  card = structuredClone(createCard());
  effect = card.effects[0];
});

function getPlayCardResult({
  self: selfOverrides,
  opponent: opponentOverrides,
  turn: turnOverride,
}: {
  self?: Partial<PlayerState>;
  opponent?: Partial<PlayerState>;
  turn?: number;
} = {}) {
  const game = createGameState();
  game.turn = turnOverride || 0;

  const { user, enemy } = game;
  user.cards = [card, createCard(), createCard()];
  enemy.cards = [createCard(), createCard(), createCard()];

  const self = Object.assign(user, selfOverrides);
  const opponent = Object.assign(enemy, opponentOverrides);
  const init = structuredClone({ self, opponent });

  const events = applyCardEffects(game, card);

  const diff = diffValues(init, { self, opponent });
  return { self, opponent, init, diff, events };
}

describe('damage', () => {
  it('reduces opponent health', () => {
    const { diff } = getPlayCardResult();

    expect(diff).toEqual({ opponent: { health: -1 } });
  });

  it('can be dodged', () => {
    const { diff } = getPlayCardResult({ opponent: { dodge: 1 } });

    expect(diff).toEqual({ opponent: { dodge: -1 } });
  });

  it('is increased by strength', () => {
    const { diff } = getPlayCardResult({ self: { strength: 1 } });

    expect(diff).toEqual({ opponent: { health: -2 } });
  });

  it('triggers bleed', () => {
    const { diff } = getPlayCardResult({ opponent: { bleed: 1 } });

    const damage = 1 + BLEED_DAMAGE;
    expect(diff).toEqual({ opponent: { health: -damage, bleed: -1 } });
  });

  it('dealing 0 damage does not trigger bleed', () => {
    effect.value = v(0);
    const { diff } = getPlayCardResult({ opponent: { bleed: 1 } });

    expect(diff).toEqual({});
  });

  it('rounds damage down', () => {
    effect.value = v(1.5);
    const { diff } = getPlayCardResult();

    expect(diff).toEqual({ opponent: { health: -1 } });
  });
});

describe('self damage', () => {
  beforeEach(() => {
    effect.target = 'self';
  });

  it('reduces own health', () => {
    const { diff } = getPlayCardResult();

    expect(diff).toEqual({ self: { health: -1 } });
  });

  it('is not effected by dodge, strength or bleed', () => {
    const { diff } = getPlayCardResult({ self: { dodge: 1, strength: 1, bleed: 1 } });

    expect(diff).toEqual({ self: { health: -1 } });
  });
});

describe('heal', () => {
  beforeEach(() => {
    effect.type = 'heal';
  });

  it('increases opponent hp', () => {
    const { diff } = getPlayCardResult();

    expect(diff).toEqual({ opponent: { health: 1 } });
  });

  it('increases self hp', () => {
    effect.target = 'self';
    const { diff } = getPlayCardResult();

    expect(diff).toEqual({ self: { health: 1 } });
  });

  it('rounds heal down', () => {
    effect.value = v(1.5);
    const { diff } = getPlayCardResult();

    expect(diff).toEqual({ opponent: { health: 1 } });
  });
});

describe('set', () => {
  beforeEach(() => {
    effect.type = 'set';
  });

  it('sets health', () => {
    (effect as SetValueCardEffect).valueType = 'health';
    const { opponent } = getPlayCardResult();

    expect(opponent.health).toBe(1);
  });

  it('sets bleed', () => {
    (effect as SetValueCardEffect).valueType = 'bleed';
    effect.target = 'self';
    effect.value = v(0);
    const { diff } = getPlayCardResult({ self: { bleed: 4 } });

    expect(diff).toEqual({ self: { bleed: -4 } });
  });
});

// describe('trash cards', () => {
//   beforeEach(() => {
//     effect.name = 'trash';
//   });

//   it('trashes opponent cards', () => {
//     const { init, opponent } = getPlayCardResult();
//     const [c1, c2, c3] = init.opponent.cards;

//     expect(opponent.cards).toEqual([c2, c3]);
//     expect(opponent.trashedCards).toEqual([c1]);
//   });

//   it('trash own cards', () => {
//     effect.target = 'self';
//     const { init, self } = getPlayCardResult();
//     const [c1, c2, c3] = init.self.cards;

//     expect(self.cards).toEqual([c1, c3]);
//     expect(self.trashedCards).toEqual([c2]);
//   });

//   it(`trash opponent cards from the discard pile`, () => {
//     effect.value = v(2);
//     const { init, opponent } = getPlayCardResult({ opponent: { currentCardIndex: 1 } });
//     const [c1, c2, c3] = init.opponent.cards;

//     expect(opponent.cards).toEqual([c2]);
//     expect(opponent.trashedCards).toEqual([c3, c1]);
//     expect(opponent.currentCardIndex).toBe(0);
//   });

//   it('trashes entire opponent deck', () => {
//     effect.value = v(10);
//     const { opponent } = getPlayCardResult({ opponent: { currentCardIndex: 1 } });

//     expect(opponent.cards.length).toBe(0);
//     expect(opponent.currentCardIndex).toBe(0);
//   });
// });

describe('if', () => {
  beforeEach(() => {
    effect.if = {
      value: v('opponent', 'bleed'),
      comparison: '=',
      value2: v(0),
    };
  });

  it('skips the effect when false', () => {
    const { diff } = getPlayCardResult({ opponent: { bleed: 1 } });

    expect(diff).toEqual({});
  });

  it('does the effect when true', () => {
    const { diff } = getPlayCardResult();

    expect(diff).toEqual({ opponent: { health: -1 } });
  });

  it('compares to health', () => {
    effect.if = {
      value: v('self', 'health'),
      comparison: '<',
      value2: v(10),
    };

    const halfHealth = getPlayCardResult({ self: { health: 10 } });
    expect(halfHealth.diff).toEqual({});

    const lessThanHalfHealth = getPlayCardResult({ self: { health: 9 } });
    expect(lessThanHalfHealth.diff).toEqual({ opponent: { health: -1 } });
  });

  it('compares to percentGreen', () => {
    effect.if = ifCompare('self', 'percentGreen', '>=', 0.5);

    const basicCard = createCard();
    const greenCard = createCard([{}], { tribe: 'green' });

    const majorityBasic = getPlayCardResult({
      self: { cards: [basicCard, basicCard, greenCard] },
    });
    expect(majorityBasic.diff).toEqual({});

    const majorityGreen = getPlayCardResult({
      self: { cards: [basicCard, basicCard, greenCard, greenCard] },
    });
    expect(majorityGreen.diff).toEqual({ opponent: { health: -1 } });
  });

  it('compares to the previous card tribe', () => {
    effect.if = ifHas('self', 'prevCardIsGreen');

    const prevCardNotGreen = getPlayCardResult({
      self: { previousCard: createCard() },
    });
    expect(prevCardNotGreen.diff).toEqual({});

    const prevCardGreen = getPlayCardResult({
      self: { previousCard: createCard([{}], { tribe: 'green' }) },
    });
    expect(prevCardGreen.diff).toEqual({ opponent: { health: -1 } });
  });

  it('compares to damage dealt by the current card', () => {
    card.effects[1] = createEffect({
      type: 'bleed',
      value: v(3),
      if: ifCompare('opponent', 'cardDamageDealtToTarget', '>=', 7),
    });

    const smallDamage = getPlayCardResult();
    expect(smallDamage.diff).toEqual({ opponent: { health: -1 } });

    effect.value = v(7);
    const largeDamage = getPlayCardResult();
    expect(largeDamage.diff).toEqual({ opponent: { health: -7, bleed: 3 } });
  });

  it('compares to damage dealt this turn', () => {
    effect.if = ifCompare('self', 'damageDealtThisTurn', '>=', 7);

    const noDamage = getPlayCardResult({ self: { damageDealtThisTurn: 0 } });
    expect(noDamage.diff).toEqual({});

    const damage = getPlayCardResult({ self: { damageDealtThisTurn: 7 } });
    expect(damage.diff).toEqual({ opponent: { health: -1 } });
  });

  it('compares to damage dealt last turn', () => {
    effect.if = ifCompare('self', 'damageDealtLastTurn', '=', 0);

    const damage = getPlayCardResult({ self: { damageDealtLastTurn: 7 } });
    expect(damage.diff).toEqual({});

    const noDamage = getPlayCardResult({ self: { damageDealtLastTurn: 0 } });
    expect(noDamage.diff).toEqual({ opponent: { health: -1 } });
  });
});

describe('effect based on player value', () => {
  beforeEach(() => {
    effect.value = v('opponent', 'strength');
  });

  it('deals damage equal to opponent strength', () => {
    const { diff } = getPlayCardResult({ opponent: { strength: 2 } });

    expect(diff).toEqual({ opponent: { health: -2 } });
  });

  it('multiplies the player value by the multiplier', () => {
    effect.value = v('opponent', 'strength', 3);
    const { diff } = getPlayCardResult({ opponent: { strength: 2 } });

    expect(diff).toEqual({ opponent: { health: -6 } });
  });

  it('deals damage equal to self turns passed', () => {
    effect.value = v('self', 'turn');
    const { diff } = getPlayCardResult({ turn: 4 });

    expect(diff).toEqual({ opponent: { health: -2 } });
  });
});

describe('multi-hit', () => {
  beforeEach(() => {
    effect.multiHit = v(2);
  });

  it('deals damage twice', () => {
    const { diff } = getPlayCardResult({ self: { strength: 2 }, opponent: { bleed: 2 } });

    const damage = 2 * (3 + BLEED_DAMAGE);
    expect(diff).toEqual({ opponent: { health: -damage, bleed: -2 } });
  });

  it('deals damage 1 time for each opponent bleed', () => {
    effect.multiHit = v('opponent', 'bleed');
    const { diff } = getPlayCardResult({ opponent: { bleed: 2 } });

    const damage = 2 * (1 + BLEED_DAMAGE);
    expect(diff).toEqual({ opponent: { health: -damage, bleed: -2 } });
  });
});

describe('repeat', () => {
  beforeEach(() => {
    card.repeat = {
      value: v('opponent', 'bleed'),
    };
  });

  it('repeats effect for each opponent bleed', () => {
    const { diff } = getPlayCardResult({ opponent: { bleed: 2 } });

    // runs 3 times total (1 initial + 2 repeats for the 2 opponent bleed)
    expect(diff).toEqual({ opponent: { health: -3 - BLEED_DAMAGE * 2, bleed: -2 } });
  });

  it(`doesn't repeat when the if statement returns false`, () => {
    card.repeat!.if = {
      value: v('opponent', 'bleed'),
      comparison: '=',
      value2: v(1),
    };

    const { diff } = getPlayCardResult({ opponent: { bleed: 2 } });

    // note that the if statement is evaluated before the effect is done
    expect(diff).toEqual({ opponent: { health: -1 - BLEED_DAMAGE, bleed: -1 } });
  });
});

describe('add', () => {
  beforeEach(() => {
    effect.add = {
      value: v(3),
      if: {
        value: v('opponent', 'bleed'),
        comparison: '>',
        value2: v(0),
      },
    };
  });

  it('adds damage if the opponent is bleeding', () => {
    const { diff } = getPlayCardResult({ opponent: { bleed: 2 } });
    expect(diff).toEqual({ opponent: { health: -4 - BLEED_DAMAGE, bleed: -1 } });
  });
});

describe('multiply', () => {
  beforeEach(() => {
    effect.multiply = {
      value: v(2),
      if: {
        value: v('opponent', 'bleed'),
        comparison: '>',
        value2: v(0),
      },
    };
  });

  it('deals double damage if the opponent is bleeding', () => {
    const { diff } = getPlayCardResult({ self: { strength: 2 }, opponent: { bleed: 2 } });
    expect(diff).toEqual({ opponent: { health: -6 - BLEED_DAMAGE, bleed: -1 } });
  });
});

describe('battle events', () => {
  it('returns battle events', () => {
    card.effects.push({
      type: 'heal',
      target: 'self',
      value: v(5),
    });

    const { events } = getPlayCardResult({ self: { strength: 2 }, opponent: { bleed: 2 } });
    expect(events).toEqual([
      { type: 'damage', value: 3, target: 'opponent', source: 'card', isCrit: false },
      { type: 'damage', value: BLEED_DAMAGE, target: 'opponent', source: 'other', isCrit: false },
      { type: 'heal', value: 5, target: 'self', source: 'card', isCrit: false },
    ]);
  });

  it('returns a battle event when 0 damage is done', () => {
    effect.value = v(0);

    const { events } = getPlayCardResult();
    expect(events).toEqual([
      { type: 'damage', value: 0, target: 'opponent', source: 'card', isCrit: false },
    ]);
  });

  it('indicates when damage is a crit', () => {
    card.effects[0] = createEffect({ target: 'self', type: 'crit' });
    card.effects[1] = createEffect();

    const { events } = getPlayCardResult();
    expect(events).toEqual([
      { type: 'damage', value: 2, target: 'opponent', source: 'card', isCrit: true },
    ]);
  });
});

describe('status effects', () => {
  describe('dodge', () => {
    beforeEach(() => {
      effect.type = 'dodge';
    });

    it('increases opponent dodge', () => {
      const { diff } = getPlayCardResult();

      expect(diff).toEqual({ opponent: { dodge: 1 } });
    });

    it('increases self dodge', () => {
      effect.target = 'self';
      const { diff } = getPlayCardResult();

      expect(diff).toEqual({ self: { dodge: 1 } });
    });

    it('rounds dodge down', () => {
      effect.value = v(1.5);
      const { diff } = getPlayCardResult();

      expect(diff).toEqual({ opponent: { dodge: 1 } });
    });
  });

  describe('temporaryFireCrit', () => {
    beforeEach(() => {
      card.name = 'Fireball';
    });

    it('doubles damage from next fire card', () => {
      const { diff } = getPlayCardResult({
        self: { temporaryFireCrit: 1 },
      });
      expect(diff).toEqual({ self: { temporaryFireCrit: -1 }, opponent: { health: -2 } });
    });

    it('each stack applies to one instance of damage from a fire card', () => {
      card.effects = [
        createEffect({ type: 'damage', value: v(1) }),
        createEffect({ type: 'damage', value: v(2) }),
        createEffect({ type: 'damage', value: v(3) }),
      ];
      const { diff } = getPlayCardResult({
        self: { temporaryFireCrit: 2 },
      });
      expect(diff).toEqual({
        self: { temporaryFireCrit: -2 },
        opponent: { health: -(1 + 2) * 2 - 3 },
      });
    });

    it('does nothing for non-fire cards', () => {
      card.name = 'Blueball';
      const { diff } = getPlayCardResult({
        self: { temporaryFireCrit: 1 },
      });
      expect(diff).toEqual({ opponent: { health: -1 } });
    });
  });

  describe('lifesteal', () => {
    it('heals self for damage dealt', () => {
      const { diff } = getPlayCardResult({ self: { lifesteal: 1 } });

      expect(diff).toEqual({ self: { health: 1 }, opponent: { health: -1 } });
    });

    it('does not heal from bleed damage', () => {
      const { diff } = getPlayCardResult({ self: { lifesteal: 1 }, opponent: { bleed: 1 } });

      expect(diff).toEqual({
        self: { health: 1 },
        opponent: { health: -1 - BLEED_DAMAGE, bleed: -1 },
      });
    });

    it('lifestealWhenBurning adds to lifesteal', () => {
      const { diff } = getPlayCardResult({
        self: { lifesteal: 1, lifestealWhenBurning: 1, burn: 1 },
      });

      expect(diff).toEqual({ self: { health: 2 }, opponent: { health: -1 } });
    });

    it('card lifesteal adds to lifesteal', () => {
      card.lifesteal = { value: v(1) };
      const { diff } = getPlayCardResult({ self: { lifesteal: 1 } });

      expect(diff).toEqual({ self: { health: 2 }, opponent: { health: -1 } });
    });

    it('does not heal when lifesteal is 0', () => {
      const { diff } = getPlayCardResult({
        self: { lifesteal: 0, lifestealWhenBurning: 1, burn: 0 },
      });

      expect(diff).toEqual({ opponent: { health: -1 } });
    });

    it('is added to self via card effect', () => {
      effect.type = 'lifesteal';
      effect.target = 'self';
      effect.value = v(0.5);
      const { diff } = getPlayCardResult();

      expect(diff).toEqual({ self: { lifesteal: 0.5 } });
    });
  });

  describe('shock', () => {
    it('increases opponent shock', () => {
      effect.type = 'shock';
      const { diff } = getPlayCardResult();

      expect(diff).toEqual({ opponent: { shock: 1 } });
    });

    it('increases when opponent takes card damage', () => {
      const { diff } = getPlayCardResult({ opponent: { shock: 1 } });

      expect(diff).toEqual({ opponent: { health: -1, shock: 1 } });
    });
  });
});

describe('relics', () => {
  describe('reduceLowDamage', () => {
    const relics = [reduceLowDamage];

    it('reduces damage to 1 when 4 or less', () => {
      effect.value = v(4);
      const { diff } = getPlayCardResult({ opponent: { relics } });
      expect(diff).toEqual({ opponent: { health: -1 } });
    });

    it('does nothing when damage is 5 or more', () => {
      effect.value = v(5);
      const { diff } = getPlayCardResult({ opponent: { relics } });
      expect(diff).toEqual({ opponent: { health: -5 } });
    });
  });

  describe('regenForHighDamage', () => {
    const relics = [regenForHighDamage];

    it('adds regen when damage is high', () => {
      effect.value = v(10);
      const { diff } = getPlayCardResult({ self: { relics } });
      expect(diff).toEqual({ self: { regen: 3 }, opponent: { health: -10 } });
    });

    it('does nothing when damage is low', () => {
      effect.value = v(9);
      const { diff } = getPlayCardResult({ self: { relics } });
      expect(diff).toEqual({ opponent: { health: -9 } });
    });
  });

  describe('strengthAffectsHealing', () => {
    const relics = [strengthAffectsHealing];
    beforeEach(() => {
      card.effects[0] = {
        type: 'heal',
        target: 'self',
        value: v(1),
      };
    });

    it('strength is added to healing', () => {
      const { diff } = getPlayCardResult({ self: { relics, strength: 1 } });
      expect(diff).toEqual({ self: { health: 2 } });
    });
  });

  describe('strengthOnSelfDamage', () => {
    const relics = [strengthOnSelfDamage];

    it('adds strength when taking damage on own turn', () => {
      effect.target = 'self';
      const { diff } = getPlayCardResult({ self: { relics } });
      expect(diff).toEqual({ self: { strength: 1, health: -1 } });
    });

    it(`does not add strength when taking damage on opponent's turn`, () => {
      const { diff } = getPlayCardResult({ opponent: { relics } });
      expect(diff).toEqual({ opponent: { health: -1 } });
    });
  });

  describe('sharedPain', () => {
    it('deals damage to opponent when taking self damage', () => {
      effect.target = 'self';
      const { diff } = getPlayCardResult({ self: { relics: [sharedPain] } });

      expect(diff).toEqual({ self: { health: -1 }, opponent: { health: -1 } });
    });
  });
});
