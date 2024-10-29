import { RelicState } from '../../game/gameState';
import { createRelic } from '../utils/createRelic';

import openWoundImage from './images/dripping-knife.png';
import planksImage from './images/packed-planks.png';
import sproutImage from './images/ground-sprout.png';

export const greenRelics: Record<string, RelicState> = {
  reduceLowDamage: createRelic(
    { statusEffectName: 'reduceLowDamage', target: 'self' },
    {
      name: 'Thick Bark',
      description: 'Whenever you would receive 4 or less damage, reduce it to 1.',
      image: planksImage,
    },
  ),
  regenForHighDamage: createRelic(
    { statusEffectName: 'regenForHighDamage', target: 'self', value: 1 },
    {
      name: 'Sprouter',
      description: 'Gain 3 regen whenever you deal 10 or more damage in a single hit.',
      image: sproutImage,
    },
  ),
};

Object.values(greenRelics).forEach((relic) => {
  relic.tribe = 'green';
});

export const redRelics: Record<string, RelicState> = {
  openWound: createRelic(
    { statusEffectName: 'permaBleed', target: 'opponent' },
    {
      name: 'Open Wound',
      description: 'Add 1 permanent bleed to the opponent.',
      image: openWoundImage,
    },
  ),
};

Object.values(redRelics).forEach((relic) => {
  relic.tribe = 'red';
});

export const allRelics = {
  ...greenRelics,
  ...redRelics,
};
