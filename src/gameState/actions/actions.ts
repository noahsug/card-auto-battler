import shuffle from 'lodash/shuffle';

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
import { cloneDeep } from 'lodash';

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
  // TODO: reduce duplication between activePlayer/nonActivePlayer and self/enemy ?
  const activePlayer = getActivePlayer(game);
  const nonActivePlayer = getNonActivePlayer(game);
  const card = getCurrentCard(activePlayer);

  if (activePlayer.cardsPlayedThisTurn > 0) {
    assert(activePlayer.statusEffects.extraCardPlays > 0);
    activePlayer.statusEffects.extraCardPlays -= 1;
  }
  activePlayer.cardsPlayedThisTurn += 1;

  activePlayer.currentCardIndex = (activePlayer.currentCardIndex + 1) % activePlayer.cards.length;

  if (card.opponent) {
    applyCardEffects({
      opponent: nonActivePlayer,
      self: activePlayer,
      cardEffects: card.opponent,
    });
  }
  if (card.self) {
    applyCardEffects({ opponent: activePlayer, self: activePlayer, cardEffects: card.self });
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
  opponent,
  self,
  cardEffects,
}: {
  opponent: PlayerState;
  self: PlayerState;
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
    self,
    opponent,
  }: {
    cardEffects: CardEffects;
    self: PlayerState;
    opponent: PlayerState;
  },
  isRepeating = false,
) {
  if (!isRepeating) {
    cardEffects = gainEffectBasedOnPlayerValue({ opponent, self, cardEffects });
  }

  const repeat = cardEffects.repeat || 0;
  if (repeat < 0) return;

  if (cardEffects.damage != null) {
    if (opponent.statusEffects.dodge > 0) {
      opponent.statusEffects.dodge -= 1;
    } else {
      dealDamage({ self, opponent, damage: cardEffects.damage });
    }
  }

  if (cardEffects.statusEffects) {
    (Object.entries(cardEffects.statusEffects) as Entries<StatusEffects>).forEach(
      ([statusEffect, value]) => {
        opponent.statusEffects[statusEffect] += value;
      },
    );
  }

  if (!isRepeating) {
    for (let i = 0; i < repeat; i++) {
      applyCardEffects({ opponent, self, cardEffects }, true);
    }
  }
}

function dealDamage({
  opponent,
  self,
  damage,
}: {
  opponent: PlayerState;
  self: PlayerState;
  damage: number;
}) {
  damage += self.statusEffects.strength;

  if (damage > 0) {
    opponent.health -= damage;

    if (opponent.statusEffects.bleed) {
      opponent.health -= 3;
      opponent.statusEffects.bleed -= 1;
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
