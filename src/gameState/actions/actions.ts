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
  getBattleCount,
  getNonActivePlayer,
  getCanPlayCard,
  EMPTY_EFFECTS,
} from '../';
import { assert } from '../../utils';

export function startGame(game: GameState) {
  game.user.cards = createInitialGameState().user.cards;
  startCardSelection(game);

  game.losses = 0;
  game.wins = 0;
}

export function startCardSelection(game: GameState) {
  game.turn = 0;

  game.screen = 'card-selection';
}

export function addCard(game: GameState, card: CardState) {
  game.user.cards.push(card);
}

export function startBattle(game: GameState) {
  game.screen = 'battle';
  const { user, opponent } = game;

  user.cards = shuffle(user.cards);
  user.health = user.maxHealth;
  user.currentCardIndex = 0;
  user.effects = { ...EMPTY_EFFECTS };

  const opponentCards = getOpponentCardsForBattle(getBattleCount(game));
  opponent.cards = shuffle(opponentCards);
  opponent.health = opponent.maxHealth;
  opponent.currentCardIndex = 0;
  opponent.effects = { ...EMPTY_EFFECTS };
}

export function startTurn(game: GameState) {
  const activePlayer = getActivePlayer(game);
  activePlayer.cardsPlayed = 0;
}

export function playCard(game: GameState) {
  // TODO: refactor to target / self
  const activePlayer = getActivePlayer(game);
  const nonActivePlayer = getNonActivePlayer(game);
  const card = getCurrentCard(activePlayer);

  if (activePlayer.cardsPlayed > 0) {
    assert(activePlayer.effects.extraCardPlays > 0);
    activePlayer.effects.extraCardPlays -= 1;
  }
  activePlayer.cardsPlayed += 1;

  // refactor to function that takes player and applies dmg/effects
  activePlayer.currentCardIndex = (activePlayer.currentCardIndex + 1) % activePlayer.cards.length;

  if (card.target?.damage != null) {
    dealDamage({ target: nonActivePlayer, damage: card.target.damage });
  }

  if (card.target?.effects?.bleed != null) {
    nonActivePlayer.effects.bleed += card.target.effects.bleed;
  }

  if (card.self?.effects?.extraCardPlays != null) {
    activePlayer.effects.extraCardPlays += card.self.effects.extraCardPlays;
  }
}

function dealDamage({ target, damage }: { target: PlayerState; damage: number }) {
  if (damage > 0) {
    target.health -= damage;

    if (target.effects.bleed) {
      target.health -= 3;
      target.effects.bleed -= 1;
    }
  }
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
