import sample from 'lodash/sample';

import { allCards } from '../content/cards';
import { GameState } from './gameState';

export function getRandomCards(length: number) {
  const cards = new Array(length);
  const options = Object.values(allCards);

  for (let i = 0; i < length; i++) {
    cards[i] = sample(options);
  }
  return cards;
}

export function getIsEnemyTurn(game: GameState) {
  return game.turn % 2 === 1;
}

export function getActivePlayer(game: GameState) {
  return getIsEnemyTurn(game) ? game.enemy : game.user;
}

export function getNonActivePlayer(game: GameState) {
  return getIsEnemyTurn(game) ? game.user : game.enemy;
}

export function getPlayers(game: GameState) {
  return getIsEnemyTurn(game) ? [game.enemy, game.user] : [game.user, game.enemy];
}
