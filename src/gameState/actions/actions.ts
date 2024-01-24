import { cloneDeep } from 'lodash';
import shuffle from 'lodash/shuffle';

import {
  CardEffects,
  CardState,
  createInitialGameState,
  GameState,
  getActivePlayer,
  getBattleCount,
  getCanPlayCard,
  getCurrentCard,
  getEnemyCardsForBattle,
  getNonActivePlayer,
  MAX_LOSSES,
  MAX_WINS,
  PlayerState,
  statusEffectNames,
  Target,
  AnimationEvent,
} from '../';
import { assert } from '../../utils';
import { Value } from '../../utils/types/types';

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

  game.animationEvents = [];

  user.cards = shuffle([...user.cards, ...user.trashedCards]);
  user.trashedCards = [];
  user.health = user.maxHealth;
  user.currentCardIndex = 0;

  const enemyCards = getEnemyCardsForBattle(getBattleCount(game));
  enemy.cards = shuffle(enemyCards);
  enemy.health = enemy.maxHealth;
  enemy.currentCardIndex = 0;

  statusEffectNames.forEach((statusEffect) => {
    user[statusEffect] = 0;
    enemy[statusEffect] = 0;
  });
}

export function startTurn(game: GameState) {
  const activePlayer = getActivePlayer(game);
  activePlayer.cardsPlayedThisTurn = 0;
  game.animationEvents = [];
}

export function playCard(game: GameState) {
  const activePlayer = getActivePlayer(game);
  const nonActivePlayer = getNonActivePlayer(game);
  const card = getCurrentCard(activePlayer);

  // die if out of cards
  if (card == null) {
    activePlayer.health = 0;
    return;
  }

  if (activePlayer.cardsPlayedThisTurn > 0) {
    assert(activePlayer.extraCardPlays > 0);
    activePlayer.extraCardPlays -= 1;
  }
  activePlayer.cardsPlayedThisTurn += 1;

  card.effects.forEach((cardEffects) => {
    applyCardEffects({
      self: activePlayer,
      opponent: nonActivePlayer,
      cardEffects,
      animationEvents: game.animationEvents,
    });
  });

  if (card.trash) {
    activePlayer.cards.splice(activePlayer.currentCardIndex, 1);
    activePlayer.trashedCards.push(card);
    activePlayer.currentCardIndex = activePlayer.currentCardIndex % activePlayer.cards.length;
  } else {
    activePlayer.currentCardIndex = (activePlayer.currentCardIndex + 1) % activePlayer.cards.length;
  }
}

function getNumericPlayerValue(value: Value<PlayerState>) {
  if (Array.isArray(value)) return value.length;
  return value;
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

  const { effectName, basedOn, ratio = 1 } = cardEffects.effectBasedOnPlayerValue;

  const targetPlayer = basedOn.target === 'self' ? self : opponent;
  const basedOnValue = getNumericPlayerValue(targetPlayer[basedOn.valueName]);

  cardEffects = cloneDeep(cardEffects);
  cardEffects[effectName] = (cardEffects[effectName] || 0) + basedOnValue * ratio;

  return cardEffects;
}

function applyCardEffects(
  {
    self,
    opponent,
    cardEffects,
    animationEvents,
  }: {
    self: PlayerState;
    opponent: PlayerState;
    cardEffects: CardEffects;
    animationEvents: AnimationEvent[];
  },
  isRepeating = false,
) {
  const targetPlayer = cardEffects.target === 'self' ? self : opponent;

  if (!isRepeating) {
    cardEffects = gainEffectBasedOnPlayerValue({ self, opponent, cardEffects });
  }

  const repeat = cardEffects.repeat || 0;
  if (repeat < 0) return;

  if (cardEffects.damage != null) {
    // dodge doesn't apply to self damage
    if (cardEffects.target === 'opponent' && opponent.dodge > 0) {
      opponent.dodge -= 1;
    } else {
      const { damage, target } = cardEffects;
      dealDamage({ self, opponent, damage, target, animationEvents });
    }
  }

  statusEffectNames.forEach((statusEffect) => {
    targetPlayer[statusEffect] += cardEffects[statusEffect] || 0;
  });

  if (!isRepeating) {
    for (let i = 0; i < repeat; i++) {
      applyCardEffects({ self, opponent, cardEffects, animationEvents }, true);
    }
  }
}

function dealDamage({
  self,
  opponent,
  damage,
  target,
  animationEvents,
}: {
  opponent: PlayerState;
  self: PlayerState;
  damage: number;
  target: Target;
  animationEvents: AnimationEvent[];
}) {
  const targetPlayer = target === 'self' ? self : opponent;

  damage += self.strength;
  if (targetPlayer.bleed) {
    damage += 3;
    targetPlayer.bleed -= 1;
  }

  if (damage > 0) {
    targetPlayer.health -= damage;
    animationEvents.push({ type: 'damage', target, value: damage });
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
