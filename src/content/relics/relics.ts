import openWoundImage from './images/bleeding-wound.png';
import cowledImage from './images/cowled.png';
import fireSilhouetteImage from './images/fire-silhouette.png';
import sproutImage from './images/ground-sprout.png';
import planksImage from './images/packed-planks.png';
import necklaceImage from './images/primitive-necklace.png';
import fistImage from './images/punch.png';
import pyromaniacImage from './images/pyromaniac.png';
import targetingImage from './images/targeting.png';
import thunderBladeImage from './images/thunder-blade.png';
import transfuseImage from './images/transfuse.png';

import lifestealImage from '../../ui/components/StatusEffects/images/heart-plus.png';
import thickSkinImage from '../../ui/components/StatusEffects/images/layered-armor.png';

import { cardsByType } from '../cards/cards';
import { createRelic } from '../utils/createRelic';

const { attack } = cardsByType;

// basic
export const basicRelics = {
  lifesteal: createRelic({
    name: 'Lifesteal',
    description: 'Gain $V% lifesteal.',
    value: 0.25,
    image: lifestealImage,
  }),
  monk: createRelic({
    name: 'Way of the Monk',
    description: `Basic "${attack.name}" cards gain "play another card".`,
    image: fistImage,
  }),
};
Object.values(basicRelics).forEach((relic) => {
  relic.tribe = 'basic';
});

// green
export const greenRelics = {
  extraThickSkin: createRelic({
    name: 'Extra Thick Skin',
    description: 'Start each battle with $V thick skin.',
    value: 6,
    image: thickSkinImage,
  }),
  regenForHighDamage: createRelic({
    name: 'Sprouter',
    description: 'Gain $V2 regen whenever you deal $V or more damage in a single hit.',
    value: 10,
    value2: 3,
    image: sproutImage,
  }),
  strengthAffectsHealing: createRelic({
    name: 'Shamanic Wisdom',
    description: 'Healing benefits from strength. Gain $V strength.',
    value: 1,
    image: necklaceImage,
  }),
};
Object.values(greenRelics).forEach((relic) => {
  relic.tribe = 'green';
});

// red
export const redRelics = {
  permaBleed: createRelic({
    name: 'Eternal Wound',
    description: 'The enemy gains $V bleed at the start of their turn.',
    value: 1,
    image: openWoundImage,
  }),
  strengthOnSelfDamage: createRelic({
    name: 'Madness',
    description: 'Gain $V strength whenever you take damage on your turn.',
    value: 1,
    image: pyromaniacImage,
  }),
  sharedPain: createRelic({
    name: 'Pain Link',
    description: 'Damage taken on your turn is also dealt to the enemy.',
    value: 1,
    image: transfuseImage,
  }),
};
Object.values(redRelics).forEach((relic) => {
  relic.tribe = 'red';
});

// purple
export const purpleRelics = {
  extraCardPlaysAtStart: createRelic({
    name: 'Adrenaline Rush',
    description: 'Play $V extra cards at the start of battle.',
    value: 2,
    image: fireSilhouetteImage,
  }),

  shockOnCrit: createRelic({
    name: 'Thundering Strikes',
    description: 'Whenever you crit, add $V shock to the enemy.',
    value: 1,
    image: thunderBladeImage,
  }),

  critChance: createRelic({
    name: 'Weak Points',
    description: 'Gain $V% crit chance.',
    value: 0.25,
    image: targetingImage,
  }),

  strengthWithDodge: createRelic({
    name: 'Sneak Attack',
    description: 'Gain $V strength while you have dodge.',
    value: 4,
    image: cowledImage,
  }),
};
Object.values(purpleRelics).forEach((relic) => {
  relic.tribe = 'purple';
});

export const relicsByType = {
  ...basicRelics,
  ...greenRelics,
  ...redRelics,
  ...purpleRelics,
};
Object.entries(relicsByType).forEach(([type, relic]) => {
  relic.type = type;
});

export type RelicType = keyof typeof relicsByType;

export const allRelics = Object.values(relicsByType);
