import { cloneDeep } from 'lodash';

import {
  AnimationEvent,
  CardEffects,
  GameState,
  PlayerState,
  Target,
  getActivePlayer,
  getCurrentCard,
  getNonActivePlayer,
  statusEffectNames,
} from '../../gameState';
import { assert, getNonNullEntries } from '../../utils';
import { GainEffectsOptions, MAX_TURNS_IN_BATTLE, PlayerValueIdentifier } from '../gameState';

export default function playCard(game: GameState) {
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

  let trashSelf = false;

  card.effects.forEach((cardEffects) => {
    const resultingCardEffects = handleCardEffects({
      activePlayer,
      nonActivePlayer,
      cardEffects,
      game,
    });
    if (resultingCardEffects.trashSelf) {
      trashSelf = true;
    }
  });

  if (trashSelf) {
    trashCurrentCard(activePlayer);
  }

  activePlayer.currentCardIndex = (activePlayer.currentCardIndex + 1) % activePlayer.cards.length;

  // end game after max turns
  if (game.turn >= MAX_TURNS_IN_BATTLE - 1) {
    const target = game.user.health <= game.enemy.health ? game.user : game.enemy;
    target.health = 0;
  }
}

function handleCardEffects({
  activePlayer,
  nonActivePlayer,
  cardEffects,
  game,
}: {
  activePlayer: PlayerState;
  nonActivePlayer: PlayerState;
  cardEffects: CardEffects;
  game: GameState;
}) {
  const resultingCardEffects = cloneDeep(cardEffects);
  cardEffects.gainEffectsList?.forEach((gainEffectsOptions) => {
    gainEffects({
      self: activePlayer,
      opponent: nonActivePlayer,
      cardEffects: resultingCardEffects,
      gainEffectsOptions,
    });
  });

  for (let i = 0; i < (resultingCardEffects.activations ?? 1); i++) {
    applyCardEffects({
      self: activePlayer,
      opponent: nonActivePlayer,
      cardEffects: resultingCardEffects,
      animationEvents: game.animationEvents,
    });
  }

  return resultingCardEffects;
}

function gainEffects({
  self,
  opponent,
  cardEffects,
  gainEffectsOptions,
}: {
  self: PlayerState;
  opponent: PlayerState;
  cardEffects: CardEffects;
  gainEffectsOptions: GainEffectsOptions;
}) {
  if (!cardEffects.gainEffectsList) return cardEffects;

  const { effects, forEveryPlayerValue, divisor = 1 } = gainEffectsOptions;

  const playerValueMultiplier = forEveryPlayerValue
    ? getPlayerValue({ self, opponent, identifier: forEveryPlayerValue })
    : 1;

  getNonNullEntries(effects).forEach(([name, value]) => {
    if (typeof value === 'boolean') {
      const boolValue = value && playerValueMultiplier > 0;
      cardEffects[name] = cardEffects[name] || boolValue;
    } else {
      const defaultValue = name === 'activations' ? 1 : 0;
      const currentValue = cardEffects[name] ?? defaultValue;
      cardEffects[name] = currentValue + (value * playerValueMultiplier) / divisor;
    }
  });

  return cardEffects;
}

function getPlayerValue({
  self,
  opponent,
  identifier,
}: {
  self: PlayerState;
  opponent: PlayerState;
  identifier: PlayerValueIdentifier;
}) {
  const targetPlayer = identifier.target === 'self' ? self : opponent;
  const value = targetPlayer[identifier.name];

  if (Array.isArray(value)) {
    return value.length;
  }
  return value;
}

function applyCardEffects({
  self,
  opponent,
  cardEffects,
  animationEvents,
}: {
  self: PlayerState;
  opponent: PlayerState;
  cardEffects: CardEffects;
  animationEvents: AnimationEvent[];
}) {
  const targetPlayer = cardEffects.target === 'self' ? self : opponent;

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

function trashCurrentCard(player: PlayerState) {
  const [card] = player.cards.splice(player.currentCardIndex, 1);
  player.trashedCards.push(card);
  player.currentCardIndex -= 1;
}
