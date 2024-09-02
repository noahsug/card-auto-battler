import { assertIsNonNullable } from '../utils';
import {
  BasicValueDescriptor,
  CardEffect,
  CardState,
  MaybeValue,
  PlayerValueDescriptor,
  PlayerValueName,
  Target,
  ValueDescriptor,
} from './gameState';

export function createCard(
  effect: CardEffect,
  {
    repeat,
    name = '',
    effects,
  }: { repeat?: MaybeValue; name?: string; effects?: CardEffect[] } = {},
): CardState {
  return {
    effects: [effect].concat(effects || []),
    repeat,
    name,
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

export const DEAL_1_DAMAGE = createCard({
  name: 'damage',
  target: 'opponent',
  value: getValueDescriptor(1),
});
