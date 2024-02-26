import sample from 'lodash/sample';
import sampleSize from 'lodash/sampleSize';

import {
  createInitialGameState,
  enemyTypes,
  GameState,
  pickCards,
  EnemyType,
  getCanPlayCard,
  getIsBattleOver,
  MAX_WINS,
  CARD_SELECTION_PICKS,
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

interface AIContext {
  type: 'random' | 'random';
}

// const aiTypes = [...enemyTypes, 'random'] as const;
const aiTypes = ['random'] as const;

function run() {
  const data = {} as Record<EnemyType, { wins: number; losses: number }>;
  aiTypes.forEach((type) => {
    data[type] = { wins: 0, losses: 0 };
  });

  for (let i = 0; i < 50000; i++) {
    const type = sample(aiTypes);
    const isWin = runGame({ type });
    if (isWin) {
      data[type].wins += 1;
    } else {
      data[type].losses += 1;
    }
  }

  aiTypes.forEach((type) => {
    const { wins, losses } = data[type];
    console.log(type, wins / (wins + losses));
  });
}

function runGame(aiContext: AIContext) {
  const game = createInitialGameState();

  while (game.screen !== 'gameEnd') {
    addNewCards({ game, aiContext });
    runBattle(game);
  }
  return game.wins >= MAX_WINS;
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

  if (aiContext.type === 'random') {
    sampleSize(cards, CARD_SELECTION_PICKS).forEach((card) => addCard(game, card));
  } else {
    const cards = pickCards(aiContext.type);
    cards.forEach((card) => addCard(game, card));
  }
}

(() => {
  run();
})();
