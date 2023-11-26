import { Game, getActiveCard, getActivePlayer, getNonActivePlayer } from './game';

export const nextTurn = () => (game: Game) => {
  game.turn++;
}

export const playCard = () => (game: Game) => {
const activePlayer = getActivePlayer(game);
  const nonActivePlayer = getNonActivePlayer(game);
  const card = getActiveCard(activePlayer);

  const dmg = parseInt(card.text.split(' ')[1], 10);
  nonActivePlayer.health -= dmg;

  activePlayer.activeCard = (activePlayer.activeCard + 1) % activePlayer.cards.length;

  game.turn++;
}
