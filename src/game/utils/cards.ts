import sampleSize from 'lodash/sampleSize';
import cloneDeep from 'lodash/cloneDeep';

import { cardsByName } from '../../content/cards';
import { CardState, PlayerState } from '../gameState';

export function getRandomCards(length: number) {
  const cards = cloneDeep(sampleSize(cardsByName, length));
  for (let i = 0; i < length; i++) {
    cards[i].acquiredId = i;
  }
  return cards;
}

export function addCardsToPlayer(player: PlayerState, cards: CardState[]) {
  const clonedCards = cards.map((card, i) => ({ ...card, acquiredId: player.cards.length + i }));
  player.cards.push(...clonedCards);
}
