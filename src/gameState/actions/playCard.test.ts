import cloneDeep from 'lodash/cloneDeep';

import { createInitialGameState, PlayerState } from '../index';
import playCard, { CardEffect, CardState } from './playCardV2';

let self: PlayerState;
let opponent: PlayerState;
let initSelf: PlayerState;
let initOpponent: PlayerState;
let card: CardState;
let effect: CardEffect;

beforeEach(() => {
  const { user, enemy } = createInitialGameState();
  self = user;
  opponent = enemy;
  initSelf = cloneDeep(self);
  initOpponent = cloneDeep(opponent);

  effect = {
    target: 'opponent',
    name: 'damage',
    value: 1,
  } as CardEffect;

  card = { effects: [effect] };
});

describe('damage', () => {
  test('deal damage', () => {
    playCard(card, { self, opponent });
    expect(initSelf.health - self.health).toBe(0);
    expect(initOpponent.health - opponent.health).toBe(1);
  });

  test('take damage', () => {
    effect.target = 'self';

    playCard(card, { self, opponent });
    expect(initSelf.health - self.health).toBe(1);
    expect(initOpponent.health - opponent.health).toBe(0);
  });
});

describe('heal', () => {
  test('gain hp', () => {
    playCard(card, { self, opponent });
    expect(initSelf.health - self.health).toBe(0);
    expect(initOpponent.health - opponent.health).toBe(1);
  });

  test('take damage', () => {
    effect.target = 'self';

    playCard(card, { self, opponent });
    expect(initSelf.health - self.health).toBe(1);
    expect(initOpponent.health - opponent.health).toBe(0);
  });
});
