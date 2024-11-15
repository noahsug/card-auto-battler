import { Target } from '../gameState';

export type BattleEventSource = 'card' | 'other';

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
  source: BattleEventSource;
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
  source?: BattleEventSource,
): BattleEvent;
export function createBattleEvent(
  type: CardBattleEvent['type'],
  cardId: number,
  target?: Target,
): BattleEvent;
export function createBattleEvent(type: BattleEvent['type'], ...args: unknown[]): BattleEvent {
  if (type === 'startBattle' || type === 'undo') {
    return { type };
  }
  if (type === 'miss' || type === 'shuffle') {
    const [target] = args as [Target?];
    return { type, target: target || 'self' };
  }
  if (type === 'damage' || type === 'heal') {
    const [value, target, source = 'other'] = args as [number, Target, BattleEventSource?];
    return { type, value, target, source };
  }
  const [cardId, target = 'self'] = args as [number, Target?];
  return { type: type satisfies CardBattleEvent['type'], cardId, target };
}

export function eventAppliesToTarget(event: BattleEvent, target: Target): boolean {
  if ('target' in event) {
    return event.target === target;
  }
  return true;
}
