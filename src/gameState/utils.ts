import { assertIsNonNullable } from '../utils';
import {
  BasicValueDescriptor,
  CardEffect,
  CardState,
  If,
  MaybeValue,
  PlayerValueDescriptor,
  PlayerValueName,
  Target,
  ValueDescriptor,
} from './gameState';

export function getEffect(partialEffect: Partial<CardEffect> = {}) {
  return Object.assign(
    { target: 'opponent', name: 'damage', value: getValueDescriptor(1) },
    partialEffect,
  );
}

export function createCard(
  effect: Partial<CardEffect> = {},
  {
    repeat,
    name = '',
    effects,
  }: { repeat?: MaybeValue; name?: string; effects?: Partial<CardEffect>[] } = {},
): CardState {
  return {
    effects: [effect].concat(effects || []).map(getEffect),
    repeat,
    name,
  };
}

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
    value: getValueDescriptor(target, name, multiplier),
    comparison,
    value2: getValueDescriptor(basicValue),
  };
}

export function ifHas(target: Target, name: PlayerValueName): If {
  return {
    value: getValueDescriptor(target, name),
    comparison: '>',
    value2: getValueDescriptor(0),
  };
}

/**
 * Usage:
 *   getValueDescriptor('opponent', 'bleed')
 *   getValueDescriptor(3)
 */
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
    return { type: 'basicValue', value: Math.floor(valueOrTarget) };
  }
  assertIsNonNullable(name);
  return { type: 'playerValue', target: valueOrTarget, name, multiplier };
}
