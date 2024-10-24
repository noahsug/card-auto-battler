import channel from './images/channel.jpeg';
import eviscerate from './images/eviscerate.jpeg';
import firePower from './images/fire-power.jpeg';
import fireball from './images/fireball.png';
import parry from './images/parry.png';
import phoenix from './images/phoenix.jpeg';
import punch from './images/punch.png';
import volcano from './images/volcano.jpeg';

import type { CardState } from '../../game/gameState';
import { createCard, value as v } from '../utils/createCard';

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

export const allCards: Record<string, CardState> = {
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
        multiHit: v('opponent', 'bleed'),
      },
    ],
    {
      name: 'Eviscerate',
      description: 'Deal 2 damage 1 time for every bleed the enemy has.',
      image: eviscerate,
    },
  ),
};
