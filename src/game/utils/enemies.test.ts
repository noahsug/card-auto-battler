import range from 'lodash/range';

import { getEnemyOrder } from './enemies';
import { Random } from '../../utils/Random';
import { enemiesByType } from '../../content/enemies/enemies';
import { MAX_WINS } from '../constants';

it('gets an ordering of unique enemies', () => {
  const random = new Random();
  const enemyOrder = getEnemyOrder(random);

  expect(new Set(enemyOrder)).toHaveLength(MAX_WINS);

  expect(enemyOrder[enemyOrder.length - 1]).toBe('giantLizard');
  expect(['punchy', 'greenMonster']).toContain(enemyOrder[0]);

  for (let index = 0; index < MAX_WINS; index++) {
    const enemy = enemyOrder[index];
    const enemyInfo = enemiesByType[enemy];
    expect(enemyInfo).toBeDefined();

    const [min, max] = enemyInfo.battleRange;
    expect(index).toBeGreaterThanOrEqual(min);
    expect(index).toBeLessThanOrEqual(max);
  }
});

it('the enemy order is random', () => {
  const enemyOrders = range(100).map(() => getEnemyOrder(new Random()));
  const uniqueOrders = new Set(enemyOrders.map((order) => order.join(',')));
  expect(uniqueOrders.size).toBeGreaterThan(75);
});
