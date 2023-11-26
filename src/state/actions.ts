import { Game, Screen, getActiveCard, getActivePlayer, getNonActivePlayer } from './game';

export const actionKeyDown = () => (game: Game) => {
  game.input.actionKeyDown = true;
};

export const actionKeyUp = () => (game: Game) => {
  game.input.actionKeyDown = false;
};

export const actionKeyUsed = () => (game: Game) => {
  game.input.actionKeyDown = false;
};

export const playCard = () => (game: Game) => {
  const activePlayer = getActivePlayer(game);
  const nonActivePlayer = getNonActivePlayer(game);
  const card = getActiveCard(activePlayer);

  const dmg = parseInt(card.text.split(' ')[1], 10);
  nonActivePlayer.health -= dmg;

  activePlayer.activeCard = (activePlayer.activeCard + 1) % activePlayer.cards.length;

  game.turn++;
};

export const goToScreen = (screen: Screen) => (game: Game) => {
  game.screen = screen;
};

export const resetGame = () => (game: Game) => {
  game.user.health = game.user.maxHealth;
  game.user.activeCard = 0;

  game.opponent.health = game.opponent.maxHealth;
  game.opponent.activeCard = 0;

  game.turn = 0;
  game.screen = 'battle';
};
