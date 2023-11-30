export interface Card {
  text: string;
}

export interface Player {
  cards: Card[];
  activeCardIndex: number;
  health: number;
  maxHealth: number;
}

export type Screen = 'game-start' | 'card-selection' | 'battle' | 'round-end' | 'game-end';

export interface Game {
  user: Player;
  opponent: Player;
  turn: number;
  wins: number;
  losses: number;
  screen: Screen;
}

export const MAX_WINS = 3;
export const MAX_LOSSES = 2;

function createInitialPlayer(): Player {
  const maxHealth = 6;

  return {
    cards: [],
    activeCardIndex: 0,
    health: maxHealth,
    maxHealth,
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

export function getRound(game: Game) {
  return game.wins + game.losses;
}

export function createInitialGame(): Game {
  const user = createInitialPlayer();
  user.cards = userCards.slice();

  const opponent = createInitialPlayer();
  opponent.cards = getOpponentCardsForRound(0);

  return {
    user,
    opponent,
    turn: 0,
    wins: 0,
    losses: 0,
    screen: 'game-start',
  };
}

const cardSelectionsByRound: Card[][] = [];
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

export function getIsOpponentTurn(game: Game) {
  return game.turn % 2 === 1;
}

export function getActivePlayer(game: Game) {
  return getIsOpponentTurn(game) ? game.opponent : game.user;
}

export function getNonActivePlayer(game: Game) {
  return getIsOpponentTurn(game) ? game.user : game.opponent;
}

export function getActiveCard(playerOrGame: Player | Game) {
  let player = playerOrGame as Player;
  if (player.activeCardIndex === undefined) {
    player = getActivePlayer(playerOrGame as Game);
  }

  return player.cards[player.activeCardIndex];
}
