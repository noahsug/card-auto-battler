import sample from 'lodash/sample';
import sampleSize from 'lodash/sampleSize';
import shuffle from 'lodash/shuffle';
import ConfidenceScore from 'wilson-score-rank';
import { NeuralNetwork } from 'brain.js';

import {
  createInitialGameState,
  enemyTypes,
  GameState,
  pickCards as pickCardsByEnemyType,
  EnemyType,
  getCanPlayCard,
  getIsBattleOver,
  MAX_WINS,
  CARD_SELECTION_PICKS,
  CardState,
  cardsByName,
  nonStarterCardsByName,
} from '../../src/gameState';
import {
  addCard,
  endBattle,
  endTurn,
  playCard,
  startTurn,
  startCardSelection,
  startBattle,
} from '../../src/gameState/actions';
import { getCardSelectionsForBattle } from '../../src/gameState/cardSelection';
import { percent, moveItem } from '../../src/utils';

const aiTypes = [...enemyTypes, 'random', 'bestCard'] as const;

type AIType = (typeof aiTypes)[number];

interface AIContext {
  type: AIType;
}

type WinLosses<T extends PropertyKey = string> = Record<T, { wins: number; losses: number }>;

const cardNames = Object.keys(cardsByName) as (keyof typeof cardsByName)[];
const nonStarterCardNames = Object.keys(
  nonStarterCardsByName,
) as (keyof typeof nonStarterCardsByName)[];

// let cardPriority = nonStarterCardNames.slice();
let cardPriority = [
  'appliesStrengthTwiceCard',
  'trashForOpponentHealthCard',
  'lifestealCard',
  'extraPlayCard',
  'trashCard',
  'dodgeAndTrashCard',
  'extraCardIfHighHealthCard',
  'strengthTrashCard',
  'trashAndTrashSelfCard',
  'healForEachTrashedCard',
  'bleedTrashCard',
  'extraPlayIfBleedCard',
  'damageForEachTrashedCard',
  'damageCard',
  'extraPlayIfExtraPlayCard',
  'doubleDodgeIfLowHealthCard',
  'doubleStrengthCard',
  'damageForEachCard',
  'selfDamageCard',
  'plusHealForEachTrashedCard',
  'extraPlaysTrashCard',
  'strengthCard',
  'damageForEachBleedCard',
  'bothBleedCard',
  'bleedCard',
  'damageSelfIfMissCard',
  'gainStrengthForBleedCard',
  'extraPlayIfLowHealthCard',
  'damageForEachCardPlayedCard',
  'multihitCard',
  'doubleBleedCard',
  'setHealthToHalfCard',
  'trashAndExtraPlayCard',
  'damageForEachMissingHealthCard',
  'extraPlayHealCard',
  'healCard',
  'extraCardIfHighDamageCard',
] as typeof nonStarterCardNames;
let cardRanksByName = new Map(cardPriority.map((card, i) => [card, i]));

let RUNS = 200;
const DECKS_TO_TRY = 3000;

function run() {
  testGradientDecent();
}

function testGradientDecent() {
  const MOVE = 2;
  const MARGIN = 0.003;
  RUNS = 50 * 1000;
  let best = 0.62566;
  for (let i = 0; i < cardPriority.length; i++) {
    if (i >= MOVE) {
      cardPriority = moveItem(cardPriority, i, i - MOVE);
      const { wins, losses } = iterate();
      const winRate = wins / (wins + losses);

      console.log(cardPriority[i - MOVE], 'up', MOVE, ':', winRate, `(best: ${best})`);
      if (winRate > best + MARGIN) {
        console.log('new best:', winRate, cardPriority);
        best = winRate;
      } else {
        cardPriority = moveItem(cardPriority, i - MOVE, i);
      }
    }

    if (i + MOVE < cardPriority.length) {
      cardPriority = moveItem(cardPriority, i, i + MOVE);
      const { wins, losses } = iterate();
      const winRate = wins / (wins + losses);

      console.log(cardPriority[i + MOVE], 'down', MOVE, ':', winRate, `(best: ${best})`);
      if (winRate > best + MARGIN) {
        console.log('new best:', winRate, cardPriority);
        best = winRate;
      } else {
        cardPriority = moveItem(cardPriority, i + MOVE, i);
      }
    }
  }
}

function test() {
  // RUNS = 40000;
  // const { wins, losses } = iterate();
  // const winRate = wins / (wins + losses);
  // console.log(percent(winRate, 1));
  // return;
}

function testRandomlyWithNarrowingIterations() {
  let runs = testCardPriorities();

  // take the last 20 runs and run them more times to get a more accurate winRate
  runs.sort((a, b) => b.winRate - a.winRate);
  runs = runs.slice(0, 30);
  RUNS = 10000;

  console.log('top:', runs[0].winRate, runs[0].cardPriority.slice(0, 5));

  runs = runs.map(({ cardPriority: newCardPriority }) => {
    cardPriority = newCardPriority;

    const { wins, losses } = iterate();
    const winRate = wins / (wins + losses);
    return { winRate, cardPriority };
  });

  // take the last 3 runs and run them more times to get a more accurate winRate
  runs.sort((a, b) => b.winRate - a.winRate);
  runs = runs.slice(0, 3);
  RUNS = 50000;

  console.log('top:', runs[0].winRate, runs[0].cardPriority.slice(0, 5));

  runs = runs.map(({ cardPriority: newCardPriority }) => {
    cardPriority = newCardPriority;

    const { wins, losses } = iterate();
    const winRate = wins / (wins + losses);
    return { winRate, cardPriority };
  });

  runs.sort((a, b) => b.winRate - a.winRate);
  console.log(runs[0]);
}

function testCardPriorities() {
  const net = new NeuralNetwork<number[], number[]>();

  const runs = [] as { winRate: number; cardPriority: typeof nonStarterCardNames }[];
  for (let i = 0; i < DECKS_TO_TRY; i++) {
    cardPriority = shuffle(cardPriority);

    const { wins, losses } = iterate(net);

    const winRate = wins / (wins + losses);
    runs.push({ winRate, cardPriority });
  }

  return runs;
}

function iterate(net?: NeuralNetwork<number[], number[]>) {
  cardRanksByName = new Map(cardPriority.map((card, i) => [card, i]));
  const aiTypesForRun = ['bestCard'] as AIContext['type'][];
  // const aiTypesForRun = ['random'] as AIContext['type'][];

  const { cardWinLosses, aiWinLosses } = evaluateStrategies({ aiTypesForRun });

  // aiTypesForRun.forEach((type) => {
  const type = aiTypesForRun[0];
  const { wins, losses } = aiWinLosses[type];
  // console.log(type, percent(wins / (wins + losses), 1));
  // });

  // console.log(''); // new line

  // const cardScores = Object.fromEntries(
  //   cardPriority.map((card) => {
  //     const { wins, losses } = cardWinLosses[card];
  //     return [card, ConfidenceScore.lowerBound(wins, wins + losses)];
  //   }),
  // );
  // cardPriority.sort((a, b) => cardScores[b] - cardScores[a]);
  // cardRanksByName = new Map(cardPriority.map((card, i) => [card, i]));

  // cardPriority //.slice(0, 5)
  //   .forEach((card) => {
  //     const { wins, losses } = cardWinLosses[card];
  //     // const score = ConfidenceScore.lowerBound(wins, wins + losses);
  //     const score = wins / (wins + losses);
  //     console.log(card, score);
  //   });

  // console.log(''); // new line
  return { wins, losses };
}

function evaluateStrategies({ aiTypesForRun }: { aiTypesForRun: AIContext['type'][] }) {
  const cardWinLosses = {} as WinLosses;
  cardNames.forEach((cardName) => {
    cardWinLosses[cardName] = { wins: 0, losses: 0 };
  });

  const aiWinLosses = {} as WinLosses<EnemyType>;
  aiTypesForRun.forEach((type) => {
    aiWinLosses[type] = { wins: 0, losses: 0 };
  });

  for (let i = 0; i < RUNS; i++) {
    const type = sample(aiTypesForRun)!;
    const { game, isWin } = runGame({ type });

    if (isWin) {
      aiWinLosses[type].wins += 1;
    } else {
      aiWinLosses[type].losses += 1;
    }

    game.user.cards.forEach((card) => {
      const { name } = card;
      if (isWin) {
        cardWinLosses[name].wins += 1;
      } else {
        cardWinLosses[name].losses += 1;
      }
    });
  }

  return { cardWinLosses, aiWinLosses };
}

function runGame(aiContext: AIContext) {
  const game = createInitialGameState();

  while (game.screen !== 'gameEnd') {
    addNewCards({ game, aiContext });
    runBattle(game);
  }
  return { game, isWin: game.wins >= MAX_WINS };
}

function runBattle(game: GameState) {
  if (game.screen !== 'battle') {
    startBattle(game);
  }

  startTurn(game);

  while (getCanPlayCard(game)) {
    playCard(game);

    if (getIsBattleOver(game)) {
      endBattle(game);
      return;
    }
  }

  endTurn(game);
  runBattle(game);
}

function addNewCards({ game, aiContext }: { game: GameState; aiContext: AIContext }) {
  startCardSelection(game);

  const cards = getCardSelectionsForBattle();

  const picks = pickCards({ cards, aiContext });
  picks.forEach((card) => addCard(game, card));
}

function pickCards({ cards, aiContext }: { cards: CardState[]; aiContext: AIContext }) {
  if (aiContext.type === 'bestCard') {
    return (
      cards
        // sort low to high
        .sort((a: CardState, b: CardState) => {
          const nameA = a.name as keyof typeof nonStarterCardNames;
          const nameB = b.name as keyof typeof nonStarterCardNames;
          return (
            (cardRanksByName.get(nameA) || Infinity) - (cardRanksByName.get(nameB) || Infinity)
          );
        })
        .slice(0, CARD_SELECTION_PICKS)
    );
  } else if (aiContext.type === 'random') {
    return sampleSize(cards, CARD_SELECTION_PICKS);
  }

  return pickCardsByEnemyType(aiContext.type);
}

(() => {
  run();
})();
