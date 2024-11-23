import { createCard, value as v } from '../../../content/utils/createCard';
import { parseCardDescriptionTemplate } from './parseCardDescriptionTemplate';

it('parses basic values', () => {
  const description = parseCardDescriptionTemplate(
    createCard([{}], {
      description: 'Deals $V damage',
    }),
  );
  expect(description).toBe('Deals 1 damage');
});

it('parses basic values from multiple effects', () => {
  const description = parseCardDescriptionTemplate(
    createCard(
      [
        {},
        {
          value: v(3),
        },
      ],
      {
        description: 'Deals $V damage. Deals $2V damage.',
      },
    ),
  );
  expect(description).toBe('Deals 1 damage. Deals 3 damage.');
});

it('handles percentages', () => {
  const description = parseCardDescriptionTemplate(
    createCard(
      [
        {
          value: v('self', 'health', 0.3),
        },
      ],
      {
        description: 'Deal $V% of your current health as damage.',
      },
    ),
  );
  expect(description).toBe('Deal 30% of your current health as damage.');

  const description2 = parseCardDescriptionTemplate(
    createCard(
      [
        {
          name: 'lifestealWhenBurning',
          value: v(0.5),
          target: 'self',
        },
      ],
      {
        description: 'Gain $V% lifesteal when burning.',
      },
    ),
  );
  expect(description2).toBe('Gain 50% lifesteal when burning.');
});

it('handles addition', () => {
  const description = parseCardDescriptionTemplate(
    createCard(
      [
        {
          add: {
            value: v('self', 'strength', 2),
          },
        },
      ],
      {
        description: 'Deal $V damage. Strength affects this card $A+1 times.',
      },
    ),
  );
  expect(description).toBe('Deal 1 damage. Strength affects this card 3 times.');
});
