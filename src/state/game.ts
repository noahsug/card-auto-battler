export const USER_INDEX = 0;
export const OPPONENT_INDEX = 1;
export type PlayerIndex = USER_INDEX | OPPONENT_INDEX;

export interface Card {
  text: string;
}

export interface Player {
  cards: Card[];
  cardIndex: number;
  health: number;
  maxHealth: number;
}

export interface Game {
  players: [Player, Player];
}

function createInitialPlayer(): Player {
  const maxHealth = 30;

  return {
    cards: [],
    cardIndex: 0,
    health: maxHealth,
    maxHealth,
  };
}

const deck1 = [
  { text: 'dmg 5' },
  { text: 'dmg 5' },
  { text: 'dmg 5' },
  { text: 'dmg 3' },
  { text: 'dmg 3' },
  { text: 'dmg 3' },
]

const deck2 = [
  { text: 'dmg 5' },
  { text: 'dmg 5' },
  { text: 'dmg 5' },
  { text: 'dmg 3' },
  { text: 'dmg 3' },
  { text: 'dmg 3' },
]

export function createInitialGame(): Game {
  const player1 = createInitialPlayer();
  const player2 = createInitialPlayer();

  player1.cards = deck1.slice();
  player2.cards = deck2.slice();

  return {
    players: [player1, player2],
  }
}
