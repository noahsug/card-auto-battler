import { Target } from '../gameState';

interface BattleEventShared {
  target: Target;
  // TODO: remove, instead look at when the card is played
  source: 'card' | 'startOfTurn';
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
  return { type: 'startBattle', target, source: 'card' };
}

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

export function createShuffleEvent(target: Target = 'self'): BattleEvent {
  return { type: 'shuffled', target, source: 'card' };
}

export function createCardEvent(
  type: CardBattleEvent['type'],
  cardId: number,
  target: Target = 'self',
): BattleEvent {
  return { type, target, cardId, source: 'card' };
}
