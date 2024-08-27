import { StatusEffectName, Target, IdentifiablePlayerValue, statusEffectNames } from '../gameState';
import { PlayerState, AnimationEvent } from '../../gameState';
import { assert, readonlyIncludes } from '../../utils';

export type CardEffectName = StatusEffectName | 'damage' | 'heal' | 'trash';

interface CompareToPlayerValue {
  type: Target;
  name: IdentifiablePlayerValue;
}

export interface CompareToValue {
  type: 'value';
  value: number;
}

interface If {
  type: Target;
  playerValue: IdentifiablePlayerValue;
  comparison: '>' | '<' | '=' | '<=' | '>=';
  compareTo: CompareToPlayerValue | CompareToValue;
}

export interface CardEffect {
  target: Target;
  name: CardEffectName;
  value: number;
  multiHit?: number;
  multiplyBy?: {
    type: Target;
    name: IdentifiablePlayerValue;
  };
  if?: If;
}

export interface CardState {
  effects: CardEffect[];
}

export interface PlayCardContext {
  self: PlayerState;
  opponent: PlayerState;
  events: AnimationEvent[];
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

function applyCardEffect(effect: CardEffect, context: PlayCardContext) {
  switch (effect.name) {
    case 'damage':
      const dodgedDamage = dodgeDamage(effect, context);
      if (!dodgedDamage) {
        dealDamage(effect.value, effect.target, context);
      }
      return;

    case 'heal':
      applyHeal(effect.value, effect.target, context);
      return;

    case 'trash':
      trashCards(effect.value, effect.target, context);
      return;

    // status effects
    default:
      assert(readonlyIncludes(statusEffectNames, effect.name));
      context[effect.target][effect.name] += effect.value;
      return;
  }
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
