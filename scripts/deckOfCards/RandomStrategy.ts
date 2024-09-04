import { PlayerStrategy, STARTING_CARDS_KEPT, Card } from './engine';

export class RandomStrategy implements PlayerStrategy {
  async pickStartingCards(cards: Card[]) {
    return cards.slice(0, STARTING_CARDS_KEPT);
  }
}
