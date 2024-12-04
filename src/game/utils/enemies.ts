import min from 'lodash/min';
import range from 'lodash/range';

import { EnemyType, enemiesByType, EnemyInfo } from '../../content/enemies/enemies';
import { assert } from '../../utils/asserts';
import { Random } from '../../utils/Random';
import { MAX_WINS } from '../constants';
import { PlayerInfo } from '../gameState';

export function getEnemyInfo(enemyType: EnemyType, battleNumber: number): PlayerInfo {
  const enemyInfo = enemiesByType[enemyType] as EnemyInfo;
  return {
    ...enemyInfo,
    cards: enemyInfo.getCards(battleNumber),
    health: enemyInfo.getHealth(battleNumber),
    scale: enemyInfo.scale ?? 1,
  };
}

export function getEnemyOrder(random: Random) {
  assert(Object.keys(enemiesByType).length >= MAX_WINS, 'need at least one enemy per battle');

  // enemy order can fail since we're doing a very simple greedy algorithm, we could make the
  // greedy algorithm smarter but we want to ensure enemies are placed as randomly as possible
  for (let i = 0; i < 20; i++) {
    const { enemyOrder, success } = getEnemyOrderAndSuccess(random);
    if (success) return enemyOrder;
  }

  // Our greedy algorithm failed, so we return an enemy order that breaks the battle range
  // constraints. This should be extremely rare (~0.0001% chance)
  const { enemyOrder } = getEnemyOrderAndSuccess(random, { force: true });
  return enemyOrder;
}

// greedily pick enemies starting from the least available battle slot
function getEnemyOrderAndSuccess({ pick }: Random, { force = false }: { force?: boolean } = {}) {
  const enemyTypesBySlot = range(MAX_WINS).map(() => new Set<EnemyType>());
  for (const [enemyType, { battleRange }] of Object.entries(enemiesByType)) {
    const [min, max] = battleRange;
    for (let i = min; i <= max; i++) {
      enemyTypesBySlot[i].add(enemyType as EnemyType);
    }
  }

  const enemyOrder = new Array<EnemyType>(MAX_WINS);
  for (let i = 0; i < enemyOrder.length; i++) {
    const slot = pick(getLeastAvailableSlots(enemyTypesBySlot, enemyOrder));
    let enemy = pick([...enemyTypesBySlot[slot]]);

    if (!enemy) {
      if (!force) return { enemyOrder, success: false };

      // force any enemy into the available slot
      enemy = enemyTypesBySlot
        .find((enemies) => enemies.size > 0)!
        .values()
        .next().value!;
    }

    enemyOrder[slot] = enemy;
    removeEnemyFromSlots(enemyTypesBySlot, enemy);
  }

  return { enemyOrder, success: true };
}

function getLeastAvailableSlots(enemyTypesBySlots: Set<EnemyType>[], takenSlots: EnemyType[]) {
  const availableEnemyTypesBySlots = enemyTypesBySlots.filter((_, slot) => !takenSlots[slot]);
  const minSlotCount = min(availableEnemyTypesBySlots.map((enemies) => enemies.size));
  return enemyTypesBySlots.reduce((slots, enemies, slot) => {
    if (enemies.size === minSlotCount && !takenSlots[slot]) {
      slots.push(slot);
    }
    return slots;
  }, [] as number[]);
}

function removeEnemyFromSlots(enemyTypesBySlot: Set<EnemyType>[], enemy: EnemyType) {
  for (const enemies of enemyTypesBySlot) {
    enemies.delete(enemy);
  }
}
