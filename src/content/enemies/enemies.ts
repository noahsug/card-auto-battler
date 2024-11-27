import fireMonster from './images/fire-monster.png';

import { cardsByName } from '../cards';

export const enemiesByName = {
  fireMonster: {
    name: 'Fire Monster',
    image: fireMonster,
    battleRange: [0, 8],
    getCards: (battleNumber: number) => [
      cardsByName.attack,
      cardsByName.attack,
      cardsByName.attack,
    ],
    getHealth: (battleNumber: number) => 10 + battleNumber * 2,
  },
};

export type EnemyName = keyof typeof enemiesByName;
