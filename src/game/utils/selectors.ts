import { GameState, PlayerState, Target } from '../gameState';
import { RelicName } from '../../content/relics/relics';
import { MAX_LOSSES, MAX_WINS } from '../constants';
import { Random } from '../../utils/Random';

export function getIsUserTurn({ turn }: { turn: number }) {
  return turn % 2 === 0;
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

export function getTargetedPlayer(game: GameState, target: Target) {
  if (getIsUserTurn(game)) {
    return target === 'self' ? game.user : game.enemy;
  }
  return target === 'self' ? game.enemy : game.user;
}

export function getUserTarget({ turn }: { turn: number }): Target {
  return getIsUserTurn({ turn }) ? 'self' : 'opponent';
}

export function getPlayerTargets({ turn }: { turn: number }): [Target, Target] {
  return getIsUserTurn({ turn }) ? ['self', 'opponent'] : ['opponent', 'self'];
}

export function getRelic(player: PlayerState, relicName: RelicName) {
  return player.relics.find((relic) => relic.name === relicName);
}

export function getIsBossBattle({ wins }: { wins: number }) {
  return wins >= MAX_WINS - 1;
}

// what pick action to take after adding new cards
export function getNextPickAction({ wins }: { wins: number }) {
  // only pick cards on the first round
  if (wins === 0) return null;
  if (wins % 4 === 0) return 'removeCards'; // 8, 12, 16, ...
  if (wins % 4 === 2) return 'chainCards'; // 2, 6, 10, ...
  if (wins % 2 === 1) return 'addRelic'; // 1, 3, 5, ...
  return null;
}

export function getIsTurnOver(player: PlayerState) {
  return player.extraCardPlays === 0;
}

export function getIsGameOver({ wins, losses }: { wins: number; losses: number }) {
  return losses >= MAX_LOSSES || wins >= MAX_WINS;
}

export function getBattleWinner(game: GameState) {
  if (game.user.health <= 0) return 'enemy';
  if (game.enemy.health <= 0) return 'user';
  return null;
}

export function getRandom({ randomnessState }: { randomnessState: GameState['randomnessState'] }) {
  return new Random(randomnessState);
}

export function getCanUndo(game: GameState) {
  const isStartOfBattle = game.turn === 0 && game.user.cardsPlayedThisTurn === 0;
  return game.undoGameState != null && !isStartOfBattle;
}
