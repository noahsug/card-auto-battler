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

const fireCards = {
  channel: createCard(
    [
      {
        target: 'self',
        name: 'extraCardPlays',
      },
    ],
    {
      name: 'Channel',
      description: 'Play another card.',
      image: channel,
    },
  ),
  fireball: createCard(
    [
      {
        value: v('self', 'cardsPlayedThisTurn', 3),
      },
    ],
    {
      name: 'Fireball',
      description: 'Deal 3 damage for each card played this turn.',
      image: fireball,
    },
  ),
};

export const allCards = {
  ...fireCards,
  punch: createCard(
    [
      {
        value: v(7),
      },
    ],
    {
      name: 'Serious Punch',
      description: 'Deal 7 damage.',
      image: punch,
    },
  ),

  eviscerate: createCard(
    [
      {
        value: v(2),
      },
    ],
    {
      repeat: { value: v('opponent', 'bleed') },
      name: 'Eviscerate',
      description: 'Deal 2 damage. Repeat for each bleed the enemy has.',
      image: eviscerate,
    },
  ),
} satisfies Record<string, CardState>;
