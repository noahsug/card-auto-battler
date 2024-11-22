import cloneDeep from 'lodash/cloneDeep';
import sampleSize from 'lodash/sampleSize';

import { allRelics } from '../../content/relics';

// TODO: move to testing/relics
export function getRandomRelics(length: number) {
  return cloneDeep(sampleSize(allRelics, length));
}
