import range from 'lodash/range';

import { PlayerInfo } from '../gameState';
import { Random } from '../../utils/Random';
import { EnemyName, enemiesByName } from '../../content/enemies/enemies';
import { MAX_WINS } from '../constants';

export function getEnemyInfo(enemyOrder: EnemyName[], battleNumber: number): PlayerInfo {
  const enemyName = enemyOrder[battleNumber];
  const enemyInfo = enemiesByName[enemyName];
  return {
    name: enemyInfo.name,
    image: enemyInfo.image,
    cards: enemyInfo.getCards(battleNumber),
    health: enemyInfo.getHealth(battleNumber),
  };
}

export function getEnemyOrder(random: Random) {
  // enemy order can fail since we're doing a very simple greedy algorithm, we could make the
  // greedy algorithm smarter but we want to ensure enemies are placed as randomly as possible
  for (let i = 0; i < 20; i++) {
    const { enemyOrder, success } = getEnemyOrderAndSuccess(random);
    if (success) return enemyOrder;
  }

  // our greedy algorithm failed, so we'll force the enemy order to be valid,
  // this should be extremely rare (~0.0001% chance)
  const { enemyOrder } = getEnemyOrderAndSuccess(random, { force: true });
  return enemyOrder;
}

function getEnemyOrderAndSuccess(
  { shuffle, pick }: Random,
  { force = false }: { force?: boolean } = {},
) {
  // sort from narrowest enemy battle range to widest
  const entries = shuffle(Object.entries(enemiesByName)).sort(([, enemyA], [, enemyB]) => {
    const [minA, maxA] = enemyA.battleRange;
    const [minB, maxB] = enemyB.battleRange;
    return maxA - minA - (maxB - minB);
  });

  let success = true;
  const enemyOrder = new Array<EnemyName>(MAX_WINS);
  assert(entries.length >= MAX_WINS, 'Expected number of enemies to be >= MAX_WINS');

  for (const [name, { battleRange }] of entries) {
    let index = pick(getAvailableIndexes(battleRange, enemyOrder));
    if (index === undefined) {
      if (force) {
        // force the enemy into any available index
        index = pick(getAvailableIndexes([0, enemyOrder.length - 1], enemyOrder));
      } else {
        success = false;
      }
    }
    enemyOrder[index] = name as EnemyName;
  }
  return { enemyOrder, success };
}

function getAvailableIndexes(battleRange: [number, number], enemyOrder: EnemyName[]) {
  const [min, max] = battleRange;
  return range(min, max + 1).filter((i) => !enemyOrder[i]);
}
