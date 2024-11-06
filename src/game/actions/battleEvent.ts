import { Target } from '../gameState';

interface BattleEventShared {
  target: Target;
}
export interface SimpleBattleEvent extends BattleEventShared {
  type: 'miss' | 'shuffled' | 'startBattle';
}
export interface BattleEventWithValue extends BattleEventShared {
  type: 'damage' | 'heal';
  value: number;
}
export interface CardBattleEvent extends BattleEventShared {
  type: 'cardPlayed' | 'cardTrashed' | 'cardDiscarded' | 'temporaryCardAdded';
  cardId: number;
}
export type BattleEvent = SimpleBattleEvent | BattleEventWithValue | CardBattleEvent;

export function createStartBattleEvent(target: Target = 'self'): BattleEvent {
  return { type: 'startBattle', target };
}

export function createDamageEvent(value: number, target: Target): BattleEvent {
  return { type: 'damage', target, value };
}

export function createHealEvent(value: number, target: Target): BattleEvent {
  return { type: 'heal', target, value };
}

export function createMissEvent(target: Target): BattleEvent {
  return { type: 'miss', target };
}

export function createShuffleEvent(target: Target = 'self'): BattleEvent {
  return { type: 'shuffled', target };
}

export function createCardEvent(
  type: CardBattleEvent['type'],
  cardId: number,
  target: Target = 'self',
): BattleEvent {
  return { type, target, cardId };
}
