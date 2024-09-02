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
  BattleEvent,
} from '../gameState';
import { BLEED_DAMAGE } from '../constants';
import { assert, readonlyIncludes } from '../../utils';
import { trashNextCards } from './deck';

interface PlayCardContext {
  self: PlayerState;
  opponent: PlayerState;
  events: BattleEvent[];
}

interface EffectOptions {
  value: number;
  target: Target;
  multiplier?: number;
}

export default function playCard(
  card: CardState,
  { self, opponent }: { self: PlayerState; opponent: PlayerState },
) {
  const events: BattleEvent[] = [];
  const context = { self, opponent, events };

  let activations = 1;
  if (card.repeat) {
    activations += maybeGetValue(card.repeat, context) || 0;
  }

  for (let i = 0; i < activations; i++) {
    card.effects.forEach((effect) => {
      applyCardEffect(effect, context);
    });
  }

  return events;
}

function applyCardEffect(effect: CardEffect, context: PlayCardContext, multiHitCount: number = 1) {
  if (effect.if) {
    const success = evaluateIf(effect.if, context);
    if (!success) return;
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

  if (effect.multiHit && multiHitCount < effect.multiHit) {
    applyCardEffect(effect, context, multiHitCount + 1);
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

function getPlayerValue({ target, name }: PlayerValueDescriptor, context: PlayCardContext): number {
  const player = context[target];
  const value = player[name];

  if (Array.isArray(value)) {
    // e.g. number of trashed cards
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
  events.push({ type: 'miss', target: effect.target });
  return true;
}

function dealDamage(
  { value, multiplier = 1, target }: EffectOptions,
  { self, opponent, events }: PlayCardContext,
) {
  // strength
  if (target === 'opponent') {
    value += self.strength;
  }

  value = updateValue(value, multiplier);

  const targetPlayer = target === 'self' ? self : opponent;
  targetPlayer.health -= value;

  events.push({ type: 'damage', target, value });

  // bleed
  if (value > 0 && target === 'opponent' && opponent.bleed > 0) {
    opponent.health -= BLEED_DAMAGE;
    opponent.bleed -= 1;
    events.push({ type: 'damage', target, value });
  }
}

function applyHeal(
  { value, multiplier = 1, target }: EffectOptions,
  { self, opponent, events }: PlayCardContext,
) {
  value = updateValue(value, multiplier);

  const targetPlayer = target === 'self' ? self : opponent;
  targetPlayer.health += value;

  events.push({ type: 'heal', target, value });
}

function trashCards({ value, multiplier = 1, target }: EffectOptions, context: PlayCardContext) {
  value = updateValue(value, multiplier);
  if (value <= 0) return;

  const player = context[target];
  const isActivePlayer = target === 'self';

  trashNextCards({ player, isActivePlayer, numCardsToTrash: value });
}

function updateValue(value: number, multiplier: number = 1) {
  value *= multiplier;
  return Math.floor(value);
}
