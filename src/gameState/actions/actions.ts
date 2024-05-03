import shuffle from 'lodash/shuffle';

import {
  CardState,
  createInitialGameState,
  GameState,
  getActivePlayer,
  getCurrentBattleNumber,
  getCanPlayCard,
  getEnemyCardsForBattle,
  MAX_LOSSES,
  MAX_WINS,
} from '../';
import { assert } from '../../utils';
import playCardHelper from './playCard';
import { getRandomEnemyType, statusEffectNames } from '../gameState';
import { pickEnemyCards } from '../enemies';

export function startGame(game: GameState) {
  game.user.cards = createInitialGameState().user.cards;
  game.user.trashedCards = [];
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
  const { enemy, user } = game;

  resetGameState(game);

  user.cards = shuffle(user.cards);

  if (game.wonLastBattle) {
    // fight a new enemy
    const enemyType = getRandomEnemyType();
    const battleNumber = getCurrentBattleNumber(game);
    enemy.cards = getEnemyCardsForBattle({ battleNumber, enemyType });
    game.currentEnemyType = enemyType;
  } else {
    // fight the same enemy
    const newEnemyCards = pickEnemyCards(game.currentEnemyType);
    enemy.cards.push(...newEnemyCards);
  }

  enemy.cards = shuffle(enemy.cards);
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
    game.wonLastBattle = false;
  } else if (game.enemy.health <= 0) {
    game.wins++;
    game.wonLastBattle = true;
  } else {
    throw new Error('endBattle called, but neither player is dead');
  }

  resetGameState(game);
  game.screen = game.wins >= MAX_WINS || game.losses >= MAX_LOSSES ? 'gameEnd' : 'battleEnd';
}

function resetGameState(game: GameState) {
  const { user, enemy } = game;

  [user, enemy].forEach((player) => {
    player.cards = [...player.cards, ...player.trashedCards];
    player.trashedCards = [];
    player.health = player.startingHealth;
    player.currentCardIndex = 0;

    statusEffectNames.forEach((statusEffect) => {
      player[statusEffect] = 0;
    });
  });

  game.animationEvents = [];
}
