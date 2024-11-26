import { assertIsNonNullable } from '../../utils/asserts';
import { CardState } from '../gameState';

// checks whether the new chain creates a loop
export function getChainCreatesLoop(cards: CardState[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) return true;

  const [fromCard, toCard] = [cards[fromIndex], cards[toIndex]];

  let currentCard = toCard;
  while (currentCard.chain.toId != null) {
    const nextCard = cards.find((card) => card.acquiredId === currentCard.chain.toId);
    assertIsNonNullable(nextCard, `invalid chain: ${currentCard.chain.toId}`);

    // loop detected
    if (nextCard === fromCard) return true;

    currentCard = nextCard;
  }

  return false;
}

export function breakChain(card: CardState, key: 'fromId' | 'toId', cards: CardState[]) {
  if (card.chain[key] == null) return;

  const chainedCard = cards.find((otherCard) => card.chain[key] === otherCard.acquiredId);
  assertIsNonNullable(chainedCard, `invalid chain ${key}: ${card.chain[key]}`);

  const oppositeKey = key === 'fromId' ? 'toId' : 'fromId';
  chainedCard.chain[oppositeKey] = undefined;
  card.chain[key] = undefined;
}

// order cards so that ordering effects like chain are followed
export function applyCardOrderingEffects(cards: CardState[]) {
  const chainStarts = cards.filter((card) => card.chain.fromId == null && card.chain.toId != null);
  chainStarts.forEach((chainStart) => {
    let currentCard = chainStart;
    while (currentCard.chain.toId != null) {
      const nextCardIndex = cards.findIndex((card) => card.acquiredId === currentCard.chain.toId);
      // card is trashed
      if (nextCardIndex === -1) return;

      // move the next card to the right of the current card
      const [nextCard] = cards.splice(nextCardIndex, 1);
      cards.splice(cards.indexOf(currentCard) + 1, 0, nextCard);
      currentCard = nextCard;
    }
  });
}
