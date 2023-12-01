import shuffle from 'lodash/shuffle';

import {
  GameState,
  CardState,
  PlayerState,
  Effect,
  MAX_WINS,
  MAX_LOSSES,
  getActiveCard,
  getActivePlayer,
  getNonActivePlayer,
  getOpponentCardsForRound,
  createInitialGameState,
  getRound,
} from '../';
import { assertIsDefined } from '../../utils';

export const startTurn = () => (gameState: GameState) => {
  const activePlayer = getActivePlayer(gameState);
  const nonActivePlayer = getNonActivePlayer(gameState);

  activePlayer.actions = 1;

  const card = getActiveCard(activePlayer);
  const damage = parseInt(card.text.split(' ')[1], 10);

  const event = {
    self: activePlayer,
    target: nonActivePlayer,
    targetEffect: {
      health: -damage,
    },
    source: { card },
  };
  gameState.events.push(event);
};

export const processEvent = () => (gameState: GameState) => {
  const event = gameState.events.shift();
  assertIsDefined(event);

  if (event.targetEffect) {
    assertIsDefined(event.target);
    processEffect(event.target, event.targetEffect);
  }
  if (event.selfEffect) {
    processEffect(event.self, event.selfEffect);
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
  const activePlayer = getActivePlayer(gameState);
  activePlayer.activeCardIndex = (activePlayer.activeCardIndex + 1) % activePlayer.cards.length;

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
  gameState.user.activeCardIndex = 0;

  gameState.opponent.health = gameState.opponent.maxHealth;
  gameState.opponent.activeCardIndex = 0;

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
