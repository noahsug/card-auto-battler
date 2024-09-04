import { getReadableCards, sortCards } from './common';
import { PlayerStrategy, STARTING_CARDS_KEPT, Card } from './engine';
import { input } from '@inquirer/prompts';
import { swapKeysAndValues } from './utils';

const INPUT_TO_SUIT: Record<string, Card['suit']> = {
  H: 'heart',
  D: 'diamond',
  C: 'club',
  S: 'spade',
};

const SUIT_TO_INPUT = swapKeysAndValues(INPUT_TO_SUIT);

function selectCardsFromInput(cardsInput: string, cards: Card[]) {
  return cardsInput
    .toUpperCase()
    .split(' ')
    .map((cardString) => {
      const value = cardString.slice(0, -1);
      const suitInput = cardString.slice(-1);
      const suit = INPUT_TO_SUIT[suitInput];
      const match = cards.find((card) => card.value === value && card.suit === suit);
      if (!match) throw new Error(`Invalid card: ${cardString}`);

      return match;
    });
}

function getDefaultCardInput(cards: Card[]) {
  const highToLow = sortCards(cards).reverse();
  return highToLow
    .slice(0, STARTING_CARDS_KEPT)
    .map((card) => `${card.value}${SUIT_TO_INPUT[card.suit]}`)
    .join(' ');
}

function validateCardsInput(cardsInput: string, validCards: Card[]) {
  let cards;
  try {
    cards = selectCardsFromInput(cardsInput, validCards);
  } catch (e) {
    return e.message;
  }

  if (cards.length !== STARTING_CARDS_KEPT) {
    return `Please select ${STARTING_CARDS_KEPT} cards (currently at ${cards.length})`;
  }

  return true;
}

export class UserInputStrategy implements PlayerStrategy {
  async pickStartingCards(cards: Card[]) {
    console.log(getReadableCards(cards));

    const cardsInput = await input({
      message: `Pick ${STARTING_CARDS_KEPT} cards (e.g. '2H 3D 4C'):`,
      validate: (input) => validateCardsInput(input, cards),
      default: getDefaultCardInput(cards),
    });

    return selectCardsFromInput(cardsInput, cards);
  }
}
