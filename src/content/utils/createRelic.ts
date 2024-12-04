import { RelicState } from '../../game/gameState';

// returns a RelicState with defaults
export function createRelic({
  type: name = '',
  name: displayName = '',
  description = '',
  value = 0,
  value2 = 0,
  image = '',
  tribe = 'basic',
}: Partial<RelicState> = {}): RelicState {
  return { type: name, name: displayName, description, value, value2, image, tribe };
}
