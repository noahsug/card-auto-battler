import getCardText from './getCardText';

import { createCard, ifHas, getValueDescriptor as v } from '../../gameState/utils';
import { CardEffect, CardState, PlayerValueDescriptor } from '../../gameState/gameState';

// Deal 1 damage 3 times.
// Rally: Each hit deals 2 extra damage.

// Deal 10 damage.
// Gain 4 HP.
// Apply 2 bleed.
// Gain 1 poison.
// Enemy gains 2 strength.
// You Trash 2 cards.
// Enemy Trashes 2 cards.
// Play two cards.
// Trash.

// Play the top damage card of your deck.

// Deal 1 damage 3 times.
// Rally: Deals double damage.

// Deal 1 damage 3 times.
// Rally: Each hit deals 2 extra damage.

// Deal 1 damage 3 times.
// Each hit deals 2 extra damage if you have less than half HP.

// Deal 5 damage.
// Deals double damage if you have less than half HP.

// Set your HP to half.

// Deal 3 damage.
// Deals extra damage for every 5 missing health.

// Deal 10 damage.
// Misses if you have more HP than the enemy.

// Deal 1 damage 3 times.
// Momentum: Each hit deals extra damage equal to your bleed (3).

// Deal 3 damage.
// Deal 5 damage if the enemy has bleed.

// Deal 3 damage.
// Powerful Blow: Lifesteal. // triggers if this card does double it's original damage (6)
// Gains Lifesteal if this card deals >= 7 damage.
// Gain HP equal to damage dealt if this card deals at least 7 damage.

// Deal 3 damage.
// Apply bleed equal to damage dealt.
// Apply 2 bleed if this hits.
// Apply 2 bleed if the enemy has bleed.

// Deal 10 damage.
// Take 5 damage if this misses.

// Deal 3 damage.
// Deals 5 extra damage if the enemy has bleed.

// Deal damage equal to two times the enemy's bleed (3).

// Deal 3 damage. Deals extra damage equal to the enemy's bleed (3).

// Deal 2 damage. Deals extra damage equal to the number of cards you've played this turn.

// Deal 1 damage.
// Deals extra damage equal to your strength (6). // re-write to "This card is effected by strength twice"

// Gain strength equal to 2 times your strength. // rewrite to "Triple your strength."

// Apply bleed equal to 2 times the enemy's bleed. // rewrite to "Triple the enemy's bleed."

// Apply 5 bleed.
// Gain 5 bleed.

// Heal 3.
// Gain 3 strength.

// Deal 1 damage. Play 1 card.
// Momentum: Play 1 card. // triggers when you've played more than one card this turn.

// Gain 1 Dodge for every 4 cards you play.

// Enemy cards deal 1 less damage for the next 3 turns.

// ALL damage is reduced by 2 for the next 3 turns.

// Deal 1 damage.
// Repeat for each bleed you have (3).
// Repeat for each bleed the enemy has (3).

function render(card: CardState) {
  const lines = getCardText(card);
  return lines.join('. ') + '.';
}

let card: CardState;
let effect: CardEffect;

beforeEach(() => {
  card = createCard({
    target: 'opponent',
    name: 'damage',
    value: v(1),
  });
  effect = card.effects[0];
});

it('renders damage', () => {
  effect.value = v(3);
  expect(render(card)).toBe('Deal 3 damage.');

  effect.target = 'self';
  expect(render(card)).toBe('Take 3 damage.');
});

describe('renders multiple effects', () => {
  test('deal 1, take 1', () => {
    card.effects.push({
      target: 'self',
      name: 'damage',
      value: v(1),
    });
    expect(render(card)).toBe('Deal 1 damage. Take 1 damage.');
  });

  test('deal 1, deal 2', () => {
    card.effects.push({
      target: 'opponent',
      name: 'damage',
      value: v(2),
    });
    expect(render(card)).toBe('Deal 1 damage. Deal 2 damage.');
  });

  test('deal 1, deal another 2 if', () => {
    card.effects.push({
      target: 'opponent',
      name: 'damage',
      value: v(2),
      if: ifHas('opponent', 'bleed'),
    });
    expect(render(card)).toBe('Deal 1 damage. Deal 2 damage if the enemy has bleed.');
    // TODO: add "another" if this effect has if and prev effect is the same
    // 'Deal 1 damage. Deal another 2 damage if the enemy...');
    // 'Apply 1 bleed. Apply another 2 bleed if the enemy...');
    // 'You trash 1. You trash another 2 if the enemy...');
    // 'Deal 1 damage. Deal damage equal to your...'); <-- doesn't change
    // 'Deal 1 damage. Deal 2 damage. <-- doesn't change
    // TODO: support non-damage add
    // expect(render(card)).toBe('Apply 1 bleed. Apply 2 extra bleed if the enemy has less than 10 HP.');
    // expect(render(card)).toBe('You trash 1. You trash 2 extra if the enemy has less than 10
    // HP.');
    // TODO: add ONLY supports damage. But we'll use the term "extra" for non-damage anyway.
  });
});

it('renders bleed', () => {
  effect.name = 'bleed';
  expect(render(card)).toBe('Apply 1 bleed.');

  effect.target = 'self';
  expect(render(card)).toBe('Gain 1 bleed.');
});

it('renders heal', () => {
  effect.name = 'heal';
  expect(render(card)).toBe('Enemy gains 1 HP.');

  effect.target = 'self';
  expect(render(card)).toBe('Gain 1 HP.');
});

it('renders trash', () => {
  effect.name = 'trash';
  expect(render(card)).toBe('Enemy trashes 1.');

  effect.target = 'self';
  expect(render(card)).toBe('You trash 1.');
});

describe('renders play extra cards', () => {
  beforeEach(() => {
    effect.name = 'extraCardPlays';
  });

  test('play an extra card', () => {
    expect(render(card)).toBe('Enemy plays 1 extra card next turn.');

    effect.target = 'self';
    expect(render(card)).toBe('Play 1 card.');
  });

  test('play multiple extra cards', () => {
    effect.value = v(3);
    expect(render(card)).toBe('Enemy plays 3 extra cards next turn.');

    effect.target = 'self';
    expect(render(card)).toBe('Play 3 cards.');
  });
});

it('renders multi-hits', () => {
  effect.multiHit = 2;
  expect(render(card)).toBe('Deal 1 damage 2 times.');
});

// TODO
// // used to combine two effects under the same if statement or multiplier
// describe('renders two effects on the same line', () => {
//   beforeEach(() => {
//     effect.and = {
//       target: 'opponent',
//       name: 'bleed',
//       value: 2,
//     };
//   });

//   test('deal damage and apply bleed', () => {
//     expect(render(card)).toBe('Deal 1 damage and apply 2 bleed.');
//   });

//   test('gain bleed and strength bleed equal to enemy bleed', () => {
//     effect.multiplyBy = {
//       type: 'playerValue',
//       target: 'opponent',
//       name: 'bleed',
//     };

//     // Note that the `effect.and.value` is ignored when `effect.multiplyBy` is present
//     expect(render(card)).toBe(`Deal damage and apply bleed equal to the enemy's bleed.`);
//   });
// });

describe('renders effect based on player value', () => {
  beforeEach(() => {
    effect.value = v('opponent', 'bleed');
  });

  test('equal to bleed', () => {
    expect(render(card)).toBe(`Deal damage equal to the enemy's bleed.`);

    effect.value = v('self', 'bleed');
    expect(render(card)).toBe(`Deal damage equal to your bleed.`);
  });

  test('equal to bleed with multi-hit', () => {
    effect.multiHit = 2;
    expect(render(card)).toBe(`Deal damage equal to the enemy's bleed 2 times.`);
  });

  test('equal to multiples of bleed', () => {
    const playerValue = effect.value as PlayerValueDescriptor;
    playerValue.multiplier = 2;
    expect(render(card)).toBe(`Deal damage equal to twice the enemy's bleed.`);

    playerValue.multiplier = 3;
    expect(render(card)).toBe(`Deal damage equal to 3 times the enemy's bleed.`);

    playerValue.multiplier = 0.5;
    expect(render(card)).toBe(`Deal damage equal to half the enemy's bleed.`);

    playerValue.multiplier = 0.25;
    expect(render(card)).toBe(`Deal damage equal to 1/4 the enemy's bleed.`);
  });

  test('equal to cards played', () => {
    effect.value = v('opponent', 'cardsPlayedThisTurn');
    // TODO: remove "has", just "cards the enemy played"
    expect(render(card)).toBe(
      `Deal damage equal to the number of cards the enemy has played last turn.`,
    );

    effect.value = v('self', 'cardsPlayedThisTurn');
    expect(render(card)).toBe(`Deal damage equal to the number of cards you've played this turn.`);
  });

  test('equal to cards trashed', () => {
    effect.value = v('opponent', 'trashedCards');
    expect(render(card)).toBe(`Deal damage equal to the number of cards the enemy has trashed.`);

    effect.value = v('self', 'trashedCards');
    expect(render(card)).toBe(`Deal damage equal to the number of cards you've trashed.`);

    effect.value = v('self', 'trashedCards', 2);
    expect(render(card)).toBe(`Deal damage equal to twice the number of cards you've trashed.`);
  });

  test('equal to current health', () => {
    effect.value = v('self', 'health', 0.5);
    expect(render(card)).toBe(`Deal damage equal to half your HP.`);

    effect.value.target = 'opponent';
    expect(render(card)).toBe(`Deal damage equal to half the enemy's HP.`);

    effect.value.multiplier = 1 / 3;
    expect(render(card)).toBe(`Deal damage equal to 1/3 the enemy's HP.`);
  });

  test('triple your strength', () => {
    card = createCard({ target: 'self', name: 'strength', value: v('self', 'strength', 2) });
    expect(render(card)).toBe(`Gain strength equal to twice your strength.`);
    // TODO
    // expect(render(card)).toBe(`Triple your strength.`);
    // expect(render(card)).toBe(`Triple the enemy's bleed.`);
  });

  // TODO:
  // test('equal to missing health', () => {});
});

describe('renders if statements', () => {
  test('if the enemy has dodge', () => {
    effect.if = {
      value: v('opponent', 'dodge'),
      comparison: '>',
      value2: v(0),
    };
    expect(render(card)).toBe('Deal 1 damage if the enemy has dodge.');
  });

  test('if you have 3 bleed', () => {
    effect.if = {
      value: v('self', 'bleed'),
      comparison: '=',
      value2: v(3),
    };
    expect(render(card)).toBe('Deal 1 damage if you have 3 bleed.');
  });

  test('if you have played more than 2 cards this turn', () => {
    effect.if = {
      value: v('self', 'cardsPlayedThisTurn'),
      comparison: '>',
      value2: v(2),
    };
    expect(render(card)).toBe(`Deal 1 damage if you've played more than 2 cards this turn.`);
  });

  test('if the enemy has trashed at least 2 cards', () => {
    effect.if = {
      value: v('opponent', 'trashedCards'),
      comparison: '>=',
      value2: v(2),
    };
    expect(render(card)).toBe(`Deal 1 damage if the enemy has trashed at least 2 cards.`);
  });

  test('if you have less than 10 HP', () => {
    effect.if = {
      value: v('self', 'health'),
      comparison: '<',
      value2: v(10),
    };
    expect(render(card)).toBe('Deal 1 damage if you have less than 10 HP.');
  });

  // ... if this card deals at least 7 damage.
});

it('renders repeat', () => {
  card.repeat = { value: v('opponent', 'bleed') };
  expect(render(card)).toBe('Deal 1 damage. Repeat for each bleed the enemy has.');
});

describe('renders add', () => {
  test('deal extra damage if the enemy has bleed', () => {
    effect.add = {
      value: v(3),
      if: {
        value: v('opponent', 'bleed'),
        comparison: '>',
        value2: v(0),
      },
    };
    expect(render(card)).toBe('Deal 1 damage. Deal 3 extra damage if the enemy has bleed.');
  });

  // test('deals extra damage equal to bleed', () => {
  //   effect.add = {
  //     value: v('opponent', 'bleed'),
  //   };

  //   expect(render(card)).toBe(`Deal 1 damage. Deal extra damage equal to the enemy's bleed.`);
  // });

  // test('strength effects this card 3 times', () => {
  //   effect.add = {
  //     value: v('self', 'strength', 3),
  //   };

  //   expect(render(card)).toBe('Deal 1 damage. Deal extra damage equal to 2 times your strength.');
  //   // TODO
  //   // expect(render(card)).toBe('Deal 1 damage. Strength affects this card 3 times.');
  // });
});

it('renders multiply', () => {
  const basicValue = v(2);
  effect.multiply = {
    value: basicValue,
    if: {
      value: v('opponent', 'bleed'),
      comparison: '>',
      value2: v(0),
    },
  };

  expect(render(card)).toBe('Deal 1 damage. Deal double damage if the enemy has bleed.');

  basicValue.value = 3;
  expect(render(card)).toBe('Deal 1 damage. Deal triple damage if the enemy has bleed.');

  basicValue.value = 4;
  expect(render(card)).toBe('Deal 1 damage. Deal quadruple damage if the enemy has bleed.');

  basicValue.value = 1.5;
  expect(render(card)).toBe('Deal 1 damage. Deal 150% damage if the enemy has bleed.');
});
