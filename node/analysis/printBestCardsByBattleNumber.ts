import { NeuralNetwork } from 'brain.js';

import { cards } from '../../src/gameState/cards';

export default function printBestCardsByBattleNumber() {
  const winRatesByCardPicks = getWinRatesByCardPicks({ battleNumber: 1 });

  const trainingData = [] as { input: number[]; output: number[] }[];
  Object.entries(winRatesByCardPicks).forEach(([cardPicksKey, winRate]) => {
    const cardIndexes = getCardPicksFromKey(cardPicksKey);
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
  return {
    '0,0': 0.5,
    '0,1': 0.4,
    '0,2': 0.6,
    '0,3': 0.3,
  };
}

function getCardPicksFromKey(key: string) {
  return key.split(',').map(Number);
}
