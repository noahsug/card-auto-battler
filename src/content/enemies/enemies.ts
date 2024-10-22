import birthdayMonster from './images/birthday-monster.png';
import blueRedMonster from './images/blue-red-monster.png';
import fireMonster from './images/fire-monster.png';
import greenMonster from './images/green-monster.png';

import warrior from '../heroes/images/warrior.png';

export const allEnemies = {
  fireMonster: {
    name: 'Fire Monster',
    image: fireMonster,
    cards: [],
  },
  // birthdayMonster: {
  //   name: 'Birthday Monster',
  //   image: birthdayMonster,
  // },
  // green
  // blueRed
  // shadow warrior
};

export type EnemyName = keyof typeof allEnemies;
