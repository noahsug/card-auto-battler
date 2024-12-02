import { EnemyName } from '../../content/enemies/enemies';
import { getEnemyInfo } from './enemies';
import { RelicName } from '../../content/relics/relics';
import { Random } from '../../utils/Random';
import { MAX_LOSSES, MAX_WINS } from '../constants';
import { CardState, GameState, PlayerState, Target, createPlayer } from '../gameState';

export function getIsStartOfBattle(game: GameState) {
  return game.turn === 0 && game.user.cardsPlayedThisTurn === 0;
}

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

export function getIsTurnOver(game: GameState) {
  const player = getActivePlayer(game);
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

export function getNextEnemy({ enemyOrder, wins }: { enemyOrder: EnemyName[]; wins: number }) {
  const enemyInfo = getEnemyInfo(enemyOrder[wins], wins);
  return createPlayer(enemyInfo);
}
