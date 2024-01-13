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
  EMPTY_STATUS_EFFECTS,
  CardEffects,
  StatusEffects,
} from '../';
import { assert } from '../../utils';
import { Entries } from '../../utils/types/types';

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
  user.statusEffects = { ...EMPTY_STATUS_EFFECTS };

  const opponentCards = getOpponentCardsForBattle(getBattleCount(game));
  opponent.cards = shuffle(opponentCards);
  opponent.health = opponent.maxHealth;
  opponent.currentCardIndex = 0;
  opponent.statusEffects = { ...EMPTY_STATUS_EFFECTS };
}

export function startTurn(game: GameState) {
  const activePlayer = getActivePlayer(game);
  activePlayer.cardsPlayedThisTurn = 0;
}

export function playCard(game: GameState) {
  const activePlayer = getActivePlayer(game);
  const nonActivePlayer = getNonActivePlayer(game);
  const card = getCurrentCard(activePlayer);

  if (activePlayer.cardsPlayedThisTurn > 0) {
    assert(activePlayer.statusEffects.extraCardPlays > 0);
    activePlayer.statusEffects.extraCardPlays -= 1;
  }
  activePlayer.cardsPlayedThisTurn += 1;

  // refactor to function that takes player and applies dmg/effects
  activePlayer.currentCardIndex = (activePlayer.currentCardIndex + 1) % activePlayer.cards.length;

  if (card.target) {
    applyCardEffectsToTarget({
      target: nonActivePlayer,
      self: activePlayer,
      cardEffects: card.target,
    });
  }
  if (card.self) {
    applyCardEffectsToTarget({ target: activePlayer, self: activePlayer, cardEffects: card.self });
  }
}

function applyCardEffectsToTarget(
  {
    target,
    self,
    cardEffects,
  }: {
    target: PlayerState;
    self: PlayerState;
    cardEffects: CardEffects;
  },
  appliedMultihit = false,
) {
  const multihit = cardEffects.multihit || 0;
  // Calculated before bleed is applied
  const bonusMultihit =
    cardEffects.multihitForBleed != null && target.statusEffects.bleed >= 0
      ? target.statusEffects.bleed - 1
      : 0;

  if (multihit + bonusMultihit < 0) return;

  if (cardEffects.damage != null) {
    if (target.statusEffects.dodge > 0) {
      target.statusEffects.dodge -= 1;
    } else {
      dealDamage({ target, self, damage: cardEffects.damage });
    }
  }

  if (cardEffects.statusEffects) {
    (Object.entries(cardEffects.statusEffects) as Entries<StatusEffects>).forEach(
      ([statusEffect, value]) => {
        target.statusEffects[statusEffect] += value;
      },
    );
  }

  if (!appliedMultihit) {
    const multihit = (cardEffects.multihit || 0) + bonusMultihit;
    for (let i = 0; i < multihit; i++) {
      applyCardEffectsToTarget({ target, self, cardEffects }, true);
    }
  }
}

function dealDamage({
  target,
  self,
  damage,
}: {
  target: PlayerState;
  self: PlayerState;
  damage: number;
}) {
  damage += self.statusEffects.strength;

  if (damage > 0) {
    target.health -= damage;

    if (target.statusEffects.bleed) {
      target.health -= 3;
      target.statusEffects.bleed -= 1;
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
