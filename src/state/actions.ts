import { Game } from './game';

export const nextTurn = () => (game: Game) => {
  game.turn++;
}
