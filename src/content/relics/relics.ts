import { RelicState } from '../../game/gameState';
import { createRelic } from '../utils/createRelic';

import openWoundImage from './images/dripping-knife.png';

function getColor(hue: number) {
  return `hsl(${hue}, 33%, 75%)`;
}

export const allRelics: Record<string, RelicState> = {
  openWound: createRelic(
    { statusEffectName: 'permaBleed', target: 'opponent' },
    {
      name: 'Open Wound',
      description: 'Add 1 permanent bleed to the opponent.',
      image: openWoundImage,
      color: getColor(330),
    },
  ),
};
