import channelImage from './images/channel.jpeg';
import eviscerateImage from './images/eviscerate.jpeg';
import firePowerImage from './images/fire-power.png';
import fireballImage from './images/fireball.png';
import parryImage from './images/parry.png';
import phoenixImage from './images/phoenix.jpeg';
import punchImage from './images/punch.png';
import volcanoImage from './images/volcano.jpeg';
import crossImage from './images/cross.png';
import growingClubImage from './images/growing-club.png';
import treeFallImage from './images/tree-fall.png';
import blessImage from './images/bless.jpeg';
import curledLeafImage from './images/curled-leaf.png';
import regrowthImage from './images/regrowth.jpeg';
import angryGiantImage from './images/angry-giant.jpeg';
import heavyRockImage from './images/heavy-rock.jpeg';
import leftJabImage from './images/left-jab.png';
import uppercutImage from './images/uppercut.png';
import manyJabsImage from './images/many-jabs.jpeg';
import bloodbathImage from './images/bloodbath.jpeg';
import bloodBoilImage from './images/blood-boil.jpeg';
import lifestealImage from './images/lifesteal.jpeg';
import personOnFireImage from './images/person-on-fire.jpeg';
import bladeBloodFireImage from './images/blade-blood-fire.jpeg';
import yellowShockImage from './images/yellow-shock.jpeg';
import lightningImage from './images/lightning.jpeg';
import electricTrapImage from './images/electric-trap.png';
import tripleStrikeImage from './images/triple-strike.png';

import { createCard, ifCompare, ifHas, value as v } from '../utils/createCard';

/**
 * Basic cards
 */
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
      image: punchImage,
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
      description: 'Heal $V HP.',
      image: crossImage,
    },
  ),
};

/**
 * Green cards
 */
export const greenCards = {
  damagePerTurn: createCard(
    [
      {
        value: v('self', 'turn', 1),
      },
    ],
    {
      name: 'Evergrowing Club',
      description: `Deal 1 damage. Grow +$V damage at the end of each of your turns.`,
      image: growingClubImage,
    },
  ),
  damageForGreen: createCard(
    [
      {
        value: v(4),
        multiply: {
          value: v(2),
          if: ifCompare('self', 'percentGreen', '>=', 0.5),
        },
      },
    ],
    {
      name: 'Treefall',
      description: `Deal $V damage. Deal double damage if at least half your cards are green.`,
      image: treeFallImage,
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
      description: `Heal $V HP. Repeat if your previous card played was green.`,
      image: regrowthImage,
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
      image: curledLeafImage,
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
      image: blessImage,
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
      image: angryGiantImage,
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
      image: heavyRockImage,
    },
  ),
};
Object.values(greenCards).forEach((card) => {
  card.tribe = 'green';
});

/**
 * Red cards
 */
export const redCards = {
  fireball: createCard(
    [
      {
        value: v(8),
      },
    ],
    {
      trash: true,
      name: 'Fireball',
      description: 'Deal $V damage. Trash.',
      image: fireballImage,
    },
  ),
  channel: createCard(
    [
      {
        target: 'self',
        name: 'channel',
      },
      {
        target: 'self',
        name: 'extraCardPlays',
      },
    ],
    {
      name: 'Channel',
      description:
        'The next "fire" card you play this turn deals double damage. Play another card.',
      image: channelImage,
    },
  ),
  fireSpears: createCard(
    [
      {
        name: 'damage',
        value: v(3),
        multiHit: v(2),
      },
      {
        target: 'self',
        name: 'burn',
        value: v(2),
      },
    ],
    {
      name: 'Pillars of Fire',
      description: 'Deal $V damage $N times. Apply $2V burn to yourself.',
      image: firePowerImage,
    },
  ),
  hellFire: createCard(
    [
      {
        name: 'damage',
        value: v(6),
      },
      {
        name: 'burn',
        value: v(4),
      },
      {
        target: 'self',
        name: 'damage',
        value: v(6),
      },
      {
        target: 'self',
        name: 'burn',
        value: v(4),
      },
    ],
    {
      name: 'Hellfire',
      description: 'Deal $V damage and $2V burn to the enemy and yourself.',
      image: volcanoImage,
    },
  ),
  phoenixFire: createCard(
    [
      {
        name: 'damage',
        value: v(3),
      },
      {
        name: 'burn',
        value: v('opponent', 'damageDealtToTarget'),
      },
    ],
    {
      name: 'Phoenix Fire',
      description: 'Deal $V damage. Apply burn equal to damage dealt.',
      image: phoenixImage,
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
      image: eviscerateImage,
    },
  ),
  bloodBath: createCard(
    [
      {
        name: 'bleed',
        value: v(4),
      },
      {
        target: 'self',
        name: 'bleed',
        value: v(1),
      },
    ],
    {
      trash: true,
      name: 'Bloodbath',
      description: 'Apply $V bleed the enemy and $2V bleed to yourself.',
      image: bloodbathImage,
    },
  ),
  bloodBoil: createCard(
    [
      {
        target: 'self',
        name: 'burn',
        value: v(4),
      },
      {
        target: 'self',
        name: 'strength',
        value: v(3),
      },
      {
        target: 'self',
        name: 'set',
        valueName: 'bleed',
        value: v(0),
      },
    ],
    {
      name: 'Blood Boil',
      description: `Gain $V burn and $2V strength. Remove all your bleed.`,
      image: bloodBoilImage,
    },
  ),
  lifesteal: createCard(
    [
      {
        value: v(3),
      },
    ],
    {
      lifesteal: { value: v(1) },
      name: 'Reap',
      description: 'Deal $V damage. Lifesteal.',
      image: lifestealImage,
    },
  ),
  lifestealWithBurn: createCard(
    [
      {
        target: 'self',
        name: 'lifestealWhenBurning',
        value: v(1),
      },
      {
        target: 'self',
        name: 'burn',
        value: v(4),
      },
    ],
    {
      trash: true,
      name: 'Power Through Flame',
      description: `Gain lifesteal when burning. Gain $2V burn. Trash.`,
      image: personOnFireImage,
    },
  ),
  bleedAndBurn: createCard(
    [
      {
        name: 'damage',
        value: v(2),
      },
      {
        name: 'bleed',
        value: v(2),
      },
      {
        name: 'burn',
        value: v(2),
      },
    ],
    {
      name: 'Searing Blade',
      description: 'Deal $V damage. Apply $2V bleed and $3V burn.',
      image: bladeBloodFireImage,
    },
  ),
};
Object.values(redCards).forEach((card) => {
  card.tribe = 'red';
});

/**
 * Purple cards
 */
export const purpleCards = {
  jabOne: createCard(
    [
      {
        value: v(1),
      },
      {
        target: 'self',
        name: 'extraCardPlays',
      },
    ],
    {
      name: 'Left Jab',
      description: 'Deal $V damage. Play another card.',
      image: leftJabImage,
    },
  ),
  jabTwo: createCard(
    [
      {
        value: v(4),
        multiply: {
          value: v(2),
          if: ifCompare('self', 'cardsPlayedThisTurn', '>=', 2),
        },
      },
      {
        target: 'self',
        name: 'extraCardPlays',
        if: ifCompare('self', 'cardsPlayedThisTurn', '>=', 2),
      },
    ],
    {
      name: 'Right Upper',
      description: `Deal $V damage. Deal double damage and play another card if you've played another card this turn.`,
      image: uppercutImage,
    },
  ),
  jabThree: createCard(
    [
      {
        value: v(3),
        multiHit: v('self', 'cardsPlayedThisTurn'),
      },
    ],
    {
      name: 'Finisher',
      description: `Deal $V damage 1 time for each card played this turn.`,
      image: tripleStrikeImage,
    },
  ),
  shock: createCard(
    [
      {
        name: 'damage',
        value: v(3),
      },
      {
        name: 'shock',
        value: v(3),
      },
    ],
    {
      name: 'Thunder Struck',
      description: 'Deal $V damage. Apply $2V shock.',
      image: lightningImage,
    },
  ),
  shockTrap: createCard(
    [
      {
        target: 'self',
        name: 'shockOpponentNextTurn',
        value: v(1),
      },
    ],
    {
      name: 'Shock Trap',
      description: 'Apply $V shock to the enemy at the start of your next turn.',
      image: electricTrapImage,
    },
  ),
  shockPunch: createCard(
    [
      {
        name: 'shock',
        value: v(1),
      },
      {
        target: 'self',
        name: 'extraCardPlays',
      },
    ],
    {
      name: 'Electric Jab',
      description: `Apply $V shock. Play another card.`,
      image: yellowShockImage,
    },
  ),
  tripleJab: createCard(
    [
      {
        value: v(1),
        multiHit: v(3),
      },
    ],
    {
      name: 'Rapid Jabs',
      description: 'Deal $V damage 3 times.',
      image: manyJabsImage,
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
