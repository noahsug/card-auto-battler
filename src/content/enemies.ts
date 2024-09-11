import birthdayMonster from './images/characters/birthday-monster.png';
import blueRedMonster from './images/characters/blue-red-monster.png';
import fireMonster from './images/characters/fire-monster.png';
import greenMonster from './images/characters/green-monster.png';

export const allEnemies = {
  fireMonster: {
    name: 'Fire Monster',
    image: fireMonster,
  },
};

export type EnemyName = keyof typeof allEnemies;
