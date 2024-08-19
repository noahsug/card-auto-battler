import { input } from '@inquirer/prompts';
import chalk from 'chalk';

import {
  validateNumPlayers,
  PlayerStrategy,
  createBoard,
  dealStartingCards,
  Board,
  Card,
  setStartingCards,
  playCards,
  getRoundWinner,
} from './engine';
import { UserInputStrategy } from './UserInputStrategy';
import { RandomStrategy } from './RandomStrategy';
import { getReadableCards } from './common';

async function promptForNumPlayers() {
  const numPlayersInput = await input({
    message: 'How many players?',
    default: '2',
    validate: (input) => {
      const numPlayers = parseInt(input, 10);
      if (isNaN(numPlayers)) return 'Please enter a number';
      return validateNumPlayers(numPlayers);
    },
  });
  return parseInt(numPlayersInput, 10);
}

async function pickStartingCards({ players }: Board, playerStrategies: PlayerStrategy[]) {
  const cardsDealtByPlayerIndex = dealStartingCards(players.length);
  const cardsKeptByPlayerIndex: Card[][] = Array.from({ length: players.length });

  for await (const [i] of players.entries()) {
    const strategy = playerStrategies[i];
    const dealtCards = cardsDealtByPlayerIndex[i];

    const startingCards = await strategy.pickStartingCards(dealtCards);
    cardsKeptByPlayerIndex[i] = startingCards;
  }

  return cardsKeptByPlayerIndex;
}

async function play() {
  const numPlayers = await promptForNumPlayers();
  console.log('Playing with', numPlayers, 'players');

  const playerStrategies: PlayerStrategy[] = Array.from({ length: numPlayers });
  playerStrategies[0] = new UserInputStrategy();
  for (let i = 1; i < numPlayers; i++) {
    playerStrategies[i] = new RandomStrategy();
  }

  const board = createBoard(numPlayers);

  const startingCardsByPlayer = await pickStartingCards(board, playerStrategies);
  setStartingCards(board, startingCardsByPlayer);

  for (let i = 0; i < 10; i++) {
    console.log('------- Round', i + 1, '-------');

    const cardsPlayedByPlayer: Card[][] = board.players.map((player) => {
      return playCards(player);
    });

    const winner = getRoundWinner(cardsPlayedByPlayer);

    for (const [i, cardsPlayed] of cardsPlayedByPlayer.entries()) {
      const isWinner = i === winner;
      const winnerText = isWinner ? chalk.yellow(' (W)') : '';
      console.log(`P${i}: ${getReadableCards(cardsPlayed)}${winnerText}`);
    }
  }
}

play();
