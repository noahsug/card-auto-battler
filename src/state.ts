export interface CardState {
  text: string;
}

export interface PlayerState {
  cards: CardState[];
  cardIndex: number;
  health: number;
  maxHealth: number;
}

export function createPlayerState(): PlayerState {
  const maxHealth = 30;

  return {
    cards: [],
    cardIndex: 0,
    health: maxHealth,
    maxHealth,
  };
}

export function getActiveCard(state: PlayerState) {
  return state.cards[state.cardIndex];
}

export interface GameState {
  players: [PlayerState, PlayerState];
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

export function createGameState(): GameState {
  const player1 = createPlayerState();
  const player2 = createPlayerState();

  player1.cards = deck1.slice();
  player2.cards = deck2.slice();

  return {
    players: [player1, player2],
  }
}

export function getP1(state: GameState) {
  return state.players[0];
}
export function getP2(state: GameState) {
  return state.players[1];
}
