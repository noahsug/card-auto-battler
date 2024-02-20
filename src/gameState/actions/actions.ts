import shuffle from 'lodash/shuffle';

import {
  CardState,
  createInitialGameState,
  GameState,
  getActivePlayer,
  getBattleCount,
  getCanPlayCard,
  getEnemyCardsForBattle,
  MAX_LOSSES,
  MAX_WINS,
} from '../';
import { assert } from '../../utils';
import playCardHelper from './playCard';
import { resetGameStateFromBattle } from '../gameState';

export function startGame(game: GameState) {
  game.user.cards = createInitialGameState().user.cards;
  startCardSelection(game);

  game.losses = 0;
  game.wins = 0;
}

export function startCardSelection(game: GameState) {
  game.turn = 0;

  game.screen = 'cardSelection';
}

export function addCard(game: GameState, card: CardState) {
  game.user.cards.push(card);
}

export function startBattle(game: GameState) {
  game.screen = 'battle';
  const { enemy } = game;

  resetGameStateFromBattle(game);

  const enemyCards = getEnemyCardsForBattle(getBattleCount(game));
  enemy.cards = shuffle(enemyCards);
}

export function startTurn(game: GameState) {
  const activePlayer = getActivePlayer(game);
  activePlayer.cardsPlayedThisTurn = 0;
  game.animationEvents = [];
}

export function playCard(game: GameState) {
  playCardHelper(game);
}

export function endTurn(game: GameState) {
  assert(!getCanPlayCard(game));

  game.turn++;
}

export function endBattle(game: GameState) {
  if (game.user.health <= 0) {
    game.losses++;
  } else if (game.enemy.health <= 0) {
    game.wins++;
  } else {
    throw new Error('endBattle called, but neither player is dead');
  }

  resetGameStateFromBattle(game);

  game.screen = game.wins >= MAX_WINS || game.losses >= MAX_LOSSES ? 'gameEnd' : 'battleEnd';
}
