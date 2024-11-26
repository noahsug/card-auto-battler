import lifestealImage from '../../ui/components/StatusEffects/images/heart-plus.png';
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

import { cardsByName } from '../cards/cards';
import { createRelic } from '../utils/createRelic';

const { attack } = cardsByName;

// basic
export const basicRelics = {
  lifesteal: createRelic({
    displayName: 'Lifesteal',
    description: 'Gain $V% lifesteal.',
    value: 0.25,
    image: lifestealImage,
  }),
  monk: createRelic({
    displayName: 'Way of the Monk',
    description: `Basic "${attack.name}" cards gain "play another card".`,
    image: fistImage,
  }),
};
Object.values(basicRelics).forEach((relic) => {
  relic.tribe = 'basic';
});

// green
export const greenRelics = {
  reduceLowDamage: createRelic({
    displayName: 'Thick Bark',
    description: 'Whenever you would receive $V or less damage, reduce it to $V2.',
    value: 4,
    value2: 1,
    image: planksImage,
  }),
  regenForHighDamage: createRelic({
    displayName: 'Sprouter',
    description: 'Gain $V2 regen whenever you deal $V or more damage in a single hit.',
    value: 10,
    value2: 3,
    image: sproutImage,
  }),
  strengthAffectsHealing: createRelic({
    displayName: 'Shamanic Wisdom',
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
    displayName: 'Eternal Wound',
    description: 'Apply $V bleed to the enemy at the start of your turn if they have no bleed.',
    value: 1,
    image: openWoundImage,
  }),
  strengthOnSelfDamage: createRelic({
    displayName: 'Madness',
    description: 'Gain $V strength whenever you take damage on your turn.',
    value: 1,
    image: pyromaniacImage,
  }),
  sharedPain: createRelic({
    displayName: 'Pain Link',
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
    displayName: 'Adrenaline Rush',
    description: 'Play $V extra cards at the start of each battle.',
    value: 2,
    image: fireSilhouetteImage,
  }),

  shockOnCrit: createRelic({
    displayName: 'Thundering Strikes',
    description: 'Whenever you crit, add $V shock to the enemy.',
    value: 1,
    image: thunderBladeImage,
  }),

  critChance: createRelic({
    displayName: 'Weak Points',
    description: 'Gain $V% crit chance.',
    value: 0.25,
    image: targetingImage,
  }),

  strengthWithDodge: createRelic({
    displayName: 'Sneak Attack',
    description: 'Gain $V strength while you have dodge.',
    value: 4,
    image: cowledImage,
  }),
};
Object.values(purpleRelics).forEach((relic) => {
  relic.tribe = 'purple';
});

export const relicsByName = {
  ...basicRelics,
  ...greenRelics,
  ...redRelics,
  ...purpleRelics,
};
Object.entries(relicsByName).forEach(([name, relic]) => {
  relic.name = name;
});

export type RelicName = keyof typeof relicsByName;

export const allRelics = Object.values(relicsByName);
