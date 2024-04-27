import { nonStarterCards } from '../../src/gameState';
import { CARD_SELECTION_OPTIONS, CARD_SELECTION_PICKS } from '../../src/gameState/constants';
import { assert } from '../../src/utils';
import { hashValues, getCachedFn } from './cache';

const NUM_CARDS = nonStarterCards.length;

const ITERATIONS = 1000000;

export default function getWeightByPriority(priority: number) {
  const weights = cachedGetPriorityWeightArray();
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

const cachedGetPriorityWeightArray = getCachedFn(getPriorityWeightArray, {
  getCacheKey,
  name: 'getPriorityWeightArray',
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
