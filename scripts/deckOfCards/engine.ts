import shuffle from 'lodash/shuffle';
import { CARD_VALUE_TO_NUMERIC_VALUE } from './common';

const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['heart', 'diamond', 'club', 'spade'];
const STARTING_CARDS_DEALT = 12;
export const STARTING_CARDS_KEPT = 6;

export type Value = (typeof VALUES)[number];
export type Suit = (typeof SUITS)[number];

export interface Card {
  value: Value;
  suit: Suit;
}

export interface Player {
  deck: Card[];
  discard: Card[];
  relics: Card[];
  wins: number;
}

export interface Board {
  players: Player[];
}

export interface PlayerStrategy {
  // pick STARTING_CARDS_PER_PLAYER cards from the given cards
  pickStartingCards: (cards: Card[]) => Promise<Card[]>;
}

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push(createCard(value, suit));
    }
  }

  return deck;
}

function createCard(value: Card['value'], suit: Card['suit']): Card {
  return { value, suit };
}

function createPlayer(): Player {
  return {
    deck: [],
    discard: [],
    relics: [],
    wins: 0,
  };
}

export function validateNumPlayers(numPlayers: number) {
  return numPlayers < 2 || numPlayers > 4 ? `Invalid number of players: ${numPlayers}` : true;
}

export function createBoard(numPlayers = 2): Board {
  const successOrErrorMessage = validateNumPlayers(numPlayers);
  if (successOrErrorMessage !== true) throw new Error(successOrErrorMessage);

  const players = Array.from({ length: numPlayers }, () => createPlayer());
  return { players };
}

export function dealStartingCards(numPlayers: number) {
  const deck = shuffle(createDeck());

  return Array.from({ length: numPlayers }, (_, i) => {
    return deck.slice(i * STARTING_CARDS_DEALT, (i + 1) * STARTING_CARDS_DEALT);
  });
}

export function setStartingCards({ players }: Board, cardsByPlayer: Card[][]) {
  for (const [i, player] of players.entries()) {
    const cards = cardsByPlayer[i];

    if (cards.length !== STARTING_CARDS_KEPT) {
      throw new Error(
        `Player ${i} picked incorrect number of cards: ${cards.length}, but expected ${STARTING_CARDS_KEPT}`,
      );
    }

    player.deck = shuffle(cards);
  }
}

function canPlayNextCard(prevCard: Card, nextCard: Card) {
  const prevValue = CARD_VALUE_TO_NUMERIC_VALUE[prevCard.value];
  const nextValue = CARD_VALUE_TO_NUMERIC_VALUE[nextCard.value];
  const valueDiff = Math.abs(prevValue - nextValue);

  // same value or off by 1
  if (valueDiff <= 1) return true;

  // Ace wraps around to 2
  if (valueDiff === 12) return true;

  // same suit
  if (prevCard.suit === nextCard.suit) return true;

  return false;
}

export function playCards(player: Player) {
  const totalNumCards = player.deck.length + player.discard.length;
  const cardsPlayed: Card[] = [];

  for (let i = 0; i < totalNumCards; i++) {
    if (player.deck.length === 0) {
      player.deck = shuffle(player.discard);
      player.discard = [];
    }

    if (cardsPlayed.length === 0) {
      cardsPlayed.push(player.deck.pop()!);
      continue;
    }

    const prevCard = cardsPlayed[cardsPlayed.length - 1];
    const nextCard = player.deck[player.deck.length - 1];
    if (canPlayNextCard(prevCard, nextCard)) {
      cardsPlayed.push(player.deck.pop()!);
    }
  }

  player.discard.push(...cardsPlayed);

  return cardsPlayed;
}

function scoreCards(cards) {
  const maxValue = cards.reduce((max, card) => {
    const value = CARD_VALUE_TO_NUMERIC_VALUE[card.value];
    return value > max ? value : max;
  });

  return cards.length * 100 + maxValue;
}

export function getRoundWinner(cardsPlayedByPlayer: Card[][]) {
  // find highest score
  return 0;
}
