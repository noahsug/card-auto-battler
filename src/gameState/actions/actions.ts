import shuffle from 'lodash/shuffle';

import {
  GameState,
  CardState,
  PlayerState,
  MAX_WINS,
  MAX_LOSSES,
  getCurrentCard,
  getActivePlayer,
  getOpponentCardsForBattle,
  createInitialGameState,
  getBattle,
  getNonActivePlayer,
  getCanPlayCard,
} from '../';
import { assert } from '../../utils';

export function startGame(game: GameState) {
  game.user.cards = createInitialGameState().user.cards;
  startCardSelection(game);

  game.losses = 0;
  game.wins = 0;
}

export function startCardSelection(game: GameState) {
  game.user.health = game.user.maxHealth;
  game.user.currentCardIndex = 0;

  game.opponent.health = game.opponent.maxHealth;
  game.opponent.currentCardIndex = 0;

  game.turn = 0;

  game.screen = 'card-selection';
}

export function addCard(game: GameState, card: CardState) {
  game.user.cards.push(card);
}

export function startBattle(game: GameState) {
  game.screen = 'battle';

  game.user.cards = shuffle(game.user.cards);

  const opponentCards = getOpponentCardsForBattle(getBattle(game));
  game.opponent.cards = shuffle(opponentCards);
}

export function startTurn(game: GameState) {
  const activePlayer = getActivePlayer(game);
  activePlayer.actions = 1;
}

export function playCard(game: GameState) {
  const activePlayer = getActivePlayer(game);
  const nonActivePlayer = getNonActivePlayer(game);
  const card = getCurrentCard(activePlayer);

  assert(activePlayer.actions > 0);
  activePlayer.actions -= 1;
  activePlayer.currentCardIndex = (activePlayer.currentCardIndex + 1) % activePlayer.cards.length;

  const damageText = card.text.match(/dmg (\d+)/)?.at(1);
  if (damageText != null) {
    const damage = Number(damageText);
    dealDamage({ target: nonActivePlayer, damage });
  }

  const actionsText = card.text.match(/actions (\d+)/)?.at(1);
  if (actionsText != null) {
    const actions = Number(actionsText);
    activePlayer.actions += actions;
  }
}

function dealDamage({ target, damage }: { target: PlayerState; damage: number }) {
  target.health -= damage;
}

export function endTurn(game: GameState) {
  assert(!getCanPlayCard(game));

  game.turn++;
}

export function endBattle(game: GameState) {
  if (game.user.health <= 0) {
    game.losses++;
  } else if (game.opponent.health <= 0) {
    game.wins++;
  } else {
    throw new Error('endBattle called, but neither player is dead');
  }

  game.screen = game.wins >= MAX_WINS || game.losses >= MAX_LOSSES ? 'game-end' : 'battle-end';
}
