import { GameState, PlayerState, Target } from '../gameState';
import { MAX_WINS, MAX_LOSSES } from '../constants';

export function getIsUserTurn(game: GameState) {
  return game.turn % 2 === 0;
}

export function getActivePlayer(game: GameState) {
  return getIsUserTurn(game) ? game.user : game.enemy;
}

export function getNonActivePlayer(game: GameState) {
  return getIsUserTurn(game) ? game.enemy : game.user;
}

export function getPlayers(game: GameState): [PlayerState, PlayerState] {
  return getIsUserTurn(game) ? [game.user, game.enemy] : [game.enemy, game.user];
}

export function getUserTarget(game: GameState): Target {
  return getIsUserTurn(game) ? 'self' : 'opponent';
}

export function getPlayerTargets(game: GameState): [Target, Target] {
  return getIsUserTurn(game) ? ['self', 'opponent'] : ['opponent', 'self'];
}

export function isGameOver({ wins, losses }: { wins: number; losses: number }) {
  return losses >= MAX_LOSSES || wins >= MAX_WINS;
}

export function getBattleWinner(game: GameState) {
  if (game.user.health <= 0) return 'enemy';
  if (game.enemy.health <= 0) return 'user';
  return null;
}
