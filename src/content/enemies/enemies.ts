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
import { CardState, PlayerState } from '../../game/gameState';
import { MAX_WINS } from '../../game/constants';
import { enemyCardsByName } from '../cards/cards';

interface EnemyInfo {
  name: string;
  image: string;
  // battle # range that the enemy can appear in, inclusive
  battleRange: [number, number];
  getCards: (battleNumber: number) => CardState[];
  getHealth: (battleNumber: number) => number;
  initialize?: (player: PlayerState) => void;
  scale?: number;
}

function basicAttacks(battleNumber: number) {
  return range(0, battleNumber + 1).map(() => cardsByName.attack);
}

function getScalingHealthFn(ratio: number) {
  return (battleNumber: number) => {
    return (25 + battleNumber * 5) * ratio;
    // return 2 + battleNumber;
  };
}

function chainCards(cards: CardState[], fromCardName: string, toCardName: string) {
  const fromCard = cards.find((card) => card.name === fromCardName)!;
  const toCard = cards.find((card) => card.name === toCardName)!;
  fromCard.chain.toId = toCard.acquiredId;
  toCard.chain.fromId = fromCard.acquiredId;
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
    getHealth: getScalingHealthFn(1),
  },
  punchy: {
    name: 'Punchy',
    image: punchyImage,
    battleRange: [0, 2],
    getCards: (n) => {
      const cards = range(0, 3).map(() => cardsByName.attack);
      cards.push(enemyCardsByName.windUp, enemyCardsByName.bigPunch);
      return cards;
    },
    initialize: (player) => {
      chainCards(player.cards, enemyCardsByName.windUp.name, enemyCardsByName.bigPunch.name);
    },
    getHealth: getScalingHealthFn(1),
    scale: 0.5,
  },
  armoredLizard: {
    name: 'Armored Lizard',
    image: armoredLizardImage,
    battleRange: [1, twoThirds],
    getCards: basicAttacks,
    getHealth: getScalingHealthFn(1),
  },
  coolBird: {
    name: 'Cool Bird',
    image: coolBirdImage,
    battleRange: [1, twoThirds],
    getCards: basicAttacks,
    getHealth: getScalingHealthFn(1),
    scale: 0.5,
  },
  fireMonster: {
    name: 'Fire Monster',
    image: fireMonsterImage,
    battleRange: [1, end],
    getCards: basicAttacks,
    getHealth: getScalingHealthFn(1),
    scale: 0.5,
  },
  frostLizard: {
    name: 'Frost Lizard',
    image: frostLizardImage,
    battleRange: [third, end],
    getCards: basicAttacks,
    getHealth: getScalingHealthFn(1),
  },
  grumpyRock: {
    name: 'Grumpy Rock',
    image: grumpyRockImage,
    battleRange: [third, end],
    getCards: basicAttacks,
    getHealth: getScalingHealthFn(1),
    scale: 1.1,
  },
  treeMonster: {
    name: 'Tree Monster',
    image: treeMonsterImage,
    battleRange: [middle, end],
    getCards: basicAttacks,
    getHealth: getScalingHealthFn(1),
    scale: 1.4,
  },
  blueRedMonster: {
    name: 'Blue Red Monster',
    image: blueRedMonsterImage,
    battleRange: [twoThirds, end],
    getCards: basicAttacks,
    getHealth: getScalingHealthFn(1),
    scale: 1.2,
  },
  giantLizard: {
    name: 'Giant Lizard',
    image: giantLizardImage,
    battleRange: [MAX_WINS - 1, MAX_WINS - 1],
    getCards: basicAttacks,
    getHealth: getScalingHealthFn(1),
    scale: 2,
  },
};

export type EnemyName = keyof typeof enemiesByName;
