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

function chainCards(cards: CardState[], fromCardType: CardType, toCardType: CardType) {
  const fromCard = cards.find((card) => card.name === cardsByType[fromCardType].name)!;
  const toCard = cards.find((card) => card.name === cardsByType[toCardType].name)!;
  fromCard.chain.toId = toCard.acquiredId;
  toCard.chain.fromId = fromCard.acquiredId;
}

const third = Math.floor(MAX_WINS / 3) - 1;
const middle = Math.floor(MAX_WINS / 2) - 1;
const twoThirds = Math.floor((2 * MAX_WINS) / 3) - 1;
const end = MAX_WINS - 2;

export const enemiesByType = {
  // dodges, weak to multi-hit
  greenMonster: {
    name: 'Green Monster',
    image: greenMonsterImage,
    battleRange: [0, 2],
    getCards: (n) => {
      const attack = structuredClone(enemyCardsByType.surpriseAttack);
      addDamage(attack, n);
      const cards = [attack, attack, enemyCardsByType.hide, enemyCardsByType.hide];
      return cards;
    },
    getHealth: getScalingHealthFn(0.9),
  },
  // winds up for an attack, weak to dodge
  punchy: {
    name: 'Punchy',
    image: punchyImage,
    battleRange: [0, 2],
    getCards: () => {
      const cards = range(0, 3).map(() => cardsByType.attack);
      cards.push(enemyCardsByType.windUp, enemyCardsByType.bigPunch);
      return cards;
    },
    initialize: (player) => {
      chainCards(player.cards, 'windUp', 'bigPunch');
    },
    getHealth: getScalingHealthFn(1),
    scale: 0.5,
  },
  // takes 1 damage from <= x damage, weak to large damage and multi-hit
  armoredLizard: {
    name: 'Armored Lizard',
    image: armoredLizardImage,
    battleRange: [1, twoThirds],
    getCards: () => {
      return [cardsByType.attack];
      // return [attack, multi-attack, thickSkin, takes double damage when weak skin = 0
    },
    initialize: (player, n) => {
      // TODO: reduces damage <= X to 1, decreases by 1 each time it's hit
      // player.thickSkin = n;
    },
    getHealth: getScalingHealthFn(0.75),
  },
  // deals multi-hits when not hit, weak to offense
  coolBird: {
    name: 'Cool Bird',
    image: coolBirdImage,
    battleRange: [1, twoThirds],
    getCards: basicAttacks,
    getHealth: getScalingHealthFn(1),
    scale: 0.5,
  },
  // applies burn to you and self each turn, takes half damage from burn
  fireMonster: {
    name: 'Fire Spirit',
    image: fireMonsterImage,
    battleRange: [1, end],
    getCards: basicAttacks,
    getHealth: getScalingHealthFn(1),
    scale: 0.5,
  },
  // takes double damage from status effects??
  frostLizard: {
    name: 'Frost Lizard',
    image: frostLizardImage,
    battleRange: [third, end],
    getCards: basicAttacks,
    getHealth: getScalingHealthFn(1),
  },
  // gets stronger each time it's hit, weak to large single damage/defense
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
