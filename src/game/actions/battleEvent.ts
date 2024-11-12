import { Target } from '../gameState';

interface UntargetedBattleEvent {
  type: 'startBattle' | 'undo';
}
export interface BattleEventWithTarget {
  type: 'miss' | 'shuffle';
  target: Target;
}
export interface ValueBattleEvent {
  type: 'damage' | 'heal';
  target: Target;
  value: number;
}
export interface CardBattleEvent {
  type: 'playCard' | 'trashCard' | 'discardCard' | 'addTemporaryCard';
  target: Target;
  cardId: number;
}
export type BattleEvent =
  | UntargetedBattleEvent
  | BattleEventWithTarget
  | ValueBattleEvent
  | CardBattleEvent;

export function createBattleEvent(type: UntargetedBattleEvent['type']): BattleEvent;
export function createBattleEvent(
  type: BattleEventWithTarget['type'],
  target?: Target,
): BattleEvent;
export function createBattleEvent(
  type: ValueBattleEvent['type'],
  value: number,
  target: Target,
): BattleEvent;
export function createBattleEvent(
  type: CardBattleEvent['type'],
  cardId: number,
  target?: Target,
): BattleEvent;
export function createBattleEvent(
  type: BattleEvent['type'],
  valueOrTarget?: Target | number,
  target?: Target,
): BattleEvent {
  if (type === 'startBattle' || type === 'undo') {
    return { type };
  }
  if (type === 'miss' || type === 'shuffle') {
    target = valueOrTarget as Target;
    return { type, target: target || 'self' };
  }
  const value = valueOrTarget as number;
  if (type === 'damage' || type === 'heal') {
    return { type, value, target: target! };
  }
  return { type: type satisfies CardBattleEvent['type'], cardId: value, target: target || 'self' };
}

export function eventAppliesToTarget(event: BattleEvent, target: Target): boolean {
  if ('target' in event) {
    return event.target === target;
  }
  return true;
}
