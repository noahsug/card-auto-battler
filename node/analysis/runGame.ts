import {
  createInitialGameState,
  MAX_WINS,
  GameState,
  getCanPlayCard,
  getIsBattleOver,
  CardState,
  getIsEnemyTurn,
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
    // console.log(
    //   'start battle',
    //   game.user.cards.map((c) => c.name),
    //   game.enemy.cards.map((c) => c.name),
    // );
  }

  startTurn(game);

  while (getCanPlayCard(game)) {
    // if (!getIsEnemyTurn(game)) {
    //   console.log(game.user.health, game.enemy.health);
    // }
    playCard(game);

    if (getIsBattleOver(game)) {
      // console.log(game.user.health, game.enemy.health);
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
