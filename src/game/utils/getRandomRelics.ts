import { sample } from 'lodash';

import { allRelics } from '../../content/relics/relics';

export function getRandomRelics(length: number) {
  const relics = new Array(length);
  const options = Object.values(allRelics);

  for (let i = 0; i < length; i++) {
    relics[i] = sample(options);
  }
  return relics;
}
