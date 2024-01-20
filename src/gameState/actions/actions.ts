import shuffle from 'lodash/shuffle';
import { cloneDeep } from 'lodash';

import {
  GameState,
  CardState,
  PlayerState,
  MAX_WINS,
  MAX_LOSSES,
  getCurrentCard,
  getActivePlayer,
  getEnemyCardsForBattle,
  createInitialGameState,
  getBattleCount,
  getNonActivePlayer,
  getCanPlayCard,
  EMPTY_STATUS_EFFECTS,
  CardEffects,
  StatusEffects,
  PlayerValueIdentifier,
} from '../';
import { assert } from '../../utils';
import { Entries } from '../../utils/types/types';
import { Target } from '../gameState';

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
  const { user, enemy } = game;

  user.cards = shuffle(user.cards);
  user.health = user.maxHealth;
  user.currentCardIndex = 0;
  user.statusEffects = { ...EMPTY_STATUS_EFFECTS };

  const enemyCards = getEnemyCardsForBattle(getBattleCount(game));
  enemy.cards = shuffle(enemyCards);
  enemy.health = enemy.maxHealth;
  enemy.currentCardIndex = 0;
  enemy.statusEffects = { ...EMPTY_STATUS_EFFECTS };
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

  activePlayer.currentCardIndex = (activePlayer.currentCardIndex + 1) % activePlayer.cards.length;

  // apply effects to opponent first, then self, to avoid self effects being applied to opponent effects
  if (card.opponent) {
    applyCardEffects({
      target: 'opponent',
      self: activePlayer,
      opponent: nonActivePlayer,
      cardEffects: card.opponent,
    });
  }
  if (card.self) {
    applyCardEffects({
      target: 'self',
      self: activePlayer,
      opponent: nonActivePlayer,
      cardEffects: card.self,
    });
  }
}

function getPlayerValue({
  valueIdentifier,
  player,
}: {
  valueIdentifier: PlayerValueIdentifier;
  player: PlayerState;
}) {
  if (valueIdentifier.isStatusEffect) {
    return player.statusEffects[valueIdentifier.name];
  }

  const value = player[valueIdentifier.name];
  if (typeof value === 'number') return value;
  if (Array.isArray(value)) return value.length;
  return Object.values(value).reduce((sum, v) => sum + v, 0);
}

function gainEffectBasedOnPlayerValue({
  self,
  opponent,
  cardEffects,
}: {
  self: PlayerState;
  opponent: PlayerState;
  cardEffects: CardEffects;
}) {
  if (!cardEffects.effectBasedOnPlayerValue) return cardEffects;

  const { effect, basedOn, ratio = 1 } = cardEffects.effectBasedOnPlayerValue;
  cardEffects = cloneDeep(cardEffects);

  const basedOnValue = getPlayerValue({
    valueIdentifier: basedOn,
    player: basedOn.target === 'self' ? self : opponent,
  });

  if (effect.isStatusEffect) {
    if (cardEffects.statusEffects == null) {
      cardEffects.statusEffects = {};
    }
    const currentStatusEffectValue = cardEffects.statusEffects[effect.name] || 0;
    cardEffects.statusEffects[effect.name] = currentStatusEffectValue + basedOnValue * ratio;
  } else {
    const currentEffectValue = cardEffects[effect.name] || 0;
    cardEffects[effect.name] = currentEffectValue + basedOnValue * ratio;
  }

  return cardEffects;
}

function applyCardEffects(
  {
    cardEffects,
    target,
    self,
    opponent,
  }: {
    target: Target;
    self: PlayerState;
    opponent: PlayerState;
    cardEffects: CardEffects;
  },
  isRepeating = false,
) {
  const targetPlayer = target === 'self' ? self : opponent;

  if (!isRepeating) {
    cardEffects = gainEffectBasedOnPlayerValue({ self, opponent, cardEffects });
  }

  const repeat = cardEffects.repeat || 0;
  if (repeat < 0) return;

  if (cardEffects.damage != null) {
    // dodge doesn't apply to self damage
    if (target === 'opponent' && opponent.statusEffects.dodge > 0) {
      opponent.statusEffects.dodge -= 1;
    } else {
      dealDamage({ target, self, opponent, damage: cardEffects.damage });
    }
  }

  if (cardEffects.statusEffects) {
    (Object.entries(cardEffects.statusEffects) as Entries<StatusEffects>).forEach(
      ([statusEffect, value]) => {
        targetPlayer.statusEffects[statusEffect] += value;
      },
    );
  }

  if (!isRepeating) {
    for (let i = 0; i < repeat; i++) {
      applyCardEffects({ target, self, opponent, cardEffects }, true);
    }
  }
}

function dealDamage({
  target,
  self,
  opponent,
  damage,
}: {
  target: Target;
  opponent: PlayerState;
  self: PlayerState;
  damage: number;
}) {
  const targetPlayer = target === 'self' ? self : opponent;

  damage += self.statusEffects.strength;

  if (damage > 0) {
    targetPlayer.health -= damage;

    if (targetPlayer.statusEffects.bleed) {
      targetPlayer.health -= 3;
      targetPlayer.statusEffects.bleed -= 1;
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
  } else if (game.enemy.health <= 0) {
    game.wins++;
  } else {
    throw new Error('endBattle called, but neither player is dead');
  }

  game.screen = game.wins >= MAX_WINS || game.losses >= MAX_LOSSES ? 'game-end' : 'battle-end';
}
