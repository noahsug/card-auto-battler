import { CardState, PlayerState } from '../gameState';

export function addCardsToPlayer(player: PlayerState, cards: CardState[]) {
  const maxAcquiredId = player.cards.reduce((max, card) => Math.max(max, card.acquiredId), 0);
  const clonedCards = cards.map((card, i) => ({ ...card, acquiredId: maxAcquiredId + 1 + i }));
  player.cards.push(...clonedCards);
}
