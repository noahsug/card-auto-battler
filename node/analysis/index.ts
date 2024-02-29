import sample from 'lodash/sample';
import sampleSize from 'lodash/sampleSize';
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
  cardsByName,
  CardState,
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
import { percent } from '../../src/utils/text';

const aiTypes = [...enemyTypes, 'random', 'bestCard'] as const;

type AIType = (typeof aiTypes)[number];

interface AIContext {
  type: AIType;
}

type WinLosses<T extends PropertyKey = string> = Record<T, { wins: number; losses: number }>;

const cardPriority = [
  'trashForOpponentHealthCard',
  'trashCard',
  'extraPlayIfExtraPlayCard',
  'extraPlayCard',
  'extraPlayStarterCard',
  'trashAndExtraPlayCard',
  'extraPlayHealCard',
  'extraCardIfHighHealthCard',
  'damageSelfIfMissCard',
  'damageForEachTrashedCard',
  'lifestealCard',
  'healCard',
  'healForEachTrashedCard',
  'trashAndTrashSelfCard',
  'multihitCard',
  'doubleDodgeIfLowHealthCard',
  'extraPlayIfBleedCard',
  'damageCard',
  'damageForEachMissingHealthCard',
  'strengthTrashCard',
  'bleedTrashCard',
  'plusHealForEachTrashedCard',
  'strengthCard',
  'extraPlaysTrashCard',
  'dodgeAndTrashCard',
  'selfDamageCard',
  'damageForEachCard',
  'extraCardIfHighDamageCard',
  'damageForEachCardPlayedCard',
  'dodgeStarterCard',
  'appliesStrengthTwiceCard',
  'multihitStarterCard',
  'bleedCard',
  'healStarterCard',
  'damageStarterCard',
  'gainStrengthForBleedCard',
  'strengthStarterCard',
  'damageForEachBleedCard',
  'bleedStarterCard',
  'setHealthToHalfCard',
  'doubleBleedCard',
  'extraPlayIfLowHealthCard',
  'doubleStrengthCard',
  'bothBleedCard',
]; //.sort(() => Math.random() - 0.5);

let cardRanksByName = new Map(cardPriority.map((card, i) => [card, i]));

const RUNS = 100000;

function run() {
  const net = new NeuralNetwork<number[], number[]>();
  for (let i = 0; i < 1; i++) {
    iterate(net);
  }

  // console.log(cardPriority);
}

function iterate(net: NeuralNetwork<number[], number[]>) {
  const aiTypesForRun = ['bestCard'] as AIContext['type'][];
  // const aiTypesForRun = ['random'] as AIContext['type'][];

  const { cardWinLosses, aiWinLosses } = evaluateStrategies({ aiTypesForRun });

  aiTypesForRun.forEach((type) => {
    const { wins, losses } = aiWinLosses[type];
    console.log(type, percent(wins / (wins + losses), 1), wins + losses);
  });

  console.log(''); // new line

  // update cardRanksByName
  cardPriority.sort((a, b) => {
    const { wins: winsA, losses: lossesA } = cardWinLosses[a];
    const { wins: winsB, losses: lossesB } = cardWinLosses[b];
    // const confidenceA = ConfidenceScore.lowerBound(winsA, winsA + lossesA);
    // const confidenceB = ConfidenceScore.lowerBound(winsB, winsB + lossesB);
    // return confidenceB - confidenceA;
    return winsB / (winsB + lossesB) - winsA / (winsA + lossesA);
  });

  // cardPriority //.slice(0, 5)
  //   .forEach((card) => {
  //     const { wins, losses } = cardWinLosses[card];
  //     // const score = ConfidenceScore.lowerBound(wins, wins + losses);
  //     const score = wins / (wins + losses);
  //     console.log(card, score);
  //   });

  console.log(''); // new line

  cardRanksByName = new Map(cardPriority.map((card, i) => [card, i]));
}

function evaluateStrategies({ aiTypesForRun }: { aiTypesForRun: AIContext['type'][] }) {
  const cardWinLosses = {} as WinLosses;
  Object.keys(cardsByName).forEach((cardName) => {
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
          return (
            (cardRanksByName.get(a.name) || Infinity) - (cardRanksByName.get(b.name) || Infinity)
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
