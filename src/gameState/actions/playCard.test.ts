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
  test('deal damage', () => {
    const { diff } = getPlayCardResult();

    expect(diff).toEqual({ opponent: { health: -1 } });
  });

  test('take damage', () => {
    effect.target = 'self';
    const { diff } = getPlayCardResult();

    expect(diff).toEqual({ self: { health: -1 } });
  });

  test('opponent dodges damage', () => {
    const { diff } = getPlayCardResult({ opponent: { dodge: 1 } });

    expect(diff).toEqual({ opponent: { dodge: -1 } });
  });

  test('strength increases damage', () => {
    const { diff } = getPlayCardResult({ self: { strength: 1 } });

    expect(diff).toEqual({ opponent: { health: -2 } });
  });

  test('bleed increases damage', () => {
    const { diff } = getPlayCardResult({ opponent: { bleed: 1 } });

    expect(diff).toEqual({ opponent: { health: -4, bleed: -1 } });
  });

  test('self damage is not effected by dodge, strength or bleed', () => {
    effect.target = 'self';
    const { diff } = getPlayCardResult({ self: { dodge: 1, strength: 1, bleed: 1 } });

    expect(diff).toEqual({ self: { health: -1 } });
  });
});

describe('heal', () => {
  beforeEach(() => {
    effect.name = 'heal';
  });

  test('give hp', () => {
    const { diff } = getPlayCardResult();

    expect(diff).toEqual({ opponent: { health: 1 } });
  });

  test('gain hp', () => {
    effect.target = 'self';
    const { diff } = getPlayCardResult();

    expect(diff).toEqual({ self: { health: 1 } });
  });
});

describe('dodge', () => {
  beforeEach(() => {
    effect.name = 'dodge';
  });

  test('give dodge', () => {
    const { diff } = getPlayCardResult();

    expect(diff).toEqual({ opponent: { dodge: 1 } });
  });

  test('gain dodge', () => {
    effect.target = 'self';
    const { diff } = getPlayCardResult();

    expect(diff).toEqual({ self: { dodge: 1 } });
  });
});

describe('trash cards', () => {
  beforeEach(() => {
    effect.name = 'trash';
  });

  test('trash opponent cards', () => {
    const { init, opponent } = getPlayCardResult();
    const [c1, c2, c3] = init.opponent.cards;

    expect(opponent.cards).toEqual([c2, c3]);
    expect(opponent.trashedCards).toEqual([c1]);
  });

  // TODO
  // test('trash own cards', () => {
  //   effect.target = 'self';
  //   const { init, self } = getPlayCardResult();
  //   const [c1, c2, c3] = init.self.cards;

  //   expect(self.cards).toEqual([c2]);
  //   expect(self.trashedCards).toEqual([c1, c3]);
  // });

  // test(`trash opponent cards from the discard pile`, () => {
  //   effect.value = 2;
  //   const { init, opponent } = getPlayCardResult({ opponent: { currentCardIndex: 1 } });
  //   const [c1, c2, c3] = init.opponent.cards;

  //   expect(opponent.cards).toEqual([c2]);
  //   expect(opponent.trashedCards).toEqual([c3, c1]);
  //   expect(opponent.currentCardIndex).toBe(0);
  // });

  test('trash entire opponent deck', () => {
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
      playerValue: 'bleed',
      comparison: '=',
      compareTo: { type: 'value', value: 0 },
    };
  });

  test('do nothing if the player has bleed', () => {
    const { diff } = getPlayCardResult({ opponent: { bleed: 1 } });

    expect(diff).toEqual({});
  });

  test('do something if the player does not have bleed', () => {
    const { diff } = getPlayCardResult();

    expect(diff).toEqual({ opponent: { health: -1 } });
  });
});

describe('multiply by', () => {
  beforeEach(() => {
    effect.multiplyBy = {
      type: 'playerValue',
      target: 'opponent',
      playerValue: 'strength',
    };
  });

  test('deal damage equal to strength', () => {
    const { diff } = getPlayCardResult({ opponent: { strength: 2 } });

    expect(diff).toEqual({ opponent: { health: -2 } });
  });
});
