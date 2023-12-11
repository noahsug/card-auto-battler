import shuffle from 'lodash/shuffle';

import {
  GameState,
  CardState,
  PlayerState,
  Effect,
  MAX_WINS,
  MAX_LOSSES,
  getNextCard,
  getActivePlayer,
  getOpponentCardsForRound,
  createInitialGameState,
  getRound,
  getNonActivePlayer,
  canPlayCard,
} from '../';
import { assertIsDefined, assert } from '../../utils';

export function startGame(game: GameState) {
  game.user.cards = createInitialGameState().user.cards;

  game.losses = 0;
  game.wins = 0;
}

export function startCardSelection(game: GameState) {
  game.user.health = game.user.maxHealth;
  game.user.nextCardIndex = 0;

  game.opponent.health = game.opponent.maxHealth;
  game.opponent.nextCardIndex = 0;

  game.turn = 0;

  game.screen = 'card-selection';
}

export function addCard(game: GameState, card: CardState) {
  game.user.cards.push(card);
}

export function startRound(game: GameState) {
  game.screen = 'battle';

  game.user.cards = shuffle(game.user.cards);

  const opponentCards = getOpponentCardsForRound(getRound(game));
  game.opponent.cards = shuffle(opponentCards);
}

export function startTurn(game: GameState) {
  const activePlayer = getActivePlayer(game);
  activePlayer.actions = 1;
}

export function playCard(game: GameState) {
  const activePlayer = getActivePlayer(game);
  const card = getNextCard(activePlayer);

  assert(activePlayer.actions > 0);
  activePlayer.actions -= 1;
  activePlayer.nextCardIndex = (activePlayer.nextCardIndex + 1) % activePlayer.cards.length;

  const damage = parseInt(card.text.split(' ')[1], 10);

  game.events.push({
    nonActivePlayerEffect: {
      health: -damage,
    },
  });
}

export function processEvent(game: GameState) {
  const event = game.events.shift();
  assertIsDefined(event);

  const activePlayer = getActivePlayer(game);

  if (event.nonActivePlayerEffect) {
    const nonActivePlayer = getNonActivePlayer(game);
    processEffect(nonActivePlayer, event.nonActivePlayerEffect);
  }
  if (event.activePlayerEffect) {
    processEffect(activePlayer, event.activePlayerEffect);
  }
}

function processEffect(player: PlayerState, effect: Effect) {
  if (effect.health) {
    player.health += effect.health;
  }
  if (effect.actions) {
    player.actions += effect.actions;
  }
}

export function endTurn(game: GameState) {
  assert(game.events.length === 0);
  assert(!canPlayCard(game));

  game.turn++;
}

export function endRound(game: GameState) {
  if (game.user.health <= 0) {
    game.losses++;
  } else if (game.opponent.health <= 0) {
    game.wins++;
  } else {
    throw new Error('endRound called, but neither player is dead');
  }

  game.screen = game.wins >= MAX_WINS || game.losses >= MAX_LOSSES ? 'game-end' : 'round-end';
}
