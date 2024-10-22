import { RelicEffect, RelicState } from '../../game/gameState';
import { value } from './createCard';

type EffectBuilder = Partial<Omit<RelicEffect, 'name'>> & Pick<RelicEffect, 'name'>;

// returns a RelicEffect with defaults
export function getEffect(partialEffect: EffectBuilder): RelicEffect {
  return Object.assign({ target: 'self', value: value(1) }, partialEffect);
}

// returns a RelicState with defaults
export function createRelic(
  effect: EffectBuilder,
  { name = '', description = '', image = '' }: Partial<Omit<RelicState, 'effect'>> = {},
): RelicState {
  return { effect: getEffect(effect), name, description, image };
}
