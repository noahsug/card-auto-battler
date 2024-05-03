import shuffle from 'lodash/shuffle';

import {
  NUM_CARD_SELECTION_PICKS,
  CardState,
  NonStarterCardName,
  nonStarterCardNames,
} from '../../src/gameState';
import { assertIsNonNullable, percent } from '../../src/utils';
import runGame from './runGame';
import getWeightByPriority from './getWeightByPriority';

type GetKeyFromCards = ReturnType<typeof getCardsToKeyMappingGetters>['getKeyFromCards'];

// 40k iterations gives best results
const ITERATIONS = 40000;

/**
 * Creates a priority list of cards that determines pick order for an entire play through.
 * Priority equates to how powerful a single card is on its own.
 *
 * The priority list is created as follows:
 *  1. play a bunch of games with random priority lists
 *  2. track card wins, weighted by the cards position in the priority list (see `getWeightByPriority`)
 *  3. return cards sorted by weighted wins
 */
export default function printPriorityListWinRate() {
  const cardsList = nonStarterCardNames.map((card) => [card]);

  const { getKeyFromCards } = getCardsToKeyMappingGetters(cardsList);

  const weightedWinsByKey = new Map<string, number>(
    cardsList.map((cards) => [getKeyFromCards(cards), 0]),
  );

  let priorityList = Array.from(weightedWinsByKey.keys());

  const pickCards = ({ cards }: { cards: CardState[] }) => {
    return pickCardsByPriorityList({ cards, priorityList, getKeyFromCards });
  };

  for (let i = 0; i < ITERATIONS; i++) {
    priorityList = shuffle(priorityList);
    const { isWin } = runGame({ pickCards });

    if (isWin) {
      updateWeightedWinsByCards({
        weightedWinsByKey,
        priorityList,
      });
    }
  }

  priorityList.sort(getWeightCompareFn(weightedWinsByKey));
  evaluateWinRate({ priorityList, getKeyFromCards });
}

function updateWeightedWinsByCards({
  weightedWinsByKey,
  priorityList,
}: {
  weightedWinsByKey: Map<string, number>;
  priorityList: string[];
}) {
  priorityList.forEach((key, priority) => {
    const weightedWin = getWeightByPriority(priority);
    const currentWeight = weightedWinsByKey.get(key);
    assertIsNonNullable(currentWeight);

    weightedWinsByKey.set(key, currentWeight + weightedWin);
  });
}

function evaluateWinRate({
  priorityList,
  getKeyFromCards,
}: {
  priorityList: string[];
  getKeyFromCards: GetKeyFromCards;
}) {
  console.log(priorityList.join('\n'));

  const pickCards = ({ cards }: { cards: CardState[] }) => {
    return pickCardsByPriorityList({ cards, priorityList, getKeyFromCards });
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
  getKeyFromCards,
}: {
  cards: CardState[];
  priorityList: string[];
  getKeyFromCards: GetKeyFromCards;
}) {
  const compareFn = getPriorityCompareFn(priorityList);

  return cards
    .sort((a: CardState, b: CardState) => {
      const nameA = a.name as NonStarterCardName;
      const nameB = b.name as NonStarterCardName;
      // TODO: handle multiple cards
      const keyA = getKeyFromCards([nameA]);
      const keyB = getKeyFromCards([nameB]);
      return compareFn(keyA, keyB);
    })
    .slice(0, NUM_CARD_SELECTION_PICKS);
}

// used to sort by descending weight
function getWeightCompareFn(weightByKey: Map<string, number>) {
  return (a: string, b: string) => {
    const weightA = weightByKey.get(a);
    const weightB = weightByKey.get(b);
    assertIsNonNullable(weightA);
    assertIsNonNullable(weightB);
    return weightB - weightA;
  };
}

// used to sort by ascending priority
function getPriorityCompareFn(priorityList: string[]) {
  const priorityByKey = getPriorityByKeyMap(priorityList);

  return (a: string, b: string) => {
    const weightA = priorityByKey.get(a);
    const weightB = priorityByKey.get(b);
    assertIsNonNullable(weightA);
    assertIsNonNullable(weightB);
    return weightA - weightB;
  };
}

function getPriorityByKeyMap(priorityList: string[]) {
  return new Map(priorityList.map((key, i) => [key, i]));
}

// Returns functions to map from key -> cards and cards -> key
function getCardsToKeyMappingGetters(cardsList: NonStarterCardName[][]) {
  function getKeyFromCards(cards: NonStarterCardName[]) {
    return cards.slice().sort().join(' ');
  }

  const cardsByKey = new Map<string, NonStarterCardName[]>(
    cardsList.map((cards) => [getKeyFromCards(cards), cards]),
  );

  function getCardsFromKey(key: string) {
    const cards = cardsByKey.get(key);
    assertIsNonNullable(cards);
    return cards;
  }

  return { getKeyFromCards, getCardsFromKey };
}
