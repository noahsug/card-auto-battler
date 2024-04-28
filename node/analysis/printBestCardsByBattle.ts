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

const cardIndexByName = new Map(cards.map((card, index) => [card.name, index]));

const ITERATIONS = 1;

export default function printBestCardsByBattle() {
  const winRatesByCardPicks = getWinRatesByCardPicks({ battleNumber: 1 });

  const trainingData = [] as { input: number[]; output: number[] }[];
  winRatesByCardPicks.forEach((winRate, cardPicksKey) => {
    const cardIndexes = getCardIndexesFromKey(cardPicksKey);
    const input = new Array(cards.length).fill(0);
    cardIndexes.forEach((index) => {
      input[index] += 1;
    });

    trainingData.push({ input, output: [winRate] });
  });

  const net = new NeuralNetwork<number[], number[]>();
  net.train(trainingData);

  const testInput = new Array(cards.length).fill(0);
  testInput[0] = 2;
  console.log(net.run(testInput));
}

function getWinRatesByCardPicks({ battleNumber }: { battleNumber: number }) {
  const winLossesByCardPicks = new Map<string, { wins: number; games: number }>();

  for (let i = 0; i < ITERATIONS; i++) {
    const { isWin, game } = runSimulation({ battleNumber });
    const key = getKeyFromCards(game.user.cards);

    const winLosses = winLossesByCardPicks.get(key) || { wins: 0, games: 0 };
    winLosses.games += 1;
    winLosses.wins += isWin ? 1 : 0;
    winLossesByCardPicks.set(key, winLosses);
  }

  const winRatesByCardPicks = new Map<string, number>();
  winLossesByCardPicks.forEach(({ wins, games }, key) => {
    winRatesByCardPicks.set(key, wins / games);
  });
  return winRatesByCardPicks;
}

// TODO: don't play all these games, just play the one game at the given battle number
function runSimulation({ battleNumber }: { battleNumber: number }) {
  const game = createInitialGameState();

  let isWin = false;
  while (game.screen !== 'gameEnd' && game.wins + game.losses < battleNumber) {
    addNewCards(game);

    const previousWins = game.wins;
    runBattle(game);
    isWin = game.wins > previousWins;
  }

  return { isWin, game };
}

function addNewCards(game: GameState) {
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
