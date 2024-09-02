import cloneDeep from 'lodash/cloneDeep';

import { createInitialGameState, PlayerState } from '../index';
import playCard, {
  BLEED_DAMAGE,
  CardEffect,
  CardState,
  getValueDescriptor as v,
} from './playCardV2';
import { diffValues } from '../../utils';

const STARTER_CARD: CardState = {
  effects: [{ target: 'opponent', name: 'damage', value: v(1) }],
};

let card: CardState;
let effect: CardEffect;

beforeEach(() => {
  card = cloneDeep(STARTER_CARD);
  effect = card.effects[0];
});

function getPlayCardResult({
  self: selfOverrides,
  opponent: opponentOverrides,
}: {
  self?: Partial<PlayerState>;
  opponent?: Partial<PlayerState>;
} = {}) {
  const { user, enemy } = createInitialGameState();
  user.cards = new Array(3).fill(STARTER_CARD);
  enemy.cards = new Array(3).fill(STARTER_CARD);

  const self = Object.assign(user, selfOverrides);
  const opponent = Object.assign(enemy, opponentOverrides);
  const init = cloneDeep({ self, opponent });

  const events = playCard(card, { self, opponent });

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

    expect(diff).toEqual({ opponent: { health: -1 - BLEED_DAMAGE, bleed: -1 } });
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
});

describe('trash cards', () => {
  beforeEach(() => {
    effect.name = 'trash';
  });

  it('trashes opponent cards', () => {
    const { init, opponent } = getPlayCardResult();
    const [c1, c2, c3] = init.opponent.cards;

    expect(opponent.cards).toEqual([c2, c3]);
    expect(opponent.trashedCards).toEqual([c1]);
  });

  // TODO
  // it('trash own cards', () => {
  //   effect.target = 'self';
  //   const { init, self } = getPlayCardResult();
  //   const [c1, c2, c3] = init.self.cards;

  //   expect(self.cards).toEqual([c2]);
  //   expect(self.trashedCards).toEqual([c1, c3]);
  // });

  // it(`trash opponent cards from the discard pile`, () => {
  //   effect.value = 2;
  //   const { init, opponent } = getPlayCardResult({ opponent: { currentCardIndex: 1 } });
  //   const [c1, c2, c3] = init.opponent.cards;

  //   expect(opponent.cards).toEqual([c2]);
  //   expect(opponent.trashedCards).toEqual([c3, c1]);
  //   expect(opponent.currentCardIndex).toBe(0);
  // });

  it('trashes entire opponent deck', () => {
    effect.value = v(10);
    const { opponent } = getPlayCardResult({ opponent: { currentCardIndex: 1 } });

    expect(opponent.cards.length).toBe(0);
    expect(opponent.currentCardIndex).toBe(0);
  });
});

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
});

describe('multi-hit', () => {
  beforeEach(() => {
    effect.multiHit = 2;
  });

  it('deals damage twice', () => {
    const { diff } = getPlayCardResult({ self: { strength: 2 }, opponent: { bleed: 2 } });

    expect(diff).toEqual({ opponent: { health: -6 - BLEED_DAMAGE * 2, bleed: -2 } });
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
