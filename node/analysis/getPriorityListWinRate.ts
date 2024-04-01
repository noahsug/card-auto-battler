import shuffle from 'lodash/shuffle';
import {
  CARD_SELECTION_PICKS,
  CardState,
  NonStarterCardName,
  NonStarterCardNames,
  nonStarterCardNames,
} from '../../src/gameState';
import { assert, assertIsNonNullable, percent } from '../../src/utils';
import runGame from './runGame';

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
  let randomPriorityList = nonStarterCardNames.slice();

  for (let i = 0; i < ITERATIONS; i++) {}

  const weightByCard = new Map(priorityList.map((card) => [card, 0]));

  // let jiggledWeightByCard = new Map(weightByCard.entries());
  let jiggledWeightByCard = new Map();
  for (const card of priorityList) {
    jiggledWeightByCard.set(card, Math.random());
  }

  let randomJiggle = new Map();
  for (const card of priorityList) {
    randomJiggle.set(card, Math.random());
  }

  const pickCards = ({ cards }: { cards: CardState[] }) => {
    return pickByHighestWeight({ cards, weightByCard: randomJiggle });
  };

  const iterations = 10000;
  const jiggleMax = 0.7;
  const jiggleMin = 0.7;

  const gameHistory: boolean[] = [];
  for (let i = 0; i < iterations; i++) {
    // between 1 and 0
    // const jiggleDampening = (iterations - i) / iterations;
    // between jiggleMax and jiggleMin
    // const jiggle = jiggleMin + (jiggleMax - jiggleMin) * jiggleDampening;
    // const jiggle = 1;
    // updateJiggledWeightByCard({
    //   jiggledWeightByCard,
    //   weightByCard,
    //   jiggle,
    // });

    jiggledWeightByCard = new Map();
    for (const card of priorityList) {
      jiggledWeightByCard.set(card, Math.random());
    }

    randomJiggle = new Map();
    for (const card of priorityList) {
      randomJiggle.set(card, Math.random());
    }

    const { isWin } = runGame({ pickCards });

    gameHistory.push(isWin);

    const randomValuesByCard = new Map();
    for (const card of priorityList) {
      // const value = jiggledWeightByCard.get(card);
      const value = randomJiggle.get(card);
      // const value = Math.random();
      randomValuesByCard.set(card, value);
    }

    priorityList = priorityList.sort(
      (a, b) => (randomValuesByCard.get(b) ?? 0) - (randomValuesByCard.get(a) ?? 0),
    );
    // priorityList = priorityList.sort(getCompareByHighestWeightFn(jiggledWeightByCard));
    // priorityList = shuffle(priorityList);
    // if (i > 1000 && i < 1010) {
    //   console.log(jiggledWeightByCard, priorityList);
    // }
    const priorityByCard = getPriorityByCardMap(priorityList);

    const winModifier = isWin ? 1 : -1;

    priorityList.forEach((card) => {
      const priority = priorityByCard.get(card);
      assertIsNonNullable(priority);
      const weightAdjustment = getWeightByPriority(priority) * winModifier;

      const currentWeight = weightByCard.get(card);
      assertIsNonNullable(currentWeight);

      const newWeight = (currentWeight * i + weightAdjustment) / (i + 1);

      weightByCard.set(card, newWeight);

      // if (i > 39990 && card === 'trashForOpponentHealthCard') {
      //   console.log({
      //     weight: weightByCard.get('trashForOpponentHealthCard'),
      //     jiggle: jiggledWeightByCard.get('trashForOpponentHealthCard'),
      //     jigglePriority: priority,
      //     isWin,
      //     newWeight,
      //     newPriority: priorityList
      //       .slice()
      //       .sort(getCompareByHighestWeightFn(weightByCard))
      //       .indexOf('trashForOpponentHealthCard'),
      //   });
      // }
    });

    // if (i % 1000 === 0) {
    //   console.log({
    //     weight: weightByCard.get('damageCard'),
    //     jiggle: jiggledWeightByCard.get('damageCard'),
    //   });
    // }

    // if (i % 1000 === 0) {
    //   const nonJiggledPriorityList = priorityList
    //     .slice()
    //     .sort(getCompareByHighestWeightFn(weightByCard));
    //   const highestWeight = weightByCard.get(nonJiggledPriorityList[0]) ?? 1;
    //   const lowestWeight =
    //     weightByCard.get(nonJiggledPriorityList[nonJiggledPriorityList.length - 1]) ?? 1;
    //   const wins = gameHistory.slice(gameHistory.length - 1000).filter(Boolean).length;
    //   const trashForOpponentHealthCardPriority = nonJiggledPriorityList.indexOf(
    //     'trashForOpponentHealthCard',
    //   );
    //   const trashCardCardPriority = nonJiggledPriorityList.indexOf('trashCard');
    //   console.log(
    //     'win rate:',
    //     percent(wins / 1000, 1),
    //     'trashForOpponentHealthCardPriority:',
    //     trashForOpponentHealthCardPriority,
    //     'trashCardCardPriority:',
    //     trashCardCardPriority,
    //     'weightGap',
    //     highestWeight - lowestWeight,
    //     'jiggle',
    //     jiggle,
    //   );
    // }
  }

  priorityList.sort(getCompareByHighestWeightFn(weightByCard));

  // const highestWeight = weightByCard.get(priorityList[0]) ?? 1;
  // const lowestWeight = weightByCard.get(priorityList[priorityList.length - 1]) ?? 1;
  // console.log('highest - lowest:', highestWeight - lowestWeight);
  //
  // priorityList.forEach((card) => {
  //   const weight = weightByCard.get(card) ?? 0;
  //   console.log(card, (weight - lowestWeight) / (highestWeight - lowestWeight));
  // });
  evaluateWinRate(priorityList);
}

function updateJiggledWeightByCard({
  jiggledWeightByCard,
  weightByCard,
  jiggle,
}: {
  jiggledWeightByCard: Map<NonStarterCardName, number>;
  weightByCard: Map<NonStarterCardName, number>;
  jiggle: number;
}) {
  for (const card of weightByCard.keys()) {
    const weight = weightByCard.get(card);
    assertIsNonNullable(weight);
    const jiggledWeight = Math.random(); // weight + (Math.random() - 0.5) * jiggle;
    jiggledWeightByCard.set(card, jiggledWeight);
  }
}

function evaluateWinRate(priorityList: NonStarterCardNames) {
  console.log('evaluate:');
  console.log(priorityList);

  const weightByCard = getWeightByCardMap(priorityList);

  const pickCards = ({ cards }: { cards: CardState[] }) => {
    return pickByHighestWeight({ cards, weightByCard });
  };

  let games = 0;
  let wins = 0;
  for (let i = 0; i < 10000; i++) {
    const { isWin } = runGame({ pickCards });
    if (isWin) {
      wins += 1;
    }
    games += 1;
  }

  console.log('win rate:', percent(wins / games, 1));
}

function pickByHighestWeight({
  cards,
  weightByCard,
}: {
  cards: CardState[];
  weightByCard: Map<NonStarterCardName, number>;
}) {
  const compareFn = getCompareByHighestWeightFn(weightByCard);

  return cards
    .sort((a: CardState, b: CardState) => {
      const nameA = a.name as NonStarterCardName;
      const nameB = b.name as NonStarterCardName;
      return compareFn(nameA, nameB);
    })
    .slice(0, CARD_SELECTION_PICKS);
}

function getWeightByPriority(priority: number) {
  const weightByPriority = [
    0.161508, 0.159012, 0.155414, 0.150112, 0.14283, 0.135619, 0.126885, 0.118538, 0.109247,
    0.100211, 0.091074, 0.082379, 0.07295, 0.065117, 0.057448, 0.049079, 0.042697, 0.036408,
    0.030216, 0.025323, 0.02081, 0.016463, 0.013067, 0.01025, 0.00773, 0.005789, 0.004072, 0.002841,
    0.001939, 0.001161, 0.000692, 0.000349, 0.000136, 0.00007, 0.00002, 0.000003, 0,
  ];
  const largestWeight = weightByPriority[0];

  assert(priority < weightByPriority.length);
  return weightByPriority[priority] / largestWeight;
}

// lower priority = better
function getPriorityByCardMap(priorityList: NonStarterCardNames) {
  return new Map(priorityList.map((card, i) => [card, i]));
}

// higher weight = better
function getWeightByCardMap(priorityList: NonStarterCardNames) {
  return new Map(priorityList.map((card, i) => [card, -i]));
}

function getCompareByHighestWeightFn(weightByCard: Map<NonStarterCardName, number>) {
  return (a: NonStarterCardName, b: NonStarterCardName) => {
    const weightA = weightByCard.get(a);
    const weightB = weightByCard.get(b);
    assertIsNonNullable(weightA);
    assertIsNonNullable(weightB);
    return weightB - weightA;
  };
}
