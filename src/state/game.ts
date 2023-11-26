export interface Card {
  text: string;
}

export interface Player {
  cards: Card[];
  activeCard: number;
  health: number;
  maxHealth: number;
}

export interface Game {
  user: Player;
  opponent: Player;
  turn: number;
  canPlayCard: false;
}

function createInitialPlayer(): Player {
  const maxHealth = 30;

  return {
    cards: [],
    activeCard: 0,
    health: maxHealth,
    maxHealth,
  };
}

const deck1 = [
  { text: 'dmg 1' },
  { text: 'dmg 2' },
  { text: 'dmg 3' },
  { text: 'dmg 4' },
  { text: 'dmg 5' },
  { text: 'dmg 6' },
];

const deck2 = [
  { text: 'dmg 1' },
  { text: 'dmg 2' },
  { text: 'dmg 3' },
  { text: 'dmg 4' },
  { text: 'dmg 5' },
  { text: 'dmg 6' },
];

export function createInitialGame(): Game {
  const opponent = createInitialPlayer();
  opponent.cards = deck1.slice();

  const user = createInitialPlayer();
  user.cards = deck2.slice();

  return {
    user,
    opponent,
    turn: 0,
    canPlayCard: false,
  };
}

export function isOpponentTurn(game: Game) {
  return game.turn % 2 === 0;
}

export function getActivePlayer(game: Game) {
  return isOpponentTurn(game) ? game.opponent : game.user;
}

export function getNonActivePlayer(game: Game) {
  return isOpponentTurn(game) ? game.user : game.opponent;
}

export function getActiveCard(playerOrGame: Player | Game) {
  const player =
    (playerOrGame as Player).activeCard === undefined
      ? getActivePlayer(playerOrGame as Game)
      : (playerOrGame as Player);

  return player.cards[player.activeCard];
}
