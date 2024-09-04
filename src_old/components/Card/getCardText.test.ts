import getCardText from './getCardText';

import { createCard, ifCompare, ifHas, getValueDescriptor as v } from '../../gameState/utils';
import { CardEffect, CardState, PlayerValueDescriptor } from '../../gameState/gameState';
import { STARTING_HEALTH } from '../../gameState';

// Deal 2 damage 3 times.
// Each hit deals 2 extra damage if you have less than half HP.
// Each hit deals extra damage equal to your bleed.

// Trash. // trashSelf: true

// Play the top damage card from your deck.

// Deal 10 damage if this is the first card you played this turn.

// Set your HP to half.

// Deal 10 damage.
// Misses if you have more HP than the enemy.

// Deal 1 damage 3 times.
// Momentum: Each hit deals extra damage equal to your bleed (3).

// Deal 3 damage.
// Deal another 5 damage if the enemy has bleed.

// Deal 3 damage.
// Lifesteal if this card deals at least 7 damage.

// Deal 3 damage.
// Apply bleed equal to damage dealt.
// Apply 2 bleed if this hits. // onHit: { name: 'bleed', value: 2 }

// Deal 10 damage.
// Take 5 damage if this misses. // onMiss: { target: 'self', name: 'damage', value: 5 }

// Deal 1 damage.
// Play 1 card.
// Momentum: Play 1 card. // triggers when you've played more than one card this turn.

// Every 4 cards you play, gain 1 dodge. // { name: 'dodgeEvery4Cards', value: 1 }

// Enemy cards deal 1 less damage for the next 3 turns.

// ALL damage is reduced by 2 for the next 3 turns. // including your damage to opponent?

// Deal damage equal to the turn number.

// Deal 2 damage equal for every 5 missing health.

// effect.and
//
// BAD: confusing, do not support
// Deal 3 damage and gain 2 strength if you have full HP.
// Deal damage and apply bleed equal to the enemy's bleed.
//
// But this can be useful for "Momentum: Deal 2 damage and play 1 card."

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
    expect(render(card)).toBe(
      `Deal damage equal to the number of cards the enemy played last turn.`,
    );

    effect.value = v('self', 'cardsPlayedThisTurn');
    expect(render(card)).toBe(`Deal damage equal to the number of cards you've played this turn.`);
  });

  test('equal to cards trashed', () => {
    effect.value = v('opponent', 'trashedCards');
    expect(render(card)).toBe(`Deal damage equal to the number of cards the enemy trashed.`);

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
    expect(render(card)).toBe(`Triple your strength.`);
  });

  test(`double the enemy's bleed`, () => {
    card = createCard({ name: 'bleed', value: v('opponent', 'bleed') });
    expect(render(card)).toBe(`Double the enemy's bleed.`);
  });
});

describe('renders if statements', () => {
  test('if the enemy has dodge', () => {
    effect.if = {
      value: v('opponent', 'dodge'),
      comparison: '>',
      value2: v(0),
    };

    expect(render(card)).toBe('Deal 1 damage if the enemy has dodge.');

    effect.name = 'trash';
    expect(render(card)).toBe('Enemy trashes 1 if they have dodge.');

    effect.name = 'extraCardPlays';
    expect(render(card)).toBe('Enemy plays 1 extra card next turn if they have dodge.');
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
    expect(render(card)).toBe(`Deal 1 damage if the enemy trashed at least 2 cards.`);
  });

  test('if you have less than 10 HP', () => {
    effect.if = {
      value: v('self', 'health'),
      comparison: '<',
      value2: v(10),
    };
    expect(render(card)).toBe('Deal 1 damage if you have less than 10 HP.');
  });
});

describe('renders repeat', () => {
  it('repeats for each bleed', () => {
    card.repeat = { value: v('opponent', 'bleed') };
    expect(render(card)).toBe('Deal 1 damage. Repeat for each bleed the enemy has.');

    card.repeat.if = ifCompare('opponent', 'health', '<', STARTING_HEALTH / 2);
    expect(render(card)).toBe(
      'Deal 1 damage. Repeat for each bleed the enemy has if the enemy has less than 10 HP.',
    );
  });

  it('repeats 3 times', () => {
    card.repeat = {
      value: v(3),
      if: ifHas('opponent', 'bleed'),
    };
    expect(render(card)).toBe('Deal 1 damage. Repeat 3 times if the enemy has bleed.');
  });
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

    expect(render(card)).toBe('Deal 1 damage. Deal +3 extra damage if the enemy has bleed.');

    effect.name = 'bleed';
    expect(render(card)).toBe('Apply 1 bleed. Apply 3 extra bleed if the enemy has bleed.');

    effect.name = 'extraCardPlays';
    expect(render(card)).toBe(
      'Enemy plays 1 extra card next turn. Enemy plays 3 extra cards next turn if they have bleed.',
    );

    effect.name = 'trash';
    expect(render(card)).toBe('Enemy trashes 1. Enemy trashes 3 more if they have bleed.');

    effect.target = 'self';
    expect(render(card)).toBe('You trash 1. You trash 3 more if the enemy has bleed.');
  });

  test('deals extra damage equal to bleed', () => {
    effect.add = {
      value: v('opponent', 'bleed'),
    };

    expect(render(card)).toBe(`Deal 1 damage. Deal extra damage equal to the enemy's bleed.`);
  });

  test('strength effects this card 3 times', () => {
    effect.add = {
      value: v('self', 'strength', 2),
    };

    expect(render(card)).toBe('Deal 1 damage. Strength affects this card 3 times.');
  });
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
