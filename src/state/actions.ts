import {
  Game,
  MAX_WINS,
  MAX_LOSSES,
  getActiveCard,
  getActivePlayer,
  getNonActivePlayer,
} from './game';

export const actionKeyDown = () => (game: Game) => {
  game.input.actionKeyDown = true;
};

export const actionKeyUp = () => (game: Game) => {
  game.input.actionKeyDown = false;
};

export const playCard = () => (game: Game) => {
  const activePlayer = getActivePlayer(game);
  const nonActivePlayer = getNonActivePlayer(game);
  const card = getActiveCard(activePlayer);

  const dmg = parseInt(card.text.split(' ')[1], 10);
  nonActivePlayer.health -= dmg;
};

export const nextTurn = () => (game: Game) => {
  const activePlayer = getActivePlayer(game);
  activePlayer.activeCardIndex = (activePlayer.activeCardIndex + 1) % activePlayer.cards.length;

  game.turn++;
};

export const endRound = () => (game: Game) => {
  if (game.user.health <= 0) {
    game.losses++;
  } else if (game.opponent.health <= 0) {
    game.wins++;
  } else {
    throw new Error('endRound called, but neither player is dead');
  }

  game.screen = game.wins >= MAX_WINS || game.losses >= MAX_LOSSES ? 'game-end' : 'round-end';

  game.input.actionKeyDown = false;
};

export const startRound = () => (game: Game) => {
  game.user.health = game.user.maxHealth;
  game.user.activeCardIndex = 0;

  game.opponent.health = game.opponent.maxHealth;
  game.opponent.activeCardIndex = 0;

  game.turn = 0;
  game.screen = 'battle';

  game.input.actionKeyDown = false;
};

export const startGame = () => (game: Game) => {
  startRound()(game);

  game.losses = 0;
  game.wins = 0;
  game.input.actionKeyDown = false;
};
