import { nonStarterCards } from '../../src/gameState';
import { CARD_SELECTION_OPTIONS, CARD_SELECTION_PICKS } from '../../src/gameState/constants';
import { assert } from '../../src/utils';
import { hashValues, getCachedFn } from './cache';

const NUM_CARDS = nonStarterCards.length;

const ITERATIONS = 1000000;

export default function getWeightByPriority(priority: number) {
  // const weightByPriority = [
  //   0.161508, 0.159012, 0.155414, 0.150112, 0.14283, 0.135619, 0.126885, 0.118538, 0.109247,
  //   0.100211, 0.091074, 0.082379, 0.07295, 0.065117, 0.057448, 0.049079, 0.042697, 0.036408,
  //   0.030216, 0.025323, 0.02081, 0.016463, 0.013067, 0.01025, 0.00773, 0.005789, 0.004072, 0.002841,
  //   0.001939, 0.001161, 0.000692, 0.000349, 0.000136, 0.00007, 0.00002, 0.000003, 0,
  // ];
  const weights = getPriorityWeightArray();
  assert(priority < weights.length);

  const largestWeight = weights[0];
  return weights[priority] / largestWeight;
}

function getPriorityWeightArray() {
  const weightsByPriority = new Array(NUM_CARDS);
  for (let i = 0; i < NUM_CARDS; i++) {
    const weight = getExpectedCardPicksAtPriority(i);
    weightsByPriority[i] = weight;
  }
  return weightsByPriority;
}

function getExpectedCardPicksAtPriority(priority: number) {
  let numPicks = 0;

  for (let i = 0; i < ITERATIONS; i++) {
    const cards: number[] = [];
    for (let cardIndex = 0; cardIndex < CARD_SELECTION_OPTIONS; cardIndex++) {
      const card = Math.floor(Math.random() * NUM_CARDS);
      cards.push(card);
    }

    cards.sort((a, b) => a - b);
    const selection = cards.slice(0, CARD_SELECTION_PICKS);
    numPicks += selection.filter((c) => c === priority).length;
  }

  return numPicks / ITERATIONS;
}

const cachedGetWeightsByPriority = getCachedFn(getPriorityWeightArray, {
  getCacheKey,
  fileName: 'getWeightsByPriority',
});

function getCacheKey() {
  return hashValues({
    values: [
      getPriorityWeightArray.toString(),
      NUM_CARDS,
      ITERATIONS,
      CARD_SELECTION_OPTIONS,
      CARD_SELECTION_PICKS,
    ],
  });
}

(() => {
  const s = Date.now();
  const r = cachedGetWeightsByPriority();
  const e = Date.now();
  console.log(e - s, r);
})();
