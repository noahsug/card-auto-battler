import { BLEED_DAMAGE } from '../constants';
import {
  CardEffect,
  CardState,
  GameState,
  If,
  MaybeValue,
  PlayerState,
  PlayerValueDescriptor,
  StatusEffectType,
  Target,
  Tribe,
  ValueDescriptor,
} from '../gameState';
import {
  getActivePlayer,
  getNonActivePlayer,
  getPlayers,
  getRandom,
  getRelic,
  getTargetedPlayer,
} from '../utils/selectors';
import { BattleEvent, BattleEventSource, createBattleEvent, ValueBattleEvent } from './battleEvent';

interface PlayCardContext {
  game: GameState;
  events: BattleEvent[];
  card: CardState;
}

interface EffectOptions {
  value: number;
  target: Target;
  multiplier?: number;
}

export function applyCardEffects(game: GameState, card: CardState): BattleEvent[] {
  const events: BattleEvent[] = [];
  const context: PlayCardContext = { game, events, card };

  let activations = 1;
  activations += maybeGetValue(card.repeat, context) || 0;

  for (let i = 0; i < activations; i++) {
    card.effects.forEach((effect) => {
      applyEffect(effect, context);
    });
  }

  return events;
}

function applyEffect(effect: CardEffect, context: PlayCardContext, multiHitsLeft?: number) {
  if (effect.if) {
    const success = evaluateIf(effect.if, context);
    if (!success) return;
  }

  if (effect.multiHit && multiHitsLeft == null) {
    multiHitsLeft = getValue(effect.multiHit, context) - 1;
    if (multiHitsLeft < 0) return;
  }

  let value = getValue(effect.value, context);
  value += maybeGetValue(effect.add, context) || 0;

  const multiplier = maybeGetValue(effect.multiply, context) || 1;
  const effectOptions = { value, multiplier, target: effect.target };
  const player = getTargetedPlayer(context.game, effect.target);

  value *= multiplier;

  switch (effect.type) {
    case 'damage': {
      if (effect.target === 'opponent') {
        dealCardDamage(effectOptions, context);
      } else {
        dealSelfDamage(effectOptions, context);
      }
      break;
    }

    case 'heal': {
      const healEvent = applyHeal(effectOptions, context);
      healEvent.source = 'card';
      break;
    }

    case 'trash':
      trashCards(effectOptions, context);
      break;

    case 'set': {
      player[effect.valueType] = maybeFloorValue(value, effect.valueType);
      break;
    }

    default: {
      // status effects
      player[effect.type] += maybeFloorValue(value, effect.type);
    }
  }

  if (multiHitsLeft) {
    applyEffect(effect, context, multiHitsLeft - 1);
  }
}

function evaluateIf(ifStatement: If, context: PlayCardContext) {
  const value1 = getValue(ifStatement.value, context);
  const value2 = getValue(ifStatement.value2, context);
  return compareValues(value1, ifStatement.comparison, value2);
}

function maybeGetValue(maybeValue: MaybeValue | undefined, context: PlayCardContext) {
  if (!maybeValue) return undefined;

  const { value, if: ifStatement } = maybeValue;
  if (ifStatement) {
    const success = evaluateIf(ifStatement, context);
    if (!success) return undefined;
  }
  return getValue(value, context);
}

function getValue(descriptor: ValueDescriptor, context: PlayCardContext): number {
  switch (descriptor.type) {
    case 'basicValue':
      return descriptor.value;

    case 'playerValue': {
      const multiplier = descriptor.multiplier ?? 1;
      return getPlayerValue(descriptor, context) * multiplier;
    }
  }
}

function calculateTribePercent(player: PlayerState, tribe: Tribe): number {
  return player.cards.filter((card) => card.tribe === tribe).length / player.cards.length;
}

function getPlayerValue(
  { target, valueType }: PlayerValueDescriptor,
  { game, events }: PlayCardContext,
): number {
  const player = getTargetedPlayer(game, target);

  if (valueType === 'turn') {
    return Math.floor(game.turn / 2);
  }

  if (valueType === 'cardDamageDealtToTarget') {
    return getDamageDealt(events, target, 'card');
  }

  if (valueType === 'percentGreen') {
    return calculateTribePercent(player, 'green');
  }
  if (valueType === 'percentRed') {
    return calculateTribePercent(player, 'red');
  }
  if (valueType === 'percentPurple') {
    return calculateTribePercent(player, 'purple');
  }

  const previousCardTribe = player.previousCard?.tribe;
  if (valueType === 'prevCardIsGreen') {
    return previousCardTribe === 'green' ? 1 : 0;
  }
  if (valueType === 'prevCardIsRed') {
    return previousCardTribe === 'red' ? 1 : 0;
  }
  if (valueType === 'prevCardIsPurple') {
    return previousCardTribe === 'purple' ? 1 : 0;
  }

  const value = player[valueType];
  // e.g. number of relics
  if (Array.isArray(value)) {
    return value.length;
  }
  return value;
}

function compareValues(value1: number, comparison: If['comparison'], value2: number) {
  if (comparison === '>') return value1 > value2;
  if (comparison === '<') return value1 < value2;
  if (comparison === '=') return value1 === value2;
  if (comparison === '>=') return value1 >= value2;
  if (comparison === '<=') return value1 <= value2;

  throw new Error(`invalid comparison: ${comparison}`);
}

function dealSelfDamage({ value, multiplier = 1 }: EffectOptions, context: PlayCardContext) {
  value = Math.floor(value * multiplier);
  reduceHealth({ value, target: 'self' }, context);
}

function dealCardDamage({ value, multiplier = 1 }: EffectOptions, context: PlayCardContext) {
  // crit is consumed even when the attack is dodged
  const isCrit = consumeCrit(context);

  // dodge
  if (dodgeDamage(context)) return;

  const [self, opponent] = getPlayers(context.game);
  const { card } = context;

  // strength
  value += getStrength(context);

  if (isCrit) {
    // crit
    multiplier *= 2;

    // shockOnCrit
    const shockOnCrit = getRelic(self, 'shockOnCrit');
    if (shockOnCrit) {
      opponent.shock += shockOnCrit.value;
    }
  }

  value = Math.floor(value * multiplier);

  if (value > 0) {
    // lifesteal
    const relicLifesteal = getRelic(self, 'lifesteal')?.value || 0;
    const cardLifesteal = maybeGetValue(card.lifesteal, context) || 0;
    const burnLifesteal = self.burn > 0 ? self.lifestealWhenBurning : 0;
    const lifesteal = self.lifesteal + cardLifesteal + burnLifesteal + relicLifesteal;
    if (lifesteal > 0) {
      applyHeal({ value: lifesteal * value, target: 'self' }, context);
    }

    // shock
    if (opponent.shock > 0) {
      opponent.shock += 1;
    }

    // thickSkin
    if (opponent.thickSkin > 0) {
      if (value <= opponent.thickSkin) {
        value = 1;
      }
      opponent.thickSkin -= 1;
    }
  }

  const damageEvent = reduceHealth({ value, target: 'opponent' }, context);
  damageEvent.source = 'card';
  damageEvent.isCrit = isCrit;

  if (value > 0) {
    // regenForHighDamage
    const regenForHighDamage = getRelic(self, 'regenForHighDamage');
    if (regenForHighDamage && value >= regenForHighDamage.value) {
      self.regen += regenForHighDamage.value2;
    }

    // bleed
    if (opponent.bleed > 0) {
      reduceHealth({ value: BLEED_DAMAGE, target: 'opponent' }, context);
      opponent.bleed -= 1;
    }
  }
}

function getStrength(context: PlayCardContext) {
  const self = getActivePlayer(context.game);

  let strength = self.strength + self.temporaryStrength;

  // strengthWithDodge
  const strengthWithDodge = getRelic(self, 'strengthWithDodge');
  if (strengthWithDodge && self.dodge > 0) {
    strength += strengthWithDodge.value;
  }

  return strength;
}

function dodgeDamage({ game, events }: PlayCardContext) {
  const opponent = getNonActivePlayer(game);

  // temporaryDodge
  if (opponent.temporaryDodge > 0) {
    opponent.temporaryDodge -= 1;
  } else if (opponent.dodge > 0) {
    opponent.dodge -= 1;
  } else {
    return false; // did not dodge
  }

  events.push(createBattleEvent('miss', 'opponent'));
  return true;
}

function consumeCrit(context: PlayCardContext) {
  const self = getActivePlayer(context.game);
  const { card, game } = context;
  const { random } = getRandom(game);

  // critChance
  const critChance = getRelic(self, 'critChance');
  if (critChance && random() < critChance.value) {
    return true;
  }

  // temporaryFireCrit
  if (self.temporaryFireCrit > 0 && card.name.toLocaleLowerCase().includes('fire')) {
    self.temporaryFireCrit -= 1;
    return true;
  }

  // crit
  if (self.crit > 0) {
    self.crit -= 1;
    return true;
  }

  return false;
}

export function reduceHealth(
  { value, multiplier = 1, target }: EffectOptions,
  context: PlayCardContext,
) {
  const { game, events } = context;
  const targetPlayer = getTargetedPlayer(game, target);
  value = Math.floor(value * multiplier);

  if (target === 'self' && value > 0) {
    // strengthOnSelfDamage
    const strengthOnSelfDamage = getRelic(targetPlayer, 'strengthOnSelfDamage');
    if (strengthOnSelfDamage) {
      targetPlayer.strength += strengthOnSelfDamage.value;
    }

    // sharedPain
    const sharedPain = getRelic(targetPlayer, 'sharedPain');
    if (sharedPain) {
      reduceHealth({ value: value * sharedPain.value, target: 'opponent' }, context);
    }
  }

  targetPlayer.health -= value;
  const damageEvent = createBattleEvent('damage', value, target) as ValueBattleEvent;
  events.push(damageEvent);
  return damageEvent;
}

export function applyHeal(
  { value, multiplier = 1, target }: EffectOptions,
  context: PlayCardContext,
) {
  const { game, events } = context;
  const targetPlayer = getTargetedPlayer(game, target);

  // strengthAffectsHealing
  const strengthAffectsHealing = getRelic(targetPlayer, 'strengthAffectsHealing');
  if (strengthAffectsHealing) {
    value += getStrength(context);
  }

  value = Math.floor(value * multiplier);
  targetPlayer.health += value;

  const event = createBattleEvent('heal', value, target);
  events.push(event);
  return event as ValueBattleEvent;
}

function trashCards({ value, multiplier = 1, target }: EffectOptions, context: PlayCardContext) {
  // value = updateValue(value, multiplier);
  // if (value <= 0) return;
  // const player = context[target];
  // const isActivePlayer = target === 'self';
  // trashNextCards({ player, isActivePlayer, numCardsToTrash: value });
}

function maybeFloorValue(value: number, valueType: string) {
  if (valueType === 'lifesteal' || valueType === 'lifestealWhenBurning') {
    valueType satisfies StatusEffectType;
    // these values use % so don't round them
    return value;
  }
  return Math.floor(value);
}

export function getDamageDealt(
  events: BattleEvent[],
  target: Target | null = 'opponent',
  source?: BattleEventSource,
): number {
  return events.reduce((damageDealt, event) => {
    if (event.type !== 'damage') return damageDealt;
    if (target && event.target !== target) return damageDealt;
    if (source && event.source !== source) return damageDealt;
    return damageDealt + event.value;
  }, 0);
}
