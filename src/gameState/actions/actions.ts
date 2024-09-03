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
  MAX_TURNS_IN_BATTLE,
} from '../';
import { assert } from '../../utils';
import applyCardEffects from './applyCardEffects';
import {
  getNonActivePlayer,
  getRandomEnemyType,
  statusEffectNames,
  getCurrentCard,
} from '../gameState';
import { pickEnemyCards } from '../enemies';
import { discardCurrentCard } from './deck';

/**
 * Every function in this file is automatically picked up and converted into a reducer function
 * that's accessible via the useActions() hook (see GameStateContext).
 */

export function startGame(game: GameState) {
  // set new starter cards
  game.user.cards = createInitialGameState().user.cards;
  game.user.trashedCards = [];
  startCardSelection(game);

  game.losses = 0;
  game.wins = 0;
}

export function startCardSelection(game: GameState) {
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
  game.battleEvents = [];
}

export function playCard(game: GameState) {
  const self = getActivePlayer(game);
  const opponent = getNonActivePlayer(game);
  const card = getCurrentCard(self);

  // die if out of cards
  if (card == null) {
    self.health = 0;
    return;
  }

  if (self.cardsPlayedThisTurn > 0) {
    assert(self.extraCardPlays > 0);
    self.extraCardPlays -= 1;
  }

  self.cardsPlayedThisTurn += 1;

  const events = applyCardEffects(card, { self, opponent });

  game.battleEvents.push(...events);

  // if (card.trashSelf) {
  //   trashCurrentCard(self);
  // } else {
  discardCurrentCard(self);
  // }
}

export function endTurn(game: GameState) {
  assert(!getCanPlayCard(game));

  game.turn++;

  // end game after max turns
  if (game.turn >= MAX_TURNS_IN_BATTLE) {
    const loser = game.user.health <= game.enemy.health ? game.user : game.enemy;
    loser.health = 0;
  }
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

  game.turn = 0;
  game.battleEvents = [];
}
