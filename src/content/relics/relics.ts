import { RelicState } from '../../game/gameState';
import { createRelic } from '../utils/createRelic';

import openWoundImage from './images/dripping-knife.png';

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
  ...redRelics,
};
