import birthdayMonster from './images/birthday-monster.png';
import blueRedMonster from './images/blue-red-monster.png';
import fireMonster from './images/fire-monster.png';
import greenMonster from './images/green-monster.png';

import warrior from '../heroes/images/warrior.png';

import { PlayerInfo } from '../../game/gameState';
import { cardsByName } from '../cards';

export const allEnemies = {
  fireMonster: {
    name: 'Fire Monster',
    image: fireMonster,
    cards: [cardsByName.attack],
  },
  // birthdayMonster: {
  //   name: 'Birthday Monster',
  //   image: birthdayMonster,
  // },
  // green
  // blueRed
  // shadow warrior
} satisfies Record<string, PlayerInfo>;

export type EnemyName = keyof typeof allEnemies;
