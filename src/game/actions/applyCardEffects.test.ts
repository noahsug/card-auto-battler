import cloneDeep from 'lodash/cloneDeep';

import { createCard, ifCompare, value as v } from '../../content/utils/createCard';
import { diffValues } from '../../utils/objects';
import { applyCardEffects } from './applyCardEffects';
import { BLEED_DAMAGE } from '../constants';
import { CardEffect, CardState, createGameState, PlayerState } from '../gameState';

let card: CardState;
let effect: CardEffect;

beforeEach(() => {
  card = cloneDeep(createCard());
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
  user.cards = [createCard(), createCard(), createCard()];
  enemy.cards = [createCard(), createCard(), createCard()];

  const self = Object.assign(user, selfOverrides);
  const opponent = Object.assign(enemy, opponentOverrides);
  const init = cloneDeep({ self, opponent });

  const events = applyCardEffects(card, { game, self, opponent });

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

describe('permaBleed', () => {
  it('adds 1 bleed whenever bleed reaches 0', () => {
    effect.multiHit = v(3);
    const { diff } = getPlayCardResult({ opponent: { permaBleed: 1, bleed: 1 } });

    const damage = 3 * (1 + BLEED_DAMAGE);
    expect(diff).toEqual({ opponent: { health: -damage } });
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
    effect.name = 'heal';
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

describe('dodge', () => {
  beforeEach(() => {
    effect.name = 'dodge';
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
    effect.if = ifCompare('self', 'percentGreen', '>=', 50);

    const basicCard = createCard();
    const greenCard = createCard([{}], { color: 'green' });

    const majorityBasic = getPlayCardResult({
      self: { cards: [basicCard, basicCard, greenCard] },
    });
    expect(majorityBasic.diff).toEqual({});

    const majorityGreen = getPlayCardResult({
      self: { cards: [basicCard, basicCard, greenCard, greenCard] },
    });
    expect(majorityGreen.diff).toEqual({ opponent: { health: -1 } });
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
    const { diff } = getPlayCardResult({ turn: 5 });

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
      name: 'heal',
      target: 'self',
      value: v(5),
    });

    const { events } = getPlayCardResult({ self: { strength: 2 }, opponent: { bleed: 2 } });
    expect(events).toEqual([
      { type: 'damage', value: 3, target: 'opponent' },
      { type: 'damage', value: BLEED_DAMAGE, target: 'opponent' },
      { type: 'heal', value: 5, target: 'self' },
    ]);
  });

  it('returns a battle event when 0 damage is done', () => {
    effect.value = v(0);

    const { events } = getPlayCardResult();
    expect(events).toEqual([{ type: 'damage', value: 0, target: 'opponent' }]);
  });
});
