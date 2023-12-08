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

export const startTurn = () => (gameState: GameState) => {
  const activePlayer = getActivePlayer(gameState);
  activePlayer.actions = 1;
};

export const playCard = () => (gameState: GameState) => {
  const activePlayer = getActivePlayer(gameState);
  const card = getNextCard(activePlayer);

  assert(activePlayer.actions > 0);
  activePlayer.actions -= 1;
  activePlayer.nextCardIndex = (activePlayer.nextCardIndex + 1) % activePlayer.cards.length;

  const damage = parseInt(card.text.split(' ')[1], 10);

  gameState.events.push({
    nonActivePlayerEffect: {
      health: -damage,
    },
  });
};

export const processEvent = () => (gameState: GameState) => {
  const event = gameState.events.shift();
  assertIsDefined(event);

  const activePlayer = getActivePlayer(gameState);

  if (event.nonActivePlayerEffect) {
    const nonActivePlayer = getNonActivePlayer(gameState);
    processEffect(nonActivePlayer, event.nonActivePlayerEffect);
  }
  if (event.activePlayerEffect) {
    processEffect(activePlayer, event.activePlayerEffect);
  }
};

function processEffect(player: PlayerState, effect: Effect) {
  if (effect.health) {
    player.health += effect.health;
  }
  if (effect.actions) {
    player.actions += effect.actions;
  }
}

export const endTurn = () => (gameState: GameState) => {
  assert(gameState.events.length === 0);
  assert(!canPlayCard(gameState));

  gameState.turn++;
};

export const endRound = () => (gameState: GameState) => {
  if (gameState.user.health <= 0) {
    gameState.losses++;
  } else if (gameState.opponent.health <= 0) {
    gameState.wins++;
  } else {
    throw new Error('endRound called, but neither player is dead');
  }

  gameState.screen =
    gameState.wins >= MAX_WINS || gameState.losses >= MAX_LOSSES ? 'game-end' : 'round-end';
};

export const startCardSelection = () => (gameState: GameState) => {
  gameState.user.health = gameState.user.maxHealth;
  gameState.user.nextCardIndex = 0;

  gameState.opponent.health = gameState.opponent.maxHealth;
  gameState.opponent.nextCardIndex = 0;

  gameState.turn = 0;

  gameState.screen = 'card-selection';
};

export const startRound = () => (gameState: GameState) => {
  gameState.screen = 'battle';

  gameState.user.cards = shuffle(gameState.user.cards);

  const opponentCards = getOpponentCardsForRound(getRound(gameState));
  gameState.opponent.cards = shuffle(opponentCards);
};

export const startGame = () => (gameState: GameState) => {
  startCardSelection()(gameState);
  gameState.user.cards = createInitialGameState().user.cards;

  gameState.losses = 0;
  gameState.wins = 0;
};

export const addCard = (card: CardState) => (gameState: GameState) => {
  gameState.user.cards.push(card);
};
