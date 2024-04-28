import { NeuralNetwork } from 'brain.js';

import { cards } from '../../src/gameState/cards';
import {
  GameState,
  NUM_CARD_SELECTION_PICKS,
  createInitialGameState,
  CardState,
} from '../../src/gameState';
import { runBattle } from './runGame';
import { addCard, startCardSelection } from '../../src/gameState/actions';
import { getCardSelectionsForBattle } from '../../src/gameState/cardSelection';
import { runFakeBattle } from './simulationHelper';

const cardIndexByName = new Map(cards.map((card, index) => [card.name, index]));

const ITERATIONS = 40000;

export default function printBestCardsByBattle() {
  const winRatesByCardPicks = getWinRatesByCardPicks({ battleNumber: 1 });

  const trainingData = [] as { input: number[]; output: number[] }[];
  winRatesByCardPicks.forEach((winRate, cardPicksKey) => {
    console.log(winRate, cardPicksKey);
    const cardIndexes = getCardIndexesFromKey(cardPicksKey);
    const input = new Array(cards.length).fill(0);
    cardIndexes.forEach((index) => {
      input[index] += 1;
    });

    trainingData.push({ input, output: [winRate] });
  });

  const net = new NeuralNetwork<number[], number[]>();
  console.log('training...');
  net.train(trainingData, { iterations: 2 });

  const testInput = new Array(cards.length).fill(0);
  testInput[39] = 3; // damageStarterCard
  testInput[0] = 2; // damage card
  console.log(net.run(testInput));
}

function getWinRatesByCardPicks({ battleNumber }: { battleNumber: number }) {
  const winLossesByCardPicks = new Map<string, { wins: number; games: number }>();

  for (let i = 0; i < ITERATIONS; i++) {
    const game = runSimulation({ battleNumber });
    const key = getKeyFromCards(game.user.cards);

    const winLosses = winLossesByCardPicks.get(key) || { wins: 0, games: 0 };
    winLosses.games += 1;
    winLosses.wins += game.wonLastBattle ? 1 : 0;
    winLossesByCardPicks.set(key, winLosses);
  }

  const winRatesByCardPicks = new Map<string, number>();
  winLossesByCardPicks.forEach(({ wins, games }, key) => {
    winRatesByCardPicks.set(key, wins / games);
  });
  return winRatesByCardPicks;
}

function runSimulation({ battleNumber }: { battleNumber: number }) {
  const game = createInitialGameState();

  // run fake battles until we're at the right battle number
  while (game.wins + game.losses < battleNumber - 1) {
    addRandomCards(game);
    runFakeBattle(game);
  }

  addRandomCards(game);
  runBattle(game);
  return game;
}

function addRandomCards(game: GameState) {
  startCardSelection(game);

  const cards = getCardSelectionsForBattle();

  // add cards randomly
  const picks = cards.slice(0, NUM_CARD_SELECTION_PICKS);
  picks.forEach((card) => addCard(game, card));
}

function getCardIndexesFromKey(key: string) {
  return key.split(',').map(Number);
}

function getKeyFromCards(cards: CardState[]) {
  return cards
    .map((card) => cardIndexByName.get(card.name))
    .sort()
    .join(',');
}
