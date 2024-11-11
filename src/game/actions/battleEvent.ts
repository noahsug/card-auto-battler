import { Target } from '../gameState';

interface BattleEventShared {
  target: Target;
}
export interface SimpleBattleEvent extends BattleEventShared {
  type: 'miss' | 'shuffle' | 'startBattle' | 'undo';
}
export interface BattleEventWithValue extends BattleEventShared {
  type: 'damage' | 'heal';
  value: number;
}
export interface CardBattleEvent extends BattleEventShared {
  type: 'playCard' | 'trashCard' | 'discardCard' | 'addTemporaryCard';
  cardId: number;
}
export type BattleEvent = SimpleBattleEvent | BattleEventWithValue | CardBattleEvent;

export function createBattleEvent(
  type: SimpleBattleEvent['type'],
  target: Target = 'self',
): BattleEvent {
  return { type, target };
}

export function createDamageEvent(value: number, target: Target): BattleEvent {
  return { type: 'damage', target, value };
}

export function createHealEvent(value: number, target: Target): BattleEvent {
  return { type: 'heal', target, value };
}

export function createCardEvent(
  type: CardBattleEvent['type'],
  cardId: number,
  target: Target = 'self',
): BattleEvent {
  return { type, target, cardId };
}
