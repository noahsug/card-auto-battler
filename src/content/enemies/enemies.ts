import range from 'lodash/range';

import armoredLizardImage from './images/armored-lizard.png';
import blueRedMonsterImage from './images/blue-red-monster.png';
import coolBirdImage from './images/cool-bird.png';
import fireMonsterImage from './images/fire-monster.png';
import frostLizardImage from './images/frost-lizard.png';
import giantLizardImage from './images/giant-lizard.png';
import greenMonsterImage from './images/green-monster.png';
import grumpyRockImage from './images/grumpy-rock.png';
import punchyImage from './images/punchy.png';
import treeMonsterImage from './images/tree-monster.png';

import { cardsByName } from '../cards';
import { CardState } from '../../game/gameState';
import { MAX_WINS } from '../../game/constants';

interface EnemyInfo {
  name: string;
  image: string;
  battleRange: [number, number];
  getCards: (battleNumber: number) => CardState[];
  getHealth: (battleNumber: number) => number;
}

function basicAttacks(battleNumber: number) {
  return range(0, battleNumber + 1).map(() => cardsByName.attack);
}

function scalingHealth(battleNumber: number) {
  // return 20 + battleNumber * 10;
  return 2 + battleNumber;
}

const third = Math.floor(MAX_WINS / 3) - 1;
const middle = Math.floor(MAX_WINS / 2) - 1;
const twoThirds = Math.floor((2 * MAX_WINS) / 3) - 1;
const end = MAX_WINS - 2;

export const enemiesByName: Record<string, EnemyInfo> = {
  greenMonster: {
    name: 'Green Monster',
    image: greenMonsterImage,
    battleRange: [0, 2],
    getCards: basicAttacks,
    getHealth: scalingHealth,
  },
  punchy: {
    name: 'Punchy',
    image: punchyImage,
    battleRange: [0, 2],
    getCards: basicAttacks,
    getHealth: scalingHealth,
  },
  armoredLizard: {
    name: 'Armored Lizard',
    image: armoredLizardImage,
    battleRange: [1, twoThirds],
    getCards: basicAttacks,
    getHealth: scalingHealth,
  },
  coolBird: {
    name: 'Cool Bird',
    image: coolBirdImage,
    battleRange: [1, twoThirds],
    getCards: basicAttacks,
    getHealth: scalingHealth,
  },
  fireMonster: {
    name: 'Fire Monster',
    image: fireMonsterImage,
    battleRange: [1, end],
    getCards: basicAttacks,
    getHealth: scalingHealth,
  },
  frostLizard: {
    name: 'Frost Lizard',
    image: frostLizardImage,
    battleRange: [third, end],
    getCards: basicAttacks,
    getHealth: scalingHealth,
  },
  grumpyRock: {
    name: 'Grumpy Rock',
    image: grumpyRockImage,
    battleRange: [third, end],
    getCards: basicAttacks,
    getHealth: scalingHealth,
  },
  treeMonster: {
    name: 'Tree Monster',
    image: treeMonsterImage,
    battleRange: [middle, end],
    getCards: basicAttacks,
    getHealth: scalingHealth,
  },
  blueRedMonster: {
    name: 'Blue Red Monster',
    image: blueRedMonsterImage,
    battleRange: [twoThirds, end],
    getCards: basicAttacks,
    getHealth: scalingHealth,
  },
  giantLizard: {
    name: 'Giant Lizard',
    image: giantLizardImage,
    battleRange: [MAX_WINS - 1, MAX_WINS - 1],
    getCards: basicAttacks,
    getHealth: scalingHealth,
  },
};

export type EnemyName = keyof typeof enemiesByName;
