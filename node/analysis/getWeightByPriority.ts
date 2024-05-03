import {
  NUM_CARD_SELECTION_OPTIONS,
  NUM_CARD_SELECTION_PICKS,
} from '../../src/gameState/constants';
import { assert } from '../../src/utils';
import { hashValues, getCachedFn } from './cache';

const ITERATIONS = 1000000;

// Priority ranges from 0 to maxPriority, with 0 being the highest
export default function getWeightByPriority({
  priority,
  maxPriority,
}: {
  priority: number;
  maxPriority: number;
}) {
  const weights = cachedGetPriorityWeightArray(maxPriority);
  assert(priority < weights.length);

  const largestWeight = weights[0];
  return weights[priority] / largestWeight;
}

const cachedGetPriorityWeightArray = getCachedFn(getPriorityWeightArray, {
  getCacheKey,
  name: 'getPriorityWeightArray',
});

function getPriorityWeightArray(maxPriority: number) {
  const weightsByPriority = new Array(maxPriority + 1);
  for (let i = 0; i < maxPriority + 1; i++) {
    const weight = getExpectedCardPicksAtPriority(i, maxPriority);
    weightsByPriority[i] = weight;
    // console.log('getPriorityWeightArray', `${i}/${maxPriority}`, weight);
  }
  return weightsByPriority;
}

function getExpectedCardPicksAtPriority(priority: number, maxPriority: number) {
  let numPicks = 0;

  for (let i = 0; i < ITERATIONS; i++) {
    const cards: number[] = [];
    for (let cardIndex = 0; cardIndex < NUM_CARD_SELECTION_OPTIONS; cardIndex++) {
      const card = Math.floor(Math.random() * (maxPriority + 1));
      cards.push(card);
    }

    cards.sort((a, b) => a - b);
    const selection = cards.slice(0, NUM_CARD_SELECTION_PICKS);
    numPicks += selection.filter((c) => c === priority).length;
  }

  return numPicks / ITERATIONS;
}

function getCacheKey(numEntries) {
  return hashValues({
    values: [
      getPriorityWeightArray.toString(),
      numEntries,
      ITERATIONS,
      NUM_CARD_SELECTION_OPTIONS,
      NUM_CARD_SELECTION_PICKS,
    ],
  });
}
