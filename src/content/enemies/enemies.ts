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

import { cardsByType } from '../cards';
import { CardState, PlayerState } from '../../game/gameState';
import { MAX_WINS } from '../../game/constants';
import { enemyCardsByType, CardType } from '../cards/cards';
import { addDamage } from '../../game/utils/cards';

export interface EnemyInfo {
  name: string;
  image: string;
  // battle # range that the enemy can appear in, inclusive
  battleRange: [number, number];
  getCards: (battleNumber: number) => CardState[];
  getHealth: (battleNumber: number) => number;
  initialize?: (player: PlayerState, battleNumber: number) => void;
  scale?: number;
}

function basicAttacks(battleNumber: number) {
  return range(0, battleNumber + 1).map(() => cardsByType.attack);
}

function getScalingHealthFn(ratio: number) {
  return (battleNumber: number) => {
    return Math.floor((25 + battleNumber * 5) * ratio);

    // DEBUG
    // return 2 + battleNumber;
  };
}

function chainCards(cards: CardState[], fromCardsType: CardType, toCardsType: CardType) {
  const fromCards = cards.filter((card) => card.name === cardsByType[fromCardsType].name)!;
  const toCards = cards.filter((card) => card.name === cardsByType[toCardsType].name)!;
  fromCards.forEach((fromCard, i) => {
    const toCard = toCards[i];
    if (toCard) {
      fromCard.chain.toId = toCard.acquiredId;
      toCard.chain.fromId = fromCard.acquiredId;
    }
  });
}

const third = Math.floor(MAX_WINS / 3) - 1;
const middle = Math.floor(MAX_WINS / 2) - 1;
const twoThirds = Math.floor((2 * MAX_WINS) / 3) - 1;
const end = MAX_WINS - 2;

export const enemiesByType = {
  // dodges, weak to offense
  greenMonster: {
    name: 'Green Monster',
    image: greenMonsterImage,
    battleRange: [0, 2],
    getCards: (n) => {
      const attack = structuredClone(enemyCardsByType.surpriseAttack);
      addDamage(attack, n);
      return [attack, attack, enemyCardsByType.hide, enemyCardsByType.hide];
    },
    getHealth: getScalingHealthFn(1),
    scale: 0.85,
  },
  // winds up for an attack, weak to dodge
  punchy: {
    name: 'Punchy',
    image: punchyImage,
    battleRange: [0, 2],
    getCards: (n) => {
      const bigPunch = structuredClone(enemyCardsByType.bigPunch);
      addDamage(bigPunch, n);
      return [
        cardsByType.attack,
        enemyCardsByType.windUp,
        bigPunch,
        enemyCardsByType.windUp,
        bigPunch,
      ];
    },
    initialize: (player) => {
      chainCards(player.cards, 'windUp', 'bigPunch');
    },
    getHealth: getScalingHealthFn(0.97),
    scale: 0.5,
  },
  // builds up thick skin, weak to lots of offense, multi-hit, status effects
  armoredLizard: {
    name: 'Armored Lizard',
    image: armoredLizardImage,
    battleRange: [1, twoThirds],
    getCards: () => {
      return [
        cardsByType.attack,
        cardsByType.attack,
        cardsByType.thickSkin,
        cardsByType.swipe,
        cardsByType.swipe,
      ];
    },
    initialize: (player, n) => {
      player.thickSkin = n;
    },
    getHealth: getScalingHealthFn(0.67),
  },
  // burst damage (bleed + multi-hit), stunned for a turn receiving >= 8 damage?
  coolBird: {
    name: 'Cool Bird',
    image: coolBirdImage,
    battleRange: [1, twoThirds],
    getCards: (n) => {
      const focusCards = range(0, n / 2 + 1).map(() => cardsByType.focus);
      return [
        cardsByType.peck,
        cardsByType.peck,
        cardsByType.rake,
        cardsByType.rake,
        cardsByType.rake,
        ...focusCards,
      ];
    },
    getHealth: getScalingHealthFn(0.7),
    scale: 0.6,
  },
  // applies burn to you and self each turn, takes half damage from burn
  // trashes own cards, will kill self in time, weak to defense
  fireMonster: {
    name: 'Fire Spirit',
    image: fireMonsterImage,
    battleRange: [1, end],
    getCards: basicAttacks,
    getHealth: getScalingHealthFn(1),
    scale: 0.5,
  },
  // takes double damage from status effects??, reflect?
  frostLizard: {
    name: 'Frost Lizard',
    image: frostLizardImage,
    battleRange: [third, end],
    getCards: basicAttacks,
    getHealth: getScalingHealthFn(1),
  },
  // gets stronger each time it's hit, weak to large single damage/defense/scaling
  grumpyRock: {
    name: 'Grumpy Rock',
    image: grumpyRockImage,
    battleRange: [third, end],
    getCards: basicAttacks,
    getHealth: getScalingHealthFn(1),
    scale: 1.1,
  },
  // healing and lots of HP, weak to scaling and burn
  //  - kindling status effect: burn decreases by 1, not half, offer relic in shop if tree was burned
  treeMonster: {
    name: 'Tree Monster',
    image: treeMonsterImage,
    battleRange: [middle, end],
    getCards: basicAttacks,
    getHealth: getScalingHealthFn(1),
    scale: 1.4,
  },
  // gains strength over time, weak to burst damage
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
} satisfies Record<string, EnemyInfo>;

export type EnemyType = keyof typeof enemiesByType;
