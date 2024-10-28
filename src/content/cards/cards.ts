import channel from './images/channel.jpeg';
import eviscerate from './images/eviscerate.jpeg';
import firePower from './images/fire-power.jpeg';
import fireball from './images/fireball.png';
import parry from './images/parry.png';
import phoenix from './images/phoenix.jpeg';
import punch from './images/punch.png';
import volcano from './images/volcano.jpeg';
import cross from './images/cross.png';
import growingClub from './images/growing-club.png';
import treeFall from './images/tree-fall.png';
import bless from './images/bless.jpeg';
import forestPath from './images/forest-path.jpeg';
import curledLeaf from './images/curled-leaf.png';
import regrowth from './images/regrowth.png';
import angryGiant from './images/angry-giant.jpeg';
import heavyRock from './images/heavy-rock.jpeg';

import { createCard, ifCompare, ifHas, value as v } from '../utils/createCard';

export const basicCards = {
  attack: createCard(
    [
      {
        value: v(5),
      },
    ],
    {
      name: 'Punch',
      description: `Deal $V damage.`,
      image: punch,
    },
  ),
  heal: createCard(
    [
      {
        target: 'self',
        name: 'heal',
        value: v(5),
      },
    ],
    {
      name: 'Mend',
      description: 'Gain $V HP.',
      image: cross,
    },
  ),
};

export const greenCards = {
  damagePerTurn: createCard(
    [
      {
        value: v('self', 'turn', 1),
      },
    ],
    {
      name: 'Evergrowing Club',
      description: `Deal 1 damage. Grow +$V damage at the end of your turn.`,
      image: growingClub,
    },
  ),
  damageForGreen: createCard(
    [
      {
        value: v(4),
        multiply: {
          value: v(2),
          if: ifCompare('self', 'percentGreen', '>=', 50),
        },
      },
    ],
    {
      name: 'Treefall',
      description: `Deal $V damage. Deal double damage if at least half your cards are green.`,
      image: treeFall,
    },
  ),
  healForGreen: createCard(
    [
      {
        target: 'self',
        name: 'heal',
        value: v(4),
      },
    ],
    {
      repeat: {
        value: v(1),
        if: ifHas('self', 'prevCardIsGreen'),
      },
      name: 'Regrowth',
      description: `Gain $V HP. Repeat if your previous card played was green.`,
      image: regrowth,
    },
  ),
  regen: createCard(
    [
      {
        target: 'self',
        name: 'regen',
        value: v(3),
      },
    ],
    {
      name: 'Regeneration',
      description: `Gain $V regeneration.`,
      image: curledLeaf,
    },
  ),
  gainStrengthAndRegen: createCard(
    [
      {
        target: 'self',
        name: 'strength',
        value: v('self', 'regen'),
      },
      {
        target: 'self',
        name: 'regen',
        value: v(2),
      },
    ],
    {
      name: `Bless`,
      description: `Gain strength equal to your regeneration. Gain $2V regeneration.`,
      image: bless,
    },
  ),
  damageIfNoDamage: createCard(
    [
      {
        value: v('self', 'health', 0.3),
        if: ifCompare('self', 'damageDealtLastTurn', '=', 0),
      },
    ],
    {
      name: 'Not So Gentle',
      description: `Deal $V% of your current health as damage if you dealt no damage last turn.`,
      image: angryGiant,
    },
  ),
  damageFromStrength: createCard(
    [
      {
        value: v(3),
        add: {
          value: v('self', 'strength', 2),
        },
      },
    ],
    {
      name: 'Boulder Bash',
      description: `Deal $V damage. Strength affects this card $A+1 times.`,
      image: heavyRock,
    },
  ),
};

Object.values(greenCards).forEach((card) => {
  card.tribe = 'green';
});

export const redCards = {
  fireball: createCard(
    [
      {
        value: v('self', 'cardsPlayedThisTurn', 3),
      },
    ],
    {
      name: 'Fireball',
      description: 'Deal $V damage for each card played this turn.',
      image: fireball,
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
      description: 'Deal $V damage 1 time for every bleed the enemy has.',
      image: eviscerate,
    },
  ),
};
Object.values(redCards).forEach((card) => {
  card.tribe = 'red';
});

export const purpleCards = {
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
};

Object.values(purpleCards).forEach((card) => {
  card.tribe = 'purple';
});

export const allCards = {
  ...basicCards,
  ...redCards,
  ...greenCards,
  ...purpleCards,
};
