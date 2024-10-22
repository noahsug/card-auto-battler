import { sample } from 'lodash';

import { allCards } from '../../content/cards';

export function getRandomCards(length: number) {
  const cards = new Array(length);
  const options = Object.values(allCards);

  for (let i = 0; i < length; i++) {
    cards[i] = sample(options);
  }
  return cards;
}
