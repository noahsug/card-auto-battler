import shuffle from 'lodash/shuffle';

import {
  Game,
  Card,
  MAX_WINS,
  MAX_LOSSES,
  getActiveCard,
  getActivePlayer,
  getNonActivePlayer,
  getOpponentCardsForRound,
  createInitialGame,
  getRound,
} from '../';

export const startTurn = () => (game: Game) => {
  const activePlayer = getActivePlayer(game);
  const nonActivePlayer = getNonActivePlayer(game);
  const card = getActiveCard(activePlayer);

  const dmg = parseInt(card.text.split(' ')[1], 10);
  nonActivePlayer.health -= dmg;
};

export const endTurn = () => (game: Game) => {
  const activePlayer = getActivePlayer(game);
  activePlayer.activeCardIndex = (activePlayer.activeCardIndex + 1) % activePlayer.cards.length;

  game.turn++;
};

export const endRound = () => (game: Game) => {
  if (game.user.health <= 0) {
    game.losses++;
  } else if (game.opponent.health <= 0) {
    game.wins++;
  } else {
    throw new Error('endRound called, but neither player is dead');
  }

  game.screen = game.wins >= MAX_WINS || game.losses >= MAX_LOSSES ? 'game-end' : 'round-end';
};

export const startCardSelection = () => (game: Game) => {
  game.user.health = game.user.maxHealth;
  game.user.activeCardIndex = 0;

  game.opponent.health = game.opponent.maxHealth;
  game.opponent.activeCardIndex = 0;

  game.turn = 0;

  game.screen = 'card-selection';
};

export const startRound = () => (game: Game) => {
  game.screen = 'battle';

  game.user.cards = shuffle(game.user.cards);

  const opponentCards = getOpponentCardsForRound(getRound(game));
  game.opponent.cards = shuffle(opponentCards);
};

export const startGame = () => (game: Game) => {
  startCardSelection()(game);
  game.user.cards = createInitialGame().user.cards;

  game.losses = 0;
  game.wins = 0;
};

export const addCard = (card: Card) => (game: Game) => {
  game.user.cards.push(card);
};