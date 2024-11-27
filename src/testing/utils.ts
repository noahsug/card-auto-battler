import { sampleSize } from 'lodash';
import { cardsByName } from '../content/cards';
import { allRelics } from '../content/relics';

export function getRandomCards(length: number) {
  const cards = structuredClone(sampleSize(cardsByName, length));
  for (let i = 0; i < length; i++) {
    cards[i].acquiredId = i;
  }
  return cards;
}
export function getRandomRelics(length: number) {
  return structuredClone(sampleSize(allRelics, length));
}
