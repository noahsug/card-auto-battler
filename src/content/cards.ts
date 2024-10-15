import channel from './images/cards/channel.jpeg';
import eviscerate from './images/cards/eviscerate.jpeg';
import firePower from './images/cards/fire-power.jpeg';
import fireball from './images/cards/fireball.png';
import parry from './images/cards/parry.png';
import phoenix from './images/cards/phoenix.jpeg';
import punch from './images/cards/punch.png';
import volcano from './images/cards/volcano.jpeg';

import type { CardState } from '../game/gameState';
import { createCard, value as v } from './utils';

export const allCards = {
  punch: createCard(
    {
      value: v(7),
    },
    {
      name: 'Serious Punch',
      description: 'Deal 7 damage.',
      image: punch,
    },
  ),
  fireball: createCard(
    {
      value: v(2),
    },
    {
      effects: [
        {
          target: 'self',
          name: 'extraCardPlays',
        },
      ],
      name: 'Fireball',
      description: 'Deal 2 damage. Play an extra card.',
      image: fireball,
    },
  ),
  eviscerate: createCard(
    {
      value: v(2),
    },
    {
      repeat: { value: v('opponent', 'bleed') },
      name: 'Eviscerate',
      description: 'Deal 2 damage. Repeat for each bleed the enemy has.',
      image: eviscerate,
    },
  ),
} satisfies Record<string, CardState>;
