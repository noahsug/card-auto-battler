import { MAX_WINS, GameState } from '../../src/gameState';
import { startBattle, endBattle } from '../../src/gameState/actions';

export function runFakeBattle(game: GameState) {
  startBattle(game);

  // user wins unless they're one win away from ending the game
  const isUserWin = game.wins < MAX_WINS - 1;
  if (isUserWin) {
    game.enemy.health = 0;
  } else {
    game.user.health = 0;
  }

  endBattle(game);
}
