import {
  BasicValueDescriptor,
  CardEffect,
  CardState,
  If,
  PlayerValueDescriptor,
  PlayerValueName,
  Target,
  ValueDescriptor,
} from '../../game/gameState';
import { assertIsNonNullable } from '../../utils/asserts';

// returns a CardEffect with defaults
export function getEffect(partialEffect: Partial<CardEffect> = {}): CardEffect {
  partialEffect.target = partialEffect.target || 'opponent';
  partialEffect.name = partialEffect.name || 'damage';
  partialEffect.value = partialEffect.value || value(1);
  return partialEffect as CardEffect;
}

// returns a CardState with defaults
export function createCard(
  effects: Partial<CardEffect>[] = [{}],
  {
    repeat,
    name = '',
    description = '',
    image = '',
    tribe = 'basic',
  }: Partial<Omit<CardState, 'effects'>> = {},
): CardState {
  return {
    effects: effects.map(getEffect),
    repeat,
    name,
    description,
    image,
    tribe,
  };
}

// returns a CardEffect.If with defaults
export function ifCompare(
  target: Target,
  name: PlayerValueName,
  multiplier: number,
  comparison: If['comparison'],
  basicValue: number,
): If;
export function ifCompare(
  target: Target,
  name: PlayerValueName,
  comparison: If['comparison'],
  basicValue: number,
): If;
export function ifCompare(
  target: Target,
  name: PlayerValueName,
  arg1: number | If['comparison'],
  arg2: If['comparison'] | number,
  arg3?: number,
): If {
  if (arguments.length === 4) {
    const comparison = arg1 as If['comparison'];
    const basicValue = arg2 as number;
    return ifCompare(target, name, 1, comparison, basicValue);
  }
  const multiplier = arg1 as number;
  const comparison = arg2 as If['comparison'];
  const basicValue = arg3 as number;
  return {
    value: value(target, name, multiplier),
    comparison,
    value2: value(basicValue),
  };
}

// returns a CardEffect.If that checks if a given player value is > 0
export function ifHas(target: Target, name: PlayerValueName): If {
  return {
    value: value(target, name),
    comparison: '>',
    value2: value(0),
  };
}

/**
 * Returns a ValueDescriptor with defaults
 * Usage:
 *   getValueDescriptor('opponent', 'bleed') // returns PlayerValueDescriptor
 *   getValueDescriptor(3) // returns BasicValueDescriptor
 */
export function value(
  target: Target,
  name: PlayerValueName,
  multiplier?: number,
): PlayerValueDescriptor;
export function value(value: number): BasicValueDescriptor;
export function value(
  valueOrTarget: number | Target,
  name?: PlayerValueName,
  multiplier?: number,
): ValueDescriptor {
  if (typeof valueOrTarget === 'number') {
    return { type: 'basicValue', value: Math.floor(valueOrTarget) };
  }
  assertIsNonNullable(name);
  return { type: 'playerValue', target: valueOrTarget, name, multiplier };
}
