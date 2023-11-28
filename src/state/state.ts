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
  screen: Screen;
  wins: number;
  losses: number;
}

export const MAX_WINS = 2;
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

const userCards = [{ text: 'dmg 1' }, { text: 'dmg 2' }, { text: 'dmg 3' }];

const opponentCardsByRound = [
  [{ text: 'dmg 1' }],
  [{ text: 'dmg 2' }],
  [{ text: 'dmg 3' }],
  [{ text: 'dmg 4' }],
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
    screen: 'game-start',
    wins: 0,
    losses: 0,
  };
}

export function getCardSelections() {
  return [
    { text: 'dmg 5' },
    { text: 'dmg 6' },
    { text: 'dmg 7' },
    { text: 'dmg 8' },
    { text: 'dmg 9' },
    { text: 'dmg 10' },
  ];
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
