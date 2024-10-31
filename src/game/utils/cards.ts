import sample from 'lodash/sample';
import cloneDeep from 'lodash/cloneDeep';

import { allCards } from '../../content/cards';
import { CardState, PlayerState } from '../gameState';

export function getRandomCards(length: number) {
  const cards = new Array(length);
  const options = Object.values(allCards);

  for (let i = 0; i < length; i++) {
    cards[i] = cloneDeep(sample(options));
    cards[i].acquiredId = i;
  }
  return cards;
}

export function addCardsToPlayer(player: PlayerState, cards: CardState[]) {
  const clonedCards = cards.map((card, i) => ({ ...card, acquiredId: player.cards.length + i }));
  player.cards.push(...clonedCards);
}
