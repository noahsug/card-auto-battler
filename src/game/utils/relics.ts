import sampleSize from 'lodash/sampleSize';
import cloneDeep from 'lodash/cloneDeep';

import { relicsByName } from '../../content/relics';
import { RelicState } from '../gameState';

const relics = Object.values(relicsByName);

export function getRandomRelics(length: number, existingRelics: RelicState[] = []) {
  const existingRelicNames = new Set(existingRelics.map((relic) => relic.name));
  const availableRelics = relics.filter((relic) => !existingRelicNames.has(relic.name));
  return cloneDeep(sampleSize(availableRelics, length));
}
