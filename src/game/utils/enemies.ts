import { PlayerInfo } from '../gameState';
import { Random } from '../../utils/Random';
import { EnemyName, enemiesByName } from '../../content/enemies/enemies';

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
  const enemyNames = Object.keys(enemiesByName) as EnemyName[];
  return random.shuffle(enemyNames);
}

function getEnemyNamesForBattle(battleNumber: number) {
  return Object.keys(enemiesByName).filter((name) => {
    const enemy = enemiesByName[name as EnemyName];
    const [min, max] = enemy.battleRange;
    return battleNumber >= min && battleNumber <= max;
  }) as EnemyName[];
}
