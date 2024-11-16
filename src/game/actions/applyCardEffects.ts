import { BLEED_DAMAGE, MAX_SHOCK } from '../constants';
import {
  CardEffect,
  CardState,
  GameState,
  If,
  MaybeValue,
  PlayerState,
  PlayerValueDescriptor,
  Target,
  Tribe,
  ValueDescriptor,
} from '../gameState';
import { getActivePlayer, getPlayers, getRelic, getTargetedPlayer } from '../utils/selectors';
import { BattleEvent, createBattleEvent, BattleEventSource, ValueBattleEvent } from './battleEvent';

interface PlayCardContext {
  game: GameState;
  events: BattleEvent[];
  card: CardState;
  // rue when a card would deal damage, even if it was dodged
  cardDealsDamage?: boolean;
}

interface EffectOptions {
  value: number;
  target: Target;
  multiplier?: number;
}

export function applyCardEffects(game: GameState, card: CardState): BattleEvent[] {
  const activePlayer = getActivePlayer(game);

  const events: BattleEvent[] = [];
  const context: PlayCardContext = { game, events, card };

  let activations = 1;
  activations += maybeGetValue(card.repeat, context) || 0;

  for (let i = 0; i < activations; i++) {
    card.effects.forEach((effect) => {
      applyEffect(effect, context);
    });
  }

  // TODO: replace with booleans when certain effects are applied, e.g. if a card applies this
  // affect after it deals damage, we should not remove the effect
  if (context.cardDealsDamage) {
    if (activePlayer.crit > 0) {
      activePlayer.crit -= 1;
    }

    if (activePlayer.temporaryFireCrit > 0 && card.name.toLocaleLowerCase().includes('fire')) {
      activePlayer.temporaryFireCrit -= 1;
    }
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

  switch (effect.name) {
    case 'damage': {
      context.cardDealsDamage = true;
      const dodged = dodgeDamage(effect, context);
      if (!dodged) {
        dealCardDamage(effectOptions, context);
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
      player[effect.valueName] = maybeFloorValue(value, effect.valueName);
      break;
    }

    default: {
      // status effects
      player[effect.name] += maybeFloorValue(value, effect.name);
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
  { target, name }: PlayerValueDescriptor,
  { game, events }: PlayCardContext,
): number {
  const player = getTargetedPlayer(game, target);

  if (name === 'turn') {
    return Math.floor(game.turn / 2);
  }

  if (name === 'cardDamageDealtToTarget') {
    return getDamageDealt(events, target, 'card');
  }

  if (name === 'percentGreen') {
    return calculateTribePercent(player, 'green');
  }
  if (name === 'percentRed') {
    return calculateTribePercent(player, 'red');
  }
  if (name === 'percentPurple') {
    return calculateTribePercent(player, 'purple');
  }

  const previousCardTribe = player.previousCard?.tribe;
  if (name === 'prevCardIsGreen') {
    return previousCardTribe === 'green' ? 1 : 0;
  }
  if (name === 'prevCardIsRed') {
    return previousCardTribe === 'red' ? 1 : 0;
  }
  if (name === 'prevCardIsPurple') {
    return previousCardTribe === 'purple' ? 1 : 0;
  }

  const value = player[name];
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

function dodgeDamage(effect: CardEffect, { game, events }: PlayCardContext) {
  // dodge doesn't apply to self damage
  if (effect.target === 'self') return false;

  const player = getTargetedPlayer(game, effect.target);

  // temporaryDodge
  if (player.temporaryDodge > 0) {
    player.temporaryDodge -= 1;
  } else if (player.dodge > 0) {
    player.dodge -= 1;
  } else {
    return false; // did not dodge
  }

  events.push(createBattleEvent('miss', effect.target));
  return true;
}

function dealCardDamage(
  { value, multiplier = 1, target }: EffectOptions,
  context: PlayCardContext,
) {
  const [self, opponent] = getPlayers(context.game);
  const targetPlayer = getTargetedPlayer(context.game, target);
  const { card } = context;

  // strength
  if (target === 'opponent') {
    value += self.strength + self.temporaryStrength;

    // strengthWithDodge
    const strengthWithDodge = getRelic(self, 'strengthWithDodge');
    if (strengthWithDodge && self.dodge > 0) {
      value += strengthWithDodge.value;
    }
  }

  const isCrit = getIsCrit(context);
  if (isCrit) {
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
    if (targetPlayer.shock > 0) {
      targetPlayer.shock += 1;
      if (targetPlayer.shock >= MAX_SHOCK) {
        targetPlayer.shock -= MAX_SHOCK;
        targetPlayer.stun = 1;
      }
    }
  }

  const damageEvent = reduceHealth({ value, target }, context);
  damageEvent.source = 'card';

  // regenForHighDamage
  const regenForHighDamage = getRelic(self, 'regenForHighDamage');
  if (regenForHighDamage && value >= regenForHighDamage.value) {
    self.regen += regenForHighDamage.value2;
  }

  // bleed
  if (value > 0 && target === 'opponent' && opponent.bleed > 0) {
    reduceHealth({ value: BLEED_DAMAGE, target }, context);
    opponent.bleed -= 1;
  }
}

function getIsCrit(context: PlayCardContext) {
  const self = getActivePlayer(context.game);
  const { card } = context;

  // temporaryFireCrit
  if (self.temporaryFireCrit > 0 && card.name.toLocaleLowerCase().includes('fire')) {
    return true;
  }

  // crit
  if (self.crit > 0) {
    return true;
  }

  // critChance
  const critChance = getRelic(self, 'critChance');
  if (critChance && Math.random() < critChance.value) {
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

  // reduceLowDamage
  const reduceLowDamage = getRelic(targetPlayer, 'reduceLowDamage');
  if (reduceLowDamage && value <= reduceLowDamage.value && value > reduceLowDamage.value2) {
    value = reduceLowDamage.value2;
  }

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
  const event = createBattleEvent('damage', value, target);
  events.push(event);
  return event as ValueBattleEvent;
}

export function applyHeal(
  { value, multiplier = 1, target }: EffectOptions,
  { game, events }: PlayCardContext,
) {
  const targetPlayer = getTargetedPlayer(game, target);

  // strengthAffectsHealing
  const strengthAffectsHealing = getRelic(targetPlayer, 'strengthAffectsHealing');
  if (strengthAffectsHealing) {
    value += targetPlayer.strength;
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

function maybeFloorValue(value: number, name: keyof PlayerState) {
  if (name === 'lifesteal' || name === 'lifestealWhenBurning') {
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
