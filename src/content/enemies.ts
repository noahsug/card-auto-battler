import birthdayMonster from './images/characters/birthday-monster.png';
import blueRedMonster from './images/characters/blue-red-monster.png';
import fireMonster from './images/characters/fire-monster.png';
import greenMonster from './images/characters/green-monster.png';
import warrior from './images/characters/warrior.png';

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
  // warrior
};

export type EnemyName = keyof typeof allEnemies;
