import { BLEED_DAMAGE } from '../constants';
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
import { BattleEvent, createBattleEvent } from './battleEvent';

interface PlayCardContext {
  game: GameState;
  events: BattleEvent[];
  card: CardState;
  reduceChannelStatusEffect?: boolean;
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

  // we reduce the status effect only after all card effects have been applied
  if (context.reduceChannelStatusEffect) {
    getActivePlayer(game).channel -= 1;
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
      const dodged = dodgeDamage(effect, context);
      if (!dodged) {
        dealDamage(effectOptions, context);
      }
      break;
    }

    case 'heal':
      applyHeal(effectOptions, context);
      break;

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

  if (name === 'damageDealtToTarget') {
    return getDamageDealt(events, target);
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

  if (player.dodge <= 0) return false;

  player.dodge -= 1;
  events.push(createBattleEvent('miss', effect.target));
  return true;
}

function dealDamage({ value, multiplier = 1, target }: EffectOptions, context: PlayCardContext) {
  const [self, opponent] = getPlayers(context.game);
  const { card } = context;

  // strength
  if (target === 'opponent') {
    value += self.strength;
  }

  // channel
  if (self.channel > 0 && card.name.toLocaleLowerCase().includes('fire')) {
    multiplier *= 2;
    context.reduceChannelStatusEffect = true;
  }

  value = Math.floor(value * multiplier);
  reduceHealth({ value, target }, context);

  // regenForHighDamage
  const regenForHighDamage = getRelic(self, 'regenForHighDamage');
  if (regenForHighDamage && value >= regenForHighDamage.value) {
    self.regen += regenForHighDamage.value2;
  }

  // lifesteal
  const relicLifesteal = getRelic(self, 'lifesteal')?.value || 0;
  const cardLifesteal = maybeGetValue(card.lifesteal, context) || 0;
  const burnLifesteal = self.burn > 0 ? self.lifestealWhenBurning : 0;
  const lifesteal = self.lifesteal + cardLifesteal + burnLifesteal + relicLifesteal;
  if (value > 0 && lifesteal > 0) {
    applyHeal({ value: lifesteal * value, target: 'self' }, context);
  }

  // bleed
  if (value > 0 && target === 'opponent' && opponent.bleed > 0) {
    reduceHealth({ value: BLEED_DAMAGE, target }, context);
    opponent.bleed -= 1;
  }
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
  events.push(createBattleEvent('damage', value, target));
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
  events.push(createBattleEvent('heal', value, target));
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

export function getDamageDealt(events: BattleEvent[], target: Target = 'opponent'): number {
  return events.reduce((damageDealt, event) => {
    if (event.type === 'damage' && event.target === target) {
      damageDealt += event.value;
    }
    return damageDealt;
  }, 0);
}
