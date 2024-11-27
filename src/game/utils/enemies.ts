import { PlayerInfo } from '../gameState';
import { Random } from '../../utils/Random';
import { EnemyName, enemiesByName } from '../../content/enemies/enemies';
import { MAX_WINS } from '../constants';
import range from 'lodash/range';

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

export function getEnemyOrder({ pick }: Random) {
  const enemyNamesBySlots = range(MAX_WINS).map(() => new Set<EnemyName>());
  for (const [name, { battleRange }] of Object.entries(enemiesByName)) {
    const [min, max] = battleRange;
    for (let i = min; i <= max; i++) {
      enemyNamesBySlots[i].add(name as EnemyName);
    }
  }

  const enemyOrder = new Array<EnemyName>(MAX_WINS);
  for (let iterations = 0; iterations < MAX_WINS; iterations++) {
    const { slot, enemies } = getLeastUsedSlot(enemyNamesBySlots);
    const enemy = getMost;
  }
}

function getLeastUsedSlot(enemyNamesBySlots: Set<EnemyName>[]) {
  return enemyNamesBySlots.reduce(
    (min, enemies, slot) => {
      if (enemies.size < min.enemies.size) {
        return { slot, enemies: enemies };
      }
      return min;
    },
    { slot: -1, enemies: new Set<EnemyName>() },
  );
}

function getUnusedIndexes(battleRange: [number, number], enemyOrder: EnemyName[]) {
  const [min, max] = battleRange;
  return range(min, max + 1).filter((i) => !enemyOrder[i]);
}

// // sort from narrowest battle range to widest
// const entries = Object.entries(enemiesByName).sort(([, enemyA], [, enemyB]) => {
//   const [minA, maxA] = enemyA.battleRange;
//   const [minB, maxB] = enemyB.battleRange;
//   return maxA - minA - (maxB - minB);
// });
// const availableSlotsByEnemyName
// const enemyOrder = new Array<EnemyName>(MAX_WINS);
// entries.forEach(([name, { battleRange }]) => {
//   const index = pick(getUnusedIndexes(battleRange, enemyOrder));
//   console.log('pick', index, name);
//   enemyOrder[index] = name as EnemyName;
// });
// return enemyOrder;
