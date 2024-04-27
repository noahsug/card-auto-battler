import {
  createInitialGameState,
  MAX_WINS,
  GameState,
  getCanPlayCard,
  getIsBattleOver,
  CardState,
} from '../../src/gameState';
import {
  endBattle,
  endTurn,
  playCard,
  startTurn,
  startBattle,
  addCard,
  startCardSelection,
} from '../../src/gameState/actions';
import { getCardSelectionsForBattle } from '../../src/gameState/cardSelection';

export type PickCards = (args: { game: GameState; cards: CardState[] }) => CardState[];

export default function runGame({ pickCards }: { pickCards: PickCards }) {
  const game = createInitialGameState();

  while (game.screen !== 'gameEnd') {
    addNewCards(game, { pickCards });
    runBattle(game);
  }
  return { game, isWin: game.wins >= MAX_WINS };
}

export function runBattle(game: GameState) {
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

function addNewCards(game: GameState, { pickCards }: { pickCards: PickCards }) {
  startCardSelection(game);

  const cards = getCardSelectionsForBattle();

  const picks = pickCards({ game, cards });
  picks.forEach((card) => addCard(game, card));
}
