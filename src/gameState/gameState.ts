export type ScreenName = 'game-start' | 'card-selection' | 'battle' | 'round-end' | 'game-end';

export interface Effect {
  actions?: number;
  health?: number;
  discard?: number;
}

export interface Event {
  activePlayerEffect?: Effect;
  nonActivePlayerEffect?: Effect;
}

export interface CardState {
  text: string;
}

export interface PlayerState {
  cards: CardState[];
  nextCardIndex: number;
  health: number;
  maxHealth: number;
  actions: number;
}

export interface GameState {
  user: PlayerState;
  opponent: PlayerState;
  turn: number;
  wins: number;
  losses: number;
  screen: ScreenName;
  events: Event[];
}

export const MAX_WINS = 3;
export const MAX_LOSSES = 2;

function createInitialPlayerState(): PlayerState {
  const maxHealth = 6;

  return {
    cards: [],
    nextCardIndex: 0,
    health: maxHealth,
    maxHealth,
    actions: 0,
  };
}

// const userCards = [{ dmg: 1, playAnotherCard: 1 }, { text: 'dmg 2' }];
const userCards = [{ text: 'dmg 1' }, { text: 'dmg 2' }];

const opponentCardsByRound = [
  [
    { text: 'dmg 1' },
    { text: 'dmg 1' },
    { text: 'dmg 1' },
    { text: 'dmg 2' },
    { text: 'dmg 2' },
    { text: 'dmg 2' },
  ], // 5 hits
  [{ text: 'dmg 0' }, { text: 'dmg 0' }, { text: 'dmg 0' }, { text: 'dmg 3' }, { text: 'dmg 3' }], // 4 hits
  [{ text: 'dmg 2' }, { text: 'dmg 2' }, { text: 'dmg 3' }, { text: 'dmg 3' }], // 3 hits
  [{ text: 'dmg 3' }, { text: 'dmg 6' }, { text: 'dmg 9' }], // 2 hits
];

export function getOpponentCardsForRound(round: number) {
  return opponentCardsByRound[round].slice();
}

export function getRound(game: GameState) {
  return game.wins + game.losses;
}

export function createInitialGameState(): GameState {
  const user = createInitialPlayerState();
  user.cards = userCards.slice();

  const opponent = createInitialPlayerState();
  opponent.cards = getOpponentCardsForRound(0);

  return {
    user,
    opponent,
    turn: 0,
    wins: 0,
    losses: 0,
    screen: 'game-start',
    events: [],
  };
}

const cardSelectionsByRound: CardState[][] = [];
for (let i = 0; i < MAX_WINS + MAX_LOSSES - 1; i++) {
  cardSelectionsByRound[i] = [];
  for (let j = 0; j < 6; j++) {
    const dmg = Math.round(6 * Math.random() * Math.random());
    cardSelectionsByRound[i].push({ text: `dmg ${dmg}` });
  }
}

export function getCardSelectionsForRound(round: number) {
  return cardSelectionsByRound[round];
}

export function getIsOpponentTurn(game: GameState) {
  return game.turn % 2 === 1;
}

export function getActivePlayer(game: GameState) {
  return getIsOpponentTurn(game) ? game.opponent : game.user;
}

export function getNonActivePlayer(game: GameState) {
  return getIsOpponentTurn(game) ? game.user : game.opponent;
}

export function getNextCard(playerOrGame: PlayerState | GameState) {
  let player = playerOrGame as PlayerState;
  if (player.nextCardIndex === undefined) {
    player = getActivePlayer(playerOrGame as GameState);
  }

  return player.cards[player.nextCardIndex];
}

export function getNextEvent(game: GameState) {
  return game.events[0];
}

export function canPlayCard(game: GameState) {
  const activePlayer = getActivePlayer(game);
  return activePlayer.actions > 0;
}

export function isRoundOver(game: GameState) {
  const { user, opponent } = game;
  return user.health <= 0 || opponent.health <= 0;
}
