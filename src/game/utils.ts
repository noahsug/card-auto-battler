import sample from 'lodash/sample';

import { allCards } from '../content/cards';
import { GameState, PlayerState, Target } from './gameState';
import { MAX_WINS } from './constants';

export function getRandomCards(length: number) {
  const cards = new Array(length);
  const options = Object.values(allCards);

  for (let i = 0; i < length; i++) {
    cards[i] = sample(options);
  }
  return cards;
}

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

export function isGameOver({ wins, lives }: { wins: number; lives: number }) {
  return lives <= 0 || wins >= MAX_WINS;
}

export function getBattleWinner(game: GameState) {
  if (game.user.health <= 0) return 'enemy';
  if (game.enemy.health <= 0) return 'user';
  return null;
}
