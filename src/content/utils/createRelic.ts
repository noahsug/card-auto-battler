import { RelicEffect, RelicState } from '../../game/gameState';

type EffectBuilder = Partial<Omit<RelicEffect, 'statusEffectName'>> &
  Pick<RelicEffect, 'statusEffectName'>;

// returns a RelicEffect with defaults
export function getEffect(partialEffect: EffectBuilder): RelicEffect {
  partialEffect.target = partialEffect.target || 'self';
  partialEffect.value = partialEffect.value || 1;
  return partialEffect as RelicEffect;
}

// returns a RelicState with defaults
export function createRelic(
  effect: EffectBuilder,
  {
    name = '',
    description = '',
    image = '',
    tribe: color = '',
  }: Partial<Omit<RelicState, 'effect'>> = {},
): RelicState {
  return { effect: getEffect(effect), name, description, image, tribe: color };
}
