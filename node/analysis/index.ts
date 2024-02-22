import sample from 'lodash/sample';

import {
  createInitialGameState,
  enemyTypes,
  GameState,
  pickCards,
  EnemyType,
  getCanPlayCard,
  getIsBattleOver,
  MAX_WINS,
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

interface AIContext {
  type: EnemyType;
}

function run() {
  const data = {} as Record<EnemyType, { wins: number; losses: number }>;
  enemyTypes.forEach((type) => {
    data[type] = { wins: 0, losses: 0 };
  });

  for (let i = 0; i < 100000; i++) {
    const type = sample(enemyTypes);
    const isWin = runGame({ type });
    if (isWin) {
      data[type].wins += 1;
    } else {
      data[type].losses += 1;
    }
  }

  enemyTypes.forEach((type) => {
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
  const cards = pickCards(aiContext.type);
  cards.forEach((card) => addCard(game, card));
}

(() => {
  run();
})();
