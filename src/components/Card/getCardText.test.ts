import getCardText from './getCardText';

import { CardEffect, CardState } from '../../gameState/actions/playCardV2';

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
  effect = {
    target: 'opponent',
    name: 'damage',
    value: 1,
  } as CardEffect;

  card = { effects: [effect] };
});

it('renders damage', () => {
  effect.value = 3;
  expect(render(card)).toBe('Deal 3 damage.');

  effect.target = 'self';
  expect(render(card)).toBe('Take 3 damage.');
});

it('renders multiple effects', () => {
  card.effects.push({
    target: 'self',
    name: 'damage',
    value: 1,
  });
  expect(render(card)).toBe('Deal 1 damage. Take 1 damage.');
});

it('renders bleed', () => {
  effect.name = 'bleed';
  expect(render(card)).toBe('Apply 1 bleed.');

  effect.target = 'self';
  expect(render(card)).toBe('Gain 1 bleed.');
});

it('renders heal', () => {
  effect.name = 'heal';
  expect(render(card)).toBe('Enemy gains 1 heal.');

  effect.target = 'self';
  expect(render(card)).toBe('Gain 1 heal.');
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
    effect.value = 3;
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

//   test('deal damage and apply bleed equal to enemy bleed', () => {
//     effect.multiplyBy = {
//       type: 'playerValue',
//       target: 'opponent',
//       name: 'bleed',
//     };

//     // Note that the `effect.and.value` is ignored when `effect.multiplyBy` is present
//     expect(render(card)).toBe(`Deal damage and apply bleed equal to the enemy's bleed.`);
//   });
// });

describe('renders multiply by', () => {
  beforeEach(() => {
    effect.multiplyBy = {
      type: 'playerValue',
      target: 'opponent',
      name: 'bleed',
    };
  });

  test('equal to bleed', () => {
    expect(render(card)).toBe(`Deal damage equal to the enemy's bleed.`);

    effect.multiplyBy!.target = 'self';
    expect(render(card)).toBe(`Deal damage equal to your bleed.`);
  });

  test('equal to bleed with multi-hit', () => {
    effect.multiHit = 2;
    expect(render(card)).toBe(`Deal damage equal to the enemy's bleed 2 times.`);
  });

  test('equal to multiples of bleed', () => {
    effect.value = 2;
    expect(render(card)).toBe(`Deal damage equal to twice the enemy's bleed.`);

    effect.value = 3;
    expect(render(card)).toBe(`Deal damage equal to 3 times the enemy's bleed.`);

    effect.value = 0.5;
    expect(render(card)).toBe(`Deal damage equal to half the enemy's bleed.`);

    effect.value = 0.25;
    expect(render(card)).toBe(`Deal damage equal to 1/4 the enemy's bleed.`);
  });

  test('equal to cards played', () => {
    effect.multiplyBy!.name = 'cardsPlayedThisTurn';
    expect(render(card)).toBe(
      `Deal damage equal to the number of cards the enemy has played this turn.`,
    );

    effect.multiplyBy!.target = 'self';
    expect(render(card)).toBe(`Deal damage equal to the number of cards you've played this turn.`);
  });

  test('equal to cards trashed', () => {
    effect.multiplyBy!.name = 'trashedCards';
    expect(render(card)).toBe(`Deal damage equal to the number of cards the enemy has trashed.`);

    effect.multiplyBy!.target = 'self';
    expect(render(card)).toBe(`Deal damage equal to the number of cards you've trashed.`);
  });

  // test('equal to missing health', () => {});
});

describe('renders if statements', () => {
  test('if the enemy has dodge', () => {
    effect.if = {
      type: 'playerValue',
      target: 'opponent',
      name: 'dodge',
      comparison: '>',
      compareTo: { type: 'value', value: 0 },
    };
    expect(render(card)).toBe('Deal 1 damage if the enemy has dodge.');
  });

  test('if you have 3 bleed', () => {
    effect.if = {
      type: 'playerValue',
      target: 'self',
      name: 'bleed',
      comparison: '=',
      compareTo: { type: 'value', value: 3 },
    };
    expect(render(card)).toBe('Deal 1 damage if you have 3 bleed.');
  });

  test('if you have played more than 2 cards this turn', () => {
    effect.if = {
      type: 'playerValue',
      target: 'self',
      name: 'cardsPlayedThisTurn',
      comparison: '>',
      compareTo: { type: 'value', value: 2 },
    };
    expect(render(card)).toBe(`Deal 1 damage if you've played more than 2 cards this turn.`);
  });

  test('if the enemy has trashed at least 2 cards', () => {
    effect.if = {
      type: 'playerValue',
      target: 'opponent',
      name: 'trashedCards',
      comparison: '>=',
      compareTo: { type: 'value', value: 2 },
    };
    expect(render(card)).toBe(`Deal 1 damage if the enemy has trashed at least 2 cards.`);
  });

  test('if you have less than 10 HP', () => {
    effect.if = {
      type: 'playerValue',
      target: 'self',
      name: 'health',
      comparison: '<',
      compareTo: { type: 'value', value: 10 },
    };
    expect(render(card)).toBe('Deal 1 damage if you have less than 10 HP.');
  });

  // ... if this card deals at least 7 damage.

  // test('if you have less than half HP', () => {
  //   effect.if = {
  //     type: 'playerValue',
  //     target: 'self',
  //     name: 'health',
  //     comparison: '<',
  //     compareTo: { type: 'percentHealth', value: 0.5 },
  //   };

  //   expect(render(card)).toBe('Deal 1 damage if you have less than half HP.');
  // });

  // test('if you have less HP than the enemy', () => {
  //   effect.if = {
  //     type: 'playerValue',
  //     target: 'self',
  //     name: 'health',
  //     comparison: '<',
  //     compareTo: { type: 'opponent' },
  //   };

  //   expect(render(card)).toBe('Deal 1 damage if you have less HP than the enemy.');
  // });
});

// it('renders repeat', () => {
//   card.repeat = {
//     value: 1,
//     multiplyBy: {
//       type: 'playerValue',
//       target: 'opponent',
//       name: 'bleed',
//     },
//   };
//   expect(render(card)).toBe('Deal 1 damage. Repeat for each bleed the enemy has.');
// });
