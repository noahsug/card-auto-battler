import getCardTextComponents, {
  CardEffect,
  CardState,
  KeywordText,
  PlainText,
  SymbolText,
  TextComponent,
  ValueText,
} from './getCardTextComponents';

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

function renderTextComponent(component: TextComponent): string {
  switch (component.type) {
    case 'plain':
    case 'keyword':
      return component.text;
    case 'symbol':
      return component.symbolName;
    case 'value':
      return String(component.value);
  }
}

function render(card: CardState) {
  const text = [];
  const lines = getCardTextComponents(card);
  for (const textComponents of lines) {
    const line = textComponents.map(renderTextComponent);
    text.push(`${line.join('')}.`);
  }

  return text.join(' ');
}

let effect = {
  target: 'opponent',
  name: 'damage',
  value: 1,
} as CardEffect;

let card = { effects: [effect] };

beforeEach(() => {
  effect = {
    target: 'opponent',
    name: 'damage',
    value: 1,
  } as CardEffect;

  card = { effects: [effect] };
});

describe('renders damage', () => {
  beforeEach(() => {
    effect.value = 3;
  });

  test('deal damage', () => {
    expect(render(card)).toBe('Deal 3 damage.');
  });

  test('take damage', () => {
    effect.target = 'self';
    expect(render(card)).toBe('Take 3 damage.');
  });
});

describe('renders trash', () => {
  beforeEach(() => {
    effect.name = 'trash';
  });

  test('enemy trashes', () => {
    expect(render(card)).toBe('Enemy trashes 1.');
  });

  test('you trash', () => {
    effect.target = 'self';
    expect(render(card)).toBe('You trash 1.');
  });
});

// describe('renders play extra cards', () => {
//   beforeEach(() => {
//     effect.name = 'extraCardPlays';
//   });

//   test('the enemy plays an extra card', () => {
//     expect(render(card)).toBe('Enemy plays 1 extra card next turn.');
//   });

//   test('the enemy plays multiple extra cards', () => {
//     effect.value = 3;

//     expect(render(card)).toBe('Enemy plays 3 extra cards next turn.');
//   });

//   test('you play extra cards', () => {
//     effect.target = 'self';

//     expect(render(card)).toBe('Play 1 card.');
//   });

//   test('you play multiple extra cards', () => {
//     effect.target = 'self';
//     effect.value = 3;

//     expect(render(card)).toBe('Play 3 cards.');
//   });
// });

it('renders multi-hits', () => {
  effect.multiHit = 2;

  expect(render(card)).toBe('Deal 1 damage 2 times.');
});

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
//       type: 'opponent',
//       name: 'bleed',
//     };

//     // Note that the `effect.and.value` is ignored when `effect.multiplyBy` is present
//     expect(render(card)).toBe(`Deal damage and apply bleed equal to the enemy's bleed.`);
//   });
// });

describe('renders effects based on another value', () => {
  beforeEach(() => {
    effect.multiplyBy = {
      type: 'opponent',
      name: 'bleed',
    };
  });

  test('equal to enemy bleed', () => {
    expect(render(card)).toBe(`Deal damage equal to the enemy's bleed.`);
  });

  test('equal to enemy bleed with multi-hit', () => {
    effect.multiHit = 2;

    expect(render(card)).toBe(`Deal damage equal to the enemy's bleed 2 times.`);
  });

  test('equal to self bleed', () => {
    effect.multiplyBy!.type = 'self';
    expect(render(card)).toBe(`Deal damage equal to your bleed.`);
  });

  test('equal to two times enemy bleed', () => {
    effect.value = 2;
    expect(render(card)).toBe(`Deal damage equal to twice the enemy's bleed.`);
  });

  test('equal to 3 times enemy bleed', () => {
    effect.value = 3;
    expect(render(card)).toBe(`Deal damage equal to 3 times the enemy's bleed.`);
  });

  test('equal to half enemy bleed', () => {
    effect.value = 0.5;
    expect(render(card)).toBe(`Deal damage equal to half the enemy's bleed.`);
  });

  test('equal to one quarter enemy bleed', () => {
    effect.value = 0.25;
    expect(render(card)).toBe(`Deal damage equal to 1/4 the enemy's bleed.`);
  });

  test('equal to cards played', () => {
    effect.multiplyBy = {
      type: 'self',
      name: 'cardsPlayedThisTurn',
    };

    expect(render(card)).toBe(`Deal damage equal to the number of cards you've played this turn.`);
  });

  test('equal to cards trashed', () => {
    effect.multiplyBy = {
      type: 'opponent',
      name: 'trashedCards',
    };

    expect(render(card)).toBe(`Deal damage equal to the number of cards the enemy has trashed.`);
  });

  test('equal to missing health', () => {});
});

describe('renders conditionals', () => {
  test('if the enemy has dodge', () => {
    effect.if = {
      type: 'opponent',
      playerValue: 'dodge',
      comparison: '>',
      compareTo: { type: 'value', value: 0 },
    };

    expect(render(card)).toBe('Deal 1 damage if the enemy has dodge.');
  });

  test('if you have at least 3 bleed', () => {
    effect.if = {
      type: 'self',
      playerValue: 'bleed',
      comparison: '>=',
      compareTo: { type: 'value', value: 3 },
    };

    expect(render(card)).toBe('Deal 1 damage if you have at least 3 bleed.');
  });

  // ... if this card deals at least 7 damage.
  // ... if you've played two cards this turn.

  // test('if you have less than half HP', () => {
  //   effect.if = {
  //     type: 'percentHealth',
  //     target: 'self',
  //     comparison: '<',
  //     compareTo: { type: 'value', value: 0.5 },
  //   };

  //   expect(render(card)).toBe('Deal 1 damage if you have less than half HP.');
  // });

  // test('if you have less HP than the enemy', () => {
  //   effect.if = {
  //     type: 'self',
  //     name: 'health',
  //     comparison: '<',
  //     compareTo: { type: 'opponent' },
  //   };

  //   expect(render(card)).toBe('Deal 1 damage if you have less HP than the enemy.');
  // });
});

describe('indicates symbols, keywords and values', () => {
  function getComponentValues(card: CardState, type: TextComponent['type']) {
    const componentLists = getCardTextComponents(card);
    const components = componentLists.flat().filter((c) => c.type === type);

    if (type === 'value') {
      return components.map((c) => (c as ValueText).value);
    }
    if (type === 'symbol') {
      return components.map((c) => (c as SymbolText).symbolName);
    }
    if (type === 'plain') {
      return components.map((c) => (c as PlainText).text);
    }
    if (type === 'keyword') {
      return components.map((c) => (c as KeywordText).keyword);
    }
  }

  test('deal damage', () => {
    expect(getComponentValues(card, 'value')).toEqual([1]);
    expect(getComponentValues(card, 'symbol')).toEqual(['damage']);
  });

  test('trash cards', () => {
    effect.name = 'trash';

    expect(getComponentValues(card, 'value')).toEqual([1]);
    expect(getComponentValues(card, 'keyword')).toEqual(['trash']);
  });

  test('if has bleed', () => {
    effect.if = {
      type: 'self',
      playerValue: 'bleed',
      comparison: '>=',
      compareTo: { type: 'value', value: 3 },
    };

    expect(getComponentValues(card, 'value')).toEqual([1, 3]);
    expect(getComponentValues(card, 'symbol')).toEqual(['damage', 'bleed']);
  });

  test('equal to bleed', () => {
    effect.multiplyBy = {
      type: 'self',
      name: 'bleed',
    };

    expect(getComponentValues(card, 'value')).toEqual([]);
    expect(getComponentValues(card, 'symbol')).toEqual(['damage', 'bleed']);
    expect(getComponentValues(card, 'keyword')).toEqual([]);
  });
});
