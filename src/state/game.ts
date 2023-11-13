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
  user: Player;
  opponent: Player;
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
  const opponent = createInitialPlayer();
  opponent.cards = deck1.slice();

  const user = createInitialPlayer();
  user.cards = deck2.slice();

  return {
    user,
    opponent,
  }
}
