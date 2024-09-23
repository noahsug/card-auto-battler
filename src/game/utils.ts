import sample from 'lodash/sample';

import { allCards } from '../content/cards';
import { GameState, PlayerState, Target } from './gameState';

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
