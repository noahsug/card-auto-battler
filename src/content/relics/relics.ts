import { RelicState } from '../../game/gameState';
import { createRelic } from '../utils/createRelic';

import openWoundImage from './images/dripping-knife.png';

function getColor(hue: number) {
  return `hsl(${hue}, 33%, 75%)`;
}

export const allRelics: Record<string, RelicState> = {
  openWound: createRelic(
    { name: 'bleed', target: 'opponent' },
    {
      name: 'Open Wound',
      description: 'Adds one bleed to the opponent that never goes away.',
      image: openWoundImage,
      color: getColor(330),
    },
  ),
};
