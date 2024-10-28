import { Target } from '../gameState';

interface BattleEventShared {
  target: Target;
  source: 'card' | 'startOfTurn';
}
export interface MissBattleEvent extends BattleEventShared {
  type: 'miss';
}
export interface BattleEventWithValue extends BattleEventShared {
  type: 'damage' | 'heal';
  value: number;
}
export type BattleEvent = MissBattleEvent | BattleEventWithValue;

export function createDamageEvent(
  value: number,
  target: Target,
  source: BattleEvent['source'] = 'card',
): BattleEvent {
  return { type: 'damage', target, value, source };
}

export function createHealEvent(
  value: number,
  target: Target,
  source: BattleEvent['source'] = 'card',
): BattleEvent {
  return { type: 'heal', target, value, source };
}

export function createMissEvent(
  target: Target,
  source: BattleEvent['source'] = 'card',
): BattleEvent {
  return { type: 'miss', target, source };
}
