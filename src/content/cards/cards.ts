import channelImage from './images/channel.jpeg';
import eviscerateImage from './images/eviscerate.jpeg';
import firePowerImage from './images/fire-power.png';
import fireballImage from './images/fireball.png';
import parryImage from './images/parry.png';
import phoenixImage from './images/phoenix.jpeg';
import punchImage from './images/punch.png';
import bigPunchImage from './images/big-punch.png';
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
import stealthImage from './images/stealth.jpeg';
import pumpUpImage from './images/pump-up.png';
import dodgePotionImage from './images/dodge-potion.jpeg';
import critPotionImage from './images/crit-potion.jpeg';
import regenPotionImage from './images/regen-potion.jpeg';
import damagePotionImage from './images/damage-potion.jpeg';
import adrenalinePotionImage from './images/adrenaline-potion.jpeg';
import strengthPotionImage from './images/strength-potion.jpeg';

import windUpImage from './images/enemy/wind-up.png';
import greenMonsterAttackImage from './images/enemy/green-monster-attack.png';
import hideImage from './images/enemy/hide.png';
import thickSkinImage from './images/enemy/thick-skin.png';
import swipeImage from './images/enemy/swipe.png';
import focusedImage from './images/enemy/focused.png';
import scratchImage from './images/enemy/scratch.png';
import peckImage from './images/enemy/peck.png';

import { createCard, ifCompare, ifHas, value as v, playAnotherCard } from '../utils/createCard';

/**
 * Basic cards
 */
export const basicCardsByType = {
  attack: createCard(
    [
      {
        value: v(4),
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
        type: 'heal',
        value: v(5),
      },
    ],
    {
      name: 'Mend',
      description: 'Heal $V HP.',
      image: crossImage,
    },
  ),
  dodge: createCard(
    [
      {
        target: 'self',
        type: 'dodge',
      },
    ],
    {
      name: 'Parry',
      description: 'Gain $V dodge.',
      image: parryImage,
    },
  ),
};

/**
 * Green cards
 */
export const greenCardsByType = {
  thickSkin: createCard(
    [
      {
        target: 'self',
        type: 'thickSkin',
        value: v(4),
      },
    ],
    {
      name: 'Thick Skin',
      description: 'Gain $V thick skin.',
      image: thickSkinImage,
    },
  ),
  growingClub: createCard(
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
        target: 'self',
        type: 'crit',
        if: ifCompare('self', 'percentGreen', '>=', 0.5),
      },
      {
        value: v(4),
      },
    ],
    {
      name: 'Treefall',
      description: `Deal $2V damage. Crit if at least half your cards are green.`,
      image: treeFallImage,
    },
  ),
  healForGreen: createCard(
    [
      {
        target: 'self',
        type: 'heal',
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
        type: 'regen',
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
        type: 'strength',
        value: v('self', 'regen'),
      },
      {
        target: 'self',
        type: 'regen',
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
Object.values(greenCardsByType).forEach((card) => {
  card.tribe = 'green';
});

/**
 * Red cards
 */
export const redCardsByType = {
  fireball: createCard(
    [
      {
        value: v(8),
      },
    ],
    {
      trash: true,
      name: 'Fireball',
      description: 'Deal $V damage.',
      image: fireballImage,
    },
  ),
  channel: createCard(
    [
      {
        target: 'self',
        type: 'temporaryFireCrit',
      },
      playAnotherCard(),
    ],
    {
      name: 'Channel',
      description: 'The next "fire" attack this turn will crit. Play another card.',
      image: channelImage,
    },
  ),
  fireSpears: createCard(
    [
      {
        type: 'damage',
        value: v(3),
        multiHit: v(2),
      },
      {
        target: 'self',
        type: 'burn',
        value: v(2),
      },
    ],
    {
      name: 'Pillars of Fire',
      description: 'Deal $V damage $N times. Apply $2V burn to yourself.',
      image: firePowerImage,
    },
  ),
  fireDamageToAll: createCard(
    [
      {
        type: 'damage',
        value: v(6),
      },
      {
        type: 'burn',
        value: v(4),
      },
      {
        target: 'self',
        type: 'damage',
        value: v(6),
      },
      {
        target: 'self',
        type: 'burn',
        value: v(4),
      },
    ],
    {
      name: 'Firestorm',
      description: 'Deal $V damage and $2V burn to the enemy and yourself.',
      image: volcanoImage,
    },
  ),
  phoenixFire: createCard(
    [
      {
        type: 'damage',
        value: v(3),
      },
      {
        type: 'burn',
        value: v('opponent', 'cardDamageDealtToTarget'),
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
        type: 'bleed',
        value: v(4),
      },
      {
        target: 'self',
        type: 'bleed',
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
        type: 'burn',
        value: v(4),
      },
      {
        target: 'self',
        type: 'strength',
        value: v(3),
      },
      {
        target: 'self',
        type: 'set',
        valueType: 'bleed',
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
        type: 'lifestealWhenBurning',
        value: v(1),
      },
      {
        target: 'self',
        type: 'burn',
        value: v(4),
      },
    ],
    {
      trash: true,
      name: 'Power Through Flame',
      description: `Gain lifesteal when burning. Gain $2V burn.`,
      image: personOnFireImage,
    },
  ),
  bleedAndBurn: createCard(
    [
      {
        type: 'damage',
        value: v(2),
      },
      {
        type: 'bleed',
        value: v(2),
      },
      {
        type: 'burn',
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
Object.values(redCardsByType).forEach((card) => {
  card.tribe = 'red';
});

/**
 * Purple cards
 */
export const purpleCardsByType = {
  jabOne: createCard(
    [
      {
        value: v(1),
      },
      playAnotherCard(),
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
        target: 'self',
        type: 'crit',
        if: ifCompare('self', 'cardsPlayedThisTurn', '>=', 2),
      },
      {
        value: v(4),
      },
      {
        ...playAnotherCard(),
        if: ifCompare('self', 'cardsPlayedThisTurn', '>=', 2),
      },
    ],
    {
      name: 'Right Upper',
      description: `Deal $2V damage. Combo: crit and play another card.`,
      image: uppercutImage,
    },
  ),
  finisher: createCard(
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
        type: 'damage',
        value: v(4),
      },
      {
        type: 'shock',
        value: v(2),
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
        type: 'delayedShock',
        value: v(1),
      },
      playAnotherCard(),
    ],
    {
      name: 'Shock Trap',
      description: `Apply $V shock at the start of the enemy's turn. Play another card.`,
      image: electricTrapImage,
    },
  ),
  shockPunch: createCard(
    [
      {
        type: 'shock',
      },
      playAnotherCard(),
    ],
    {
      name: 'Electric Jab',
      description: `Apply $V shock. Play another card.`,
      image: yellowShockImage,
    },
  ),
  rapidJabs: createCard(
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
  stealth: createCard(
    [
      {
        target: 'self',
        type: 'temporaryDodge',
        value: v(Infinity),
      },
      {
        target: 'self',
        type: 'crit',
      },
    ],
    {
      name: 'Stealth',
      description: 'Dodge all attacks until your next turn. Your next attack will crit.',
      image: stealthImage,
    },
  ),
  pumpedUp: createCard(
    [
      {
        target: 'self',
        type: 'temporaryStrength',
        value: v(2),
      },
      playAnotherCard(),
    ],
    {
      name: 'Pumped Up',
      description: 'Gain $V strength this turn. Play another card.',
      image: pumpUpImage,
    },
  ),
};
Object.values(purpleCardsByType).forEach((card) => {
  card.tribe = 'purple';
});

export const potionByType = {
  regenPotion: createCard(
    [
      {
        target: 'self',
        type: 'regen',
        value: v(5),
      },
      playAnotherCard(),
    ],
    {
      trash: true,
      uses: 2,
      name: 'Regen Potion',
      description: 'Gain $V regen and play another card.',
      image: regenPotionImage,
    },
  ),
  damagePotion: createCard(
    [
      {
        type: 'damage',
        value: v(12),
      },
      playAnotherCard(),
    ],
    {
      trash: true,
      uses: 2,
      name: 'Damage Potion',
      description: 'Deal $V damage. Play another card.',
      image: damagePotionImage,
    },
  ),
  strengthPotion: createCard(
    [
      {
        target: 'self',
        type: 'strength',
        value: v(4),
      },
      playAnotherCard(),
    ],
    {
      trash: true,
      uses: 2,
      name: 'Strength Potion',
      description: 'Gain $V strength. Play another card.',
      image: strengthPotionImage,
    },
  ),
  cardPlaysPotion: createCard([playAnotherCard(v(3))], {
    trash: true,
    uses: 2,
    name: 'Adrenaline Potion',
    description: 'Play $V cards.',
    image: adrenalinePotionImage,
  }),
  critPotion: createCard(
    [
      {
        target: 'self',
        type: 'crit',
        value: v(3),
      },
      playAnotherCard(),
    ],
    {
      trash: true,
      uses: 2,
      name: 'Crit Potion',
      description: 'Your next $V attacks will crit. Play another card.',
      image: critPotionImage,
    },
  ),
  dodgePotion: createCard(
    [
      {
        target: 'self',
        type: 'dodge',
        value: v(2),
      },
      playAnotherCard(),
    ],
    {
      trash: true,
      uses: 2,
      name: 'Dodge Potion',
      description: 'Gain $V dodge. Play another card.',
      image: dodgePotionImage,
    },
  ),
};

export const enemyCardsByType = {
  // punchy
  bigPunch: createCard(
    [
      {
        value: v(9),
      },
    ],
    {
      name: 'Big Punch',
      description: `Deal $V damage.`,
      image: bigPunchImage,
    },
  ),
  windUp: createCard([], {
    name: 'Wind Up',
    description: 'Prepare for a big attack.',
    image: windUpImage,
  }),

  // green monster
  surpriseAttack: createCard(
    [
      {
        type: 'crit',
        target: 'self',
        if: ifCompare('self', 'dodge', '>=', 1),
      },
      {
        value: v(4),
      },
      {
        type: 'set',
        target: 'self',
        valueType: 'dodge',
        value: v(0),
      },
    ],
    {
      name: 'Surprise Attack',
      description: `Deal $2V damage. Crit if you have dodge. Lose all dodge.`,
      image: greenMonsterAttackImage,
    },
  ),
  hide: createCard(
    [
      {
        target: 'self',
        type: 'dodge',
        value: v(1),
      },
    ],
    {
      name: 'Hide',
      description: 'Gain $V dodge.',
      image: hideImage,
    },
  ),

  // armored lizard
  swipe: createCard(
    [
      {
        value: v(3),
        multiHit: v(2),
      },
    ],
    {
      name: 'Swipe',
      description: 'Deal $V damage $N times.',
      image: swipeImage,
    },
  ),

  // cool bird
  peck: createCard(
    [
      {
        value: v(1),
      },
      {
        type: 'bleed',
        value: v(2),
      },
    ],
    {
      name: 'Vicious Peck',
      description: 'Deal $V damage. Apply $2V bleed.',
      image: peckImage,
    },
  ),
  rake: createCard(
    [
      {
        value: v(1),
        multiHit: v(3),
      },
    ],
    {
      name: 'Rake',
      description: 'Deal $V damage $N times.',
      image: scratchImage,
    },
  ),
  focus: createCard([playAnotherCard(v(2))], {
    trash: true,
    name: 'Focus',
    description: 'Play $V cards.',
    image: focusedImage,
  }),
};

// cards that show up in user card selection
export const userCardsByType = {
  ...greenCardsByType,
  ...redCardsByType,
  ...purpleCardsByType,
};
export const userCards = Object.values(userCardsByType);

export const cardsByType = {
  ...basicCardsByType,
  ...userCardsByType,
  ...potionByType,
  ...enemyCardsByType,
};
export const allCards = Object.values(cardsByType);
export type CardType = keyof typeof cardsByType;
