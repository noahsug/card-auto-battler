import groupBy from 'lodash/groupBy';

import { cardsByType } from '../../content/cards';
import { value as v } from '../../content/utils/createCard';
import { assertIsNonNullable, assertType } from '../../utils/asserts';
import { CardState, PlayerState } from '../gameState';

const { attack } = cardsByType;

export function addCardsToPlayer(player: PlayerState, cards: CardState[]) {
  const maxAcquiredId = player.cards.reduce((max, card) => Math.max(max, card.acquiredId), -1);
  cards.forEach((card, i) => {
    card.acquiredId = maxAcquiredId + 1 + i;
  });
  player.cards.push(...cards);
}

export function convertBasicAttacksToMonkAttack(cards: CardState[]) {
  cards.forEach((card) => {
    if (card.name !== attack.name) return;
    card.effects.push({
      target: 'self',
      type: 'extraCardPlays',
      value: v(1),
    });
    card.description += ' Play another card.';
    card.name = `${attack.name} (Monk)`;
  });
}

export function addDamage(card: CardState, damage: number) {
  const effect = card.effects.find((effect) => effect.type === 'damage');
  const value = effect?.value;
  assertType(value, 'basicValue', card.name);
  value.value += damage;
}

export function getCardByIdOrError(cards: CardState[], acquiredId: number): CardState {
  const card = cards.find((card) => card.acquiredId === acquiredId);
  assertIsNonNullable(card, `card not found: ${acquiredId}`);
  return card;
}

export function getMatchingCards(cards: CardState[], cardIdsToMatch: CardState[]) {
  return cardIdsToMatch.map(({ acquiredId }) => getCardByIdOrError(cards, acquiredId));
} // checks whether the new chain creates a loop

export function getChainCreatesLoop(cards: CardState[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) return true;

  const [fromCard, toCard] = [cards[fromIndex], cards[toIndex]];

  let currentCard = toCard;
  while (currentCard.chain.toId != null) {
    const nextCard = getCardByIdOrError(cards, currentCard.chain.toId);
    // loop detected
    if (nextCard === fromCard) return true;
    currentCard = nextCard;
  }

  return false;
}

export function breakChain(card: CardState, key: 'fromId' | 'toId', cards: CardState[]) {
  if (card.chain[key] == null) return;

  const chainedCard = getCardByIdOrError(cards, card.chain[key]);
  const oppositeKey = key === 'fromId' ? 'toId' : 'fromId';
  chainedCard.chain[oppositeKey] = undefined;
  card.chain[key] = undefined;
}

export function addFeatherCharm(card: CardState) {
  card.charm = 'feather';
  card.trash = true;
}

// order cards so that ordering effects like chain and feather are followed
export function applyCardOrderingEffects(cards: CardState[]) {
  // put feathered cards first
  const { feather = [], none = [] } = groupBy(cards, (card) => card.charm || 'none');
  const sortedCards = [...feather, ...none];

  // move cards so their chains are followed
  const chainStarts = sortedCards.filter(
    (card) => card.chain.fromId == null && card.chain.toId != null,
  );
  chainStarts.forEach((chainStart) => {
    let currentCard = chainStart;
    while (currentCard.chain.toId != null) {
      const nextCardIndex = sortedCards.findIndex(
        (card) => card.acquiredId === currentCard.chain.toId,
      );
      // card is trashed
      if (nextCardIndex === -1) return;

      // move the next card to the right of the current card
      const [nextCard] = sortedCards.splice(nextCardIndex, 1);
      sortedCards.splice(sortedCards.indexOf(currentCard) + 1, 0, nextCard);
      currentCard = nextCard;
    }
  });

  return sortedCards;
}
