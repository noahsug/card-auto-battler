import { getEnemyOrder } from './enemies';
import { Random } from '../../utils/Random';
import { enemiesByName } from '../../content/enemies/enemies';
import { MAX_WINS } from '../constants';

it('gets a random ordering of unique enemies', () => {
  const random = new Random();
  const enemyOrder = getEnemyOrder(random);

  console.log(enemyOrder);

  expect(new Set(enemyOrder)).toHaveLength(MAX_WINS);

  expect(enemyOrder[enemyOrder.length - 1]).toBe('giantLizard');
  expect(['punchy', 'greenMonster']).toContain(enemyOrder[0]);

  for (let index = 0; index < MAX_WINS; index++) {
    const enemy = enemyOrder[index];
    const enemyInfo = enemiesByName[enemy];
    expect(enemyInfo).toBeDefined();

    const [min, max] = enemyInfo.battleRange;
    expect(index).toBeGreaterThanOrEqual(min);
    expect(index).toBeLessThanOrEqual(max);
  }
});
