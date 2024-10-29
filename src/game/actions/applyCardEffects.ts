import {
  CardEffect,
  CardState,
  If,
  MaybeValue,
  PlayerValueDescriptor,
  statusEffectNames,
  Target,
  ValueDescriptor,
  PlayerState,
  GameState,
  Tribe,
} from '../gameState';
import { BLEED_DAMAGE } from '../constants';
import { assert } from '../../utils/asserts';
import { BattleEvent, createDamageEvent, createHealEvent, createMissEvent } from './battleEvent';
import { readonlyIncludes } from '../../utils/iterators';

interface PlayCardContext {
  game: GameState;
  self: PlayerState;
  opponent: PlayerState;
  events: BattleEvent[];
}

interface EffectOptions {
  value: number;
  target: Target;
  multiplier?: number;
}

export function applyCardEffects(
  card: CardState,
  { game, self, opponent }: { game: GameState; self: PlayerState; opponent: PlayerState },
) {
  const events: BattleEvent[] = [];
  const context = { game, self, opponent, events };

  let activations = 1;
  if (card.repeat) {
    activations += maybeGetValue(card.repeat, context) || 0;
  }

  for (let i = 0; i < activations; i++) {
    card.effects.forEach((effect) => {
      applyEffect(effect, context);
    });
  }

  return events;
}

function applyEffect(effect: CardEffect, context: PlayCardContext, multiHitsLeft?: number) {
  if (effect.if) {
    const success = evaluateIf(effect.if, context);
    if (!success) return;
  }

  if (effect.multiHit && multiHitsLeft == null) {
    multiHitsLeft = getValue(effect.multiHit, context) - 1;
    if (multiHitsLeft < 0) return;
  }

  let value = getValue(effect.value, context);

  if (effect.add) {
    value += maybeGetValue(effect.add, context) || 0;
  }

  const multiplier = effect.multiply && maybeGetValue(effect.multiply, context);
  const effectOptions = { value, multiplier, target: effect.target };

  switch (effect.name) {
    case 'damage': {
      const dodgedDamage = dodgeDamage(effect, context);
      if (!dodgedDamage) {
        dealDamage(effectOptions, context);
      }
      break;
    }

    case 'heal':
      applyHeal(effectOptions, context);
      break;

    case 'trash':
      trashCards(effectOptions, context);
      break;

    // status effects
    default:
      assert(readonlyIncludes(statusEffectNames, effect.name));
      value = updateValue(value);
      context[effect.target][effect.name] += value;
  }

  if (multiHitsLeft) {
    applyEffect(effect, context, multiHitsLeft - 1);
  }
}

function evaluateIf(ifStatement: If, context: PlayCardContext) {
  const value1 = getValue(ifStatement.value, context);
  const value2 = getValue(ifStatement.value2, context);
  return compareValues(value1, ifStatement.comparison, value2);
}

function maybeGetValue({ value, if: ifStatement }: MaybeValue, context: PlayCardContext) {
  if (ifStatement) {
    const success = evaluateIf(ifStatement, context);
    if (!success) return undefined;
  }
  return getValue(value, context);
}

function getValue(descriptor: ValueDescriptor, context: PlayCardContext): number {
  switch (descriptor.type) {
    case 'basicValue':
      return descriptor.value;

    case 'playerValue': {
      const multiplier = descriptor.multiplier ?? 1;
      return getPlayerValue(descriptor, context) * multiplier;
    }
  }
}

function calculateTribePercent(player: PlayerState, tribe: Tribe): number {
  return (player.cards.filter((card) => card.tribe === tribe).length / player.cards.length) * 100;
}

function getPlayerValue({ target, name }: PlayerValueDescriptor, context: PlayCardContext): number {
  const player = context[target];

  if (name === 'turn') {
    return Math.floor(context.game.turn / 2);
  }

  if (name === 'percentGreen') {
    return calculateTribePercent(player, 'green');
  }
  if (name === 'percentRed') {
    return calculateTribePercent(player, 'red');
  }
  if (name === 'percentPurple') {
    return calculateTribePercent(player, 'purple');
  }

  const previousCardTribe = player.previousCard?.tribe;
  if (name === 'prevCardIsGreen') {
    return previousCardTribe === 'green' ? 1 : 0;
  }
  if (name === 'prevCardIsRed') {
    return previousCardTribe === 'red' ? 1 : 0;
  }
  if (name === 'prevCardIsPurple') {
    return previousCardTribe === 'purple' ? 1 : 0;
  }

  const value = player[name];
  // e.g. number of trashed cards
  if (Array.isArray(value)) {
    return value.length;
  }
  return value;
}

function compareValues(value1: number, comparison: If['comparison'], value2: number) {
  if (comparison === '>') return value1 > value2;
  if (comparison === '<') return value1 < value2;
  if (comparison === '=') return value1 === value2;
  if (comparison === '>=') return value1 >= value2;
  if (comparison === '<=') return value1 <= value2;

  throw new Error(`invalid comparison: ${comparison}`);
}

function dodgeDamage(effect: CardEffect, { opponent, events }: PlayCardContext) {
  // dodge doesn't apply to self damage
  if (effect.target === 'self') return false;

  if (opponent.dodge <= 0) return false;

  opponent.dodge -= 1;
  events.push(createMissEvent(effect.target));
  return true;
}

function dealDamage({ value, multiplier = 1, target }: EffectOptions, context: PlayCardContext) {
  const { self, opponent, events } = context;

  // strength
  if (target === 'opponent') {
    value += self.strength;
  }

  value = updateValue(value, multiplier);
  reduceHealth(value, target, context);

  // bleed
  if (value > 0 && target === 'opponent' && opponent.bleed > 0) {
    reduceHealth(BLEED_DAMAGE, target, context);
    opponent.bleed -= 1;

    // permaBleed
    if (opponent.bleed <= 0) {
      opponent.bleed += opponent.permaBleed;
    }
  }
}

function applyHeal(
  { value, multiplier = 1, target }: EffectOptions,
  { self, opponent, events }: PlayCardContext,
) {
  value = updateValue(value, multiplier);

  const targetPlayer = target === 'self' ? self : opponent;
  targetPlayer.health += value;

  events.push(createHealEvent(value, target));
}

function trashCards({ value, multiplier = 1, target }: EffectOptions, context: PlayCardContext) {
  value = updateValue(value, multiplier);
  if (value <= 0) return;

  const player = context[target];
  const isActivePlayer = target === 'self';

  // TODO
  // trashNextCards({ player, isActivePlayer, numCardsToTrash: value });
}

function updateValue(value: number, multiplier: number = 1) {
  value *= multiplier;
  return Math.floor(value);
}

function reduceHealth(value: number, target: Target, { self, opponent, events }: PlayCardContext) {
  const targetPlayer = target === 'self' ? self : opponent;

  // thick bark
  if (targetPlayer.thickBark > 0 && value <= 4) {
    value = 1;
  }

  targetPlayer.health -= value;
  events.push(createDamageEvent(value, target));
}
