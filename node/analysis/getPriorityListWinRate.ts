import {
  CARD_SELECTION_PICKS,
  CardState,
  NonStarterCardName,
  NonStarterCardNames,
  nonStarterCardNames,
} from '../../src/gameState';
import { assert, assertIsNonNullable, percent } from '../../src/utils';
import runGame from './runGame';

export default function getPriorityListWinRate() {
  const priorityList = nonStarterCardNames.slice();
  const weightByCard = new Map(priorityList.map((card) => [card, 0]));
  const jiggledWeightByCard = new Map(weightByCard.entries());

  const pickCards = ({ cards }: { cards: CardState[] }) => {
    return pickByHighestWeight({ cards, weightByCard: jiggledWeightByCard });
  };

  const iterations = 40000;

  const gameHistory: boolean[] = [];
  for (let i = 0; i < iterations; i++) {
    // between 1 and 0
    const jiggleDampening = (iterations - i) / iterations;
    // between 1 and 0.004
    const jiggle = 0.004 + (1 - 0.004) * jiggleDampening;
    updateJiggledWeightByCard({
      jiggledWeightByCard,
      weightByCard,
      jiggle,
    });

    const { isWin } = runGame({ pickCards });

    gameHistory.push(isWin);

    priorityList.sort(getCompareByHighestWeightFn(jiggledWeightByCard));
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

    if (i % 1000 === 0) {
      const nonJiggledPriorityList = priorityList
        .slice()
        .sort(getCompareByHighestWeightFn(weightByCard));
      const highestWeight = weightByCard.get(nonJiggledPriorityList[0]) ?? 1;
      const lowestWeight =
        weightByCard.get(nonJiggledPriorityList[nonJiggledPriorityList.length - 1]) ?? 1;
      const wins = gameHistory.slice(gameHistory.length - 1000).filter(Boolean).length;
      const trashForOpponentHealthCardPriority = nonJiggledPriorityList.indexOf(
        'trashForOpponentHealthCard',
      );
      const trashCardCardPriority = nonJiggledPriorityList.indexOf('trashCard');
      console.log(
        'win rate:',
        percent(wins / 1000, 1),
        'trashForOpponentHealthCardPriority:',
        trashForOpponentHealthCardPriority,
        'trashCardCardPriority:',
        trashCardCardPriority,
        'weightGap',
        highestWeight - lowestWeight,
        'jiggle',
        jiggle,
      );
    }
  }

  priorityList.sort(getCompareByHighestWeightFn(weightByCard));

  const highestWeight = weightByCard.get(priorityList[0]) ?? 1;
  const lowestWeight = weightByCard.get(priorityList[priorityList.length - 1]) ?? 1;
  console.log('highest - lowest:', highestWeight - lowestWeight);

  priorityList.forEach((card) => {
    const weight = weightByCard.get(card) ?? 0;
    console.log(card, (weight - lowestWeight) / (highestWeight - lowestWeight));
  });
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
  jiggledWeightByCard.forEach((_, card) => {
    const weight = weightByCard.get(card);
    assertIsNonNullable(weight);
    const jiggledWeight = weight + (Math.random() - 0.5) * jiggle;
    jiggledWeightByCard.set(card, jiggledWeight);
  });
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
  for (let i = 0; i < 40000; i++) {
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
