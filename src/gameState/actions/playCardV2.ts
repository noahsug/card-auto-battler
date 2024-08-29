import { StatusEffectName, Target, PlayerValueName, statusEffectNames } from '../gameState';
import { PlayerState, AnimationEvent } from '../../gameState';
import { assert, assertIsNonNullable, readonlyIncludes } from '../../utils';

export type CardEffectName = StatusEffectName | 'damage' | 'heal' | 'trash';

export interface BasicValueDescriptor {
  type: 'basicValue';
  value: number;
}

interface PlayerValueDescriptor {
  type: 'playerValue';
  target: Target;
  name: PlayerValueName;
  multiplier?: number;
}

type ValueDescriptor = BasicValueDescriptor | PlayerValueDescriptor;

export interface If {
  value: ValueDescriptor;
  comparison: '>' | '<' | '=' | '<=' | '>=';
  value2: ValueDescriptor;
}

export interface CardEffect {
  target: Target;
  name: CardEffectName;
  value: ValueDescriptor;
  multiHit?: number;
  if?: If;
}

export interface Repeat {
  value: ValueDescriptor;
  if?: If;
}

export interface CardState {
  effects: CardEffect[];
  repeat?: Repeat;
}

export interface PlayCardContext {
  self: PlayerState;
  opponent: PlayerState;
  events: AnimationEvent[];
}

// Helper function for quickly creating cards
export function getValueDescriptor(
  target: Target,
  name: PlayerValueName,
  multiplier?: number,
): PlayerValueDescriptor;
export function getValueDescriptor(value: number): BasicValueDescriptor;
export function getValueDescriptor(
  valueOrTarget: number | Target,
  name?: PlayerValueName,
  multiplier?: number,
): ValueDescriptor {
  if (typeof valueOrTarget === 'number') {
    return { type: 'basicValue', value: valueOrTarget };
  }
  assertIsNonNullable(name);
  return { type: 'playerValue', target: valueOrTarget, name, multiplier };
}

const BLEED_DAMAGE = 3;

export default function playCard(
  card: CardState,
  { self, opponent }: { self: PlayerState; opponent: PlayerState },
) {
  const events: AnimationEvent[] = [];

  card.effects.forEach((effect) => {
    applyCardEffect(effect, { self, opponent, events });
  });

  return events;
}

function applyCardEffect(effect: CardEffect, context: PlayCardContext, multiHitCount: number = 1) {
  if (effect.if) {
    const success = evaluateIf(effect.if, context);
    if (!success) return;
  }

  const value = getDescribedValue(effect.value, context);

  switch (effect.name) {
    case 'damage':
      const dodgedDamage = dodgeDamage(effect, context);
      if (!dodgedDamage) {
        dealDamage(value, effect.target, context);
      }
      break;

    case 'heal':
      applyHeal(value, effect.target, context);
      break;

    case 'trash':
      trashCards(value, effect.target, context);
      break;

    // status effects
    default:
      assert(readonlyIncludes(statusEffectNames, effect.name));
      context[effect.target][effect.name] += value;
  }

  if (effect.multiHit && multiHitCount < effect.multiHit) {
    applyCardEffect(effect, context, multiHitCount + 1);
  }
}

function evaluateIf(ifStatement: If, context: PlayCardContext) {
  const value1 = getDescribedValue(ifStatement.value, context);
  const value2 = getDescribedValue(ifStatement.value2, context);
  return compareValues(value1, ifStatement.comparison, value2);
}

function getDescribedValue(descriptor: ValueDescriptor, context: PlayCardContext): number {
  switch (descriptor.type) {
    case 'basicValue':
      return descriptor.value;

    case 'playerValue':
      const multiplier = descriptor.multiplier ?? 1;
      return getPlayerValue(descriptor, context) * multiplier;
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

function dealDamage(damage: number, target: Target, { self, opponent, events }: PlayCardContext) {
  // bleed and strength only apply when damaging the opponent
  if (target === 'opponent') {
    // strength
    damage += self.strength;
    // bleed
    if (opponent.bleed > 0) {
      damage += BLEED_DAMAGE;
      opponent.bleed -= 1;
    }
  }

  if (damage <= 0) return;

  const targetPlayer = target === 'self' ? self : opponent;
  targetPlayer.health -= damage;

  events.push({ type: 'damage', target, value: damage });
}

function applyHeal(heal: number, target: Target, { self, opponent, events }: PlayCardContext) {
  if (heal <= 0) return;

  const targetPlayer = target === 'self' ? self : opponent;
  targetPlayer.health += heal;

  events.push({ type: 'heal', target, value: heal });
}

// TODO: use deck.ts
function trashCards(value: number, target: Target, context: PlayCardContext) {
  const targetPlayer = context[target];
  const { cards, currentCardIndex } = targetPlayer;

  const trashStart = target === 'self' ? currentCardIndex + 1 : currentCardIndex;
  const removeFromFront = Math.max(trashStart + value - cards.length, 0);

  targetPlayer.cards = cards.filter((_, i) => {
    const removeCard =
      // trash cards after or at the current card
      (i >= trashStart && i < trashStart + value) ||
      // trash cards from the front of the deck
      i < removeFromFront;

    if (removeCard) {
      targetPlayer.trashedCards.push(cards[i]);
    }

    return !removeCard;
  });

  targetPlayer.currentCardIndex = Math.max(currentCardIndex - removeFromFront, 0);
}
