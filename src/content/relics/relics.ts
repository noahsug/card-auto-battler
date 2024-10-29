import { RelicState } from '../../game/gameState';
import { createRelic } from '../utils/createRelic';

import openWoundImage from './images/dripping-knife.png';
import thickBark from './images/packed-planks.png';

export const greenRelics: Record<string, RelicState> = {
  thickBark: createRelic(
    { statusEffectName: 'thickBark', target: 'self' },
    {
      name: 'Thick Bark',
      description: 'Whenever you would receive 4 or less damage, reduce it to 1.',
      image: thickBark,
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
