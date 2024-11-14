import { createRelic } from '../utils/createRelic';

import lifestealImage from '../../ui/components/StatusEffects/images/heart-plus.png';
import pyromaniacImage from './images/pyromaniac.png';
import openWoundImage from './images/bleeding-wound.png';
import sproutImage from './images/ground-sprout.png';
import planksImage from './images/packed-planks.png';
import necklaceImage from './images/primitive-necklace.png';
import fireSilhouetteImage from './images/fire-silhouette.png';
import transfuseImage from './images/transfuse.png';

// basic
export const lifesteal = createRelic({
  displayName: 'Lifesteal',
  description: 'Gain $V% lifesteal.',
  value: 0.25,
  image: lifestealImage,
});

export const basicRelics = {
  lifesteal,
};
Object.values(basicRelics).forEach((relic) => {
  relic.tribe = 'basic';
});

// green
export const reduceLowDamage = createRelic({
  displayName: 'Thick Bark',
  description: 'Whenever you would receive $V or less damage, reduce it to $V2.',
  value: 4,
  value2: 1,
  image: planksImage,
});

export const regenForHighDamage = createRelic({
  displayName: 'Sprouter',
  description: 'Gain $V2 regen whenever you deal $V or more damage in a single hit.',
  value: 10,
  value2: 3,
  image: sproutImage,
});

export const strengthAffectsHealing = createRelic({
  displayName: 'Shamanic Wisdom',
  description: 'Healing benefits from strength. Gain $V strength.',
  value: 1,
  image: necklaceImage,
});

export const greenRelics = {
  reduceLowDamage,
  regenForHighDamage,
  strengthAffectsHealing,
};
Object.values(greenRelics).forEach((relic) => {
  relic.tribe = 'green';
});

// red
export const permaBleed = createRelic({
  displayName: 'Eternal Wound',
  description: 'Add $V bleed to the opponent at the start of your turn.',
  value: 1,
  image: openWoundImage,
});
export const strengthOnSelfDamage = createRelic({
  displayName: 'Madness',
  description: 'Gain $V strength whenever you take damage on your turn.',
  value: 1,
  image: pyromaniacImage,
});
export const sharedPain = createRelic({
  displayName: 'Pain Link',
  description: 'Damage taken on your turn is also dealt to the enemy.',
  value: 1,
  image: transfuseImage,
});

export const redRelics = {
  permaBleed,
  strengthOnSelfDamage,
  sharedPain,
};
Object.values(redRelics).forEach((relic) => {
  relic.tribe = 'red';
});

// purple
export const extraCardPlaysAtStart = createRelic({
  displayName: 'Adrenaline Rush',
  description: 'Play $V extra cards at the start of each battle.',
  value: 2,
  image: fireSilhouetteImage,
});

export const purpleRelics = {
  extraCardPlaysAtStart,
};
Object.values(purpleRelics).forEach((relic) => {
  relic.tribe = 'purple';
});

export const allRelics = {
  ...basicRelics,
  ...greenRelics,
  ...redRelics,
  ...purpleRelics,
};
Object.entries(allRelics).forEach(([name, relic]) => {
  relic.name = name;
});

export type RelicName = keyof typeof allRelics;
