import { createCard, value as v } from '../../../content/utils/createCard';
import { parseDescriptionTemplate } from './parseDescriptionTemplate';

it('parses basic values', () => {
  const description = parseDescriptionTemplate(
    createCard([{}], {
      description: 'Deals $V damage',
    }),
  );
  expect(description).toBe('Deals 1 damage');
});

it('parses basic values from multiple effects', () => {
  const description = parseDescriptionTemplate(
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
