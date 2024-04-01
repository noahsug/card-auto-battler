import shuffle from 'lodash/shuffle';

import {
  CARD_SELECTION_PICKS,
  CardState,
  NonStarterCardName,
  NonStarterCardNames,
  nonStarterCardNames,
} from '../../src/gameState';
import { assertIsNonNullable, percent } from '../../src/utils';
import runGame from './runGame';
import getWeightByPriority from './getWeightByPriority';

// 40k iterations gives best results
const ITERATIONS = 40000;

/**
 * Creates a priority list of cards that determines pick order for an entire play through.
 * The list is created as follows:
 *  1. play a bunch of games with random priority lists
 *  2. track card wins, weighted by it's position in the priority list
 *  3. return cards sorted by weighted wins
 */
export default function getPriorityListWinRate() {
  const weightedWinsByCard = new Map<NonStarterCardName, number>(
    nonStarterCardNames.map((card) => [card, 0]),
  );

  let randomPriorityList = nonStarterCardNames.slice();

  const pickCards = ({ cards }: { cards: CardState[] }) => {
    return pickCardsByPriorityList({ cards, priorityList: randomPriorityList });
  };

  for (let i = 0; i < ITERATIONS; i++) {
    randomPriorityList = shuffle(randomPriorityList);
    const { isWin } = runGame({ pickCards });

    if (isWin) {
      updateWeightedCardWins({
        weightedWinsByCard,
        priorityList: randomPriorityList,
      });
    }
  }

  const priorityList = nonStarterCardNames.slice().sort(getWeightCompareFn(weightedWinsByCard));
  evaluateWinRate(priorityList);
}

function updateWeightedCardWins({
  weightedWinsByCard,
  priorityList,
}: {
  weightedWinsByCard: Map<NonStarterCardName, number>;
  priorityList: NonStarterCardNames;
}) {
  priorityList.forEach((card, priority) => {
    const weightedWin = getWeightByPriority(priority);
    const currentWeight = weightedWinsByCard.get(card);
    assertIsNonNullable(currentWeight);

    weightedWinsByCard.set(card, currentWeight + weightedWin);
  });
}

function evaluateWinRate(priorityList: NonStarterCardNames) {
  console.log('evaluate:');
  console.log(priorityList);

  const pickCards = ({ cards }: { cards: CardState[] }) => {
    return pickCardsByPriorityList({ cards, priorityList });
  };

  let games = 0;
  let wins = 0;
  for (let i = 0; i < 40000; i++) {
    const { isWin } = runGame({ pickCards });
    if (isWin) {
      wins += 1;
    }
    games += 1;
  }

  console.log('win rate:', percent(wins / games, 1));
}

function pickCardsByPriorityList({
  cards,
  priorityList,
}: {
  cards: CardState[];
  priorityList: NonStarterCardNames;
}) {
  const compareFn = getPriorityCompareFn(priorityList);

  return cards
    .sort((a: CardState, b: CardState) => {
      const nameA = a.name as NonStarterCardName;
      const nameB = b.name as NonStarterCardName;
      return compareFn(nameA, nameB);
    })
    .slice(0, CARD_SELECTION_PICKS);
}

// used to sort by descending weight
function getWeightCompareFn(weightByCard: Map<NonStarterCardName, number>) {
  return (a: NonStarterCardName, b: NonStarterCardName) => {
    const weightA = weightByCard.get(a);
    const weightB = weightByCard.get(b);
    assertIsNonNullable(weightA);
    assertIsNonNullable(weightB);
    return weightB - weightA;
  };
}

// used to sort by ascending priority
function getPriorityCompareFn(priorityList: NonStarterCardNames) {
  const priorityByCard = getPriorityByCardMap(priorityList);

  return (a: NonStarterCardName, b: NonStarterCardName) => {
    const weightA = priorityByCard.get(a);
    const weightB = priorityByCard.get(b);
    assertIsNonNullable(weightA);
    assertIsNonNullable(weightB);
    return weightA - weightB;
  };
}

function getPriorityByCardMap(priorityList: NonStarterCardNames) {
  return new Map(priorityList.map((card, i) => [card, i]));
}
