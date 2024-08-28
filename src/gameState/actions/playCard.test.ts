import cloneDeep from 'lodash/cloneDeep';

import { createInitialGameState, PlayerState } from '../index';
import playCard, { CardEffect, CardState } from './playCardV2';
import { diffValues } from '../../utils';

const STARTER_CARD: CardState = { effects: [{ target: 'opponent', name: 'damage', value: 1 }] };

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

    expect(diff).toEqual({ opponent: { health: -4, bleed: -1 } });
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
    effect.value = 10;
    const { opponent } = getPlayCardResult({ opponent: { currentCardIndex: 1 } });

    expect(opponent.cards.length).toBe(0);
    expect(opponent.currentCardIndex).toBe(0);
  });
});

describe('if', () => {
  beforeEach(() => {
    effect.if = {
      type: 'playerValue',
      target: 'opponent',
      name: 'bleed',
      comparison: '=',
      compareTo: { type: 'value', value: 0 },
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

  it('compares to max health', () => {
    //
  });
});

describe('multiply by', () => {
  beforeEach(() => {
    effect.multiplyBy = {
      type: 'playerValue',
      target: 'opponent',
      name: 'strength',
    };
  });

  it('multiplies damage by strength', () => {
    const { diff } = getPlayCardResult({ opponent: { strength: 2 } });

    expect(diff).toEqual({ opponent: { health: -2 } });
  });
});

describe('multi-hit', () => {
  beforeEach(() => {
    effect.multiHit = 2;
  });

  it('deals damage twice', () => {
    const { diff } = getPlayCardResult({ self: { strength: 2 }, opponent: { bleed: 2 } });

    expect(diff).toEqual({ opponent: { health: -12, bleed: -2 } });
  });
});
