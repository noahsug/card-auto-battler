import { createRelic } from '../utils/createRelic';

import cutPalmImage from './images/cut-palm.png';
import openWoundImage from './images/dripping-knife.png';
import sproutImage from './images/ground-sprout.png';
import planksImage from './images/packed-planks.png';
import necklaceImage from './images/primitive-necklace.png';

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
  displayName: 'Open Wound',
  description: 'Add $V permanent bleed to the opponent.',
  value: 1,
  image: openWoundImage,
});
export const strengthOnSelfDamage = createRelic({
  displayName: 'Power Through Pain',
  description: 'Gain $V strength whenever you take damage on your turn.',
  value: 1,
  image: cutPalmImage,
});

export const redRelics = {
  permaBleed,
  strengthOnSelfDamage,
};
Object.values(redRelics).forEach((relic) => {
  relic.tribe = 'red';
});

export const allRelics = {
  ...greenRelics,
  ...redRelics,
};
Object.entries(allRelics).forEach(([name, relic]) => {
  relic.name = name;
});

export type RelicName = keyof typeof allRelics;
