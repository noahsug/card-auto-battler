import assert from 'assert';
import {
  MAX_LOSSES,
  MAX_WINS,
  NUM_STARTING_CARDS,
  bleedCard,
  damageStarterCard,
  extraPlayIfBleedCard,
  createInitialGameState,
  CardState,
  GameState,
} from '../../src/gameState';
import { startCardSelection, addCard, startBattle, endBattle } from '../../src/gameState/actions';
import { NUM_CARD_SELECTION_OPTIONS } from '../../src/gameState/constants';
import { runBattle } from './runGame';
import { percent } from '../../src/utils';

const ITERATIONS = 2000;

const BATTLE_NUMBER = Math.round((MAX_LOSSES + MAX_WINS) / 2);
const CARDS = [bleedCard, extraPlayIfBleedCard];
// const CARDS = [] as CardState[];
const FILLER_CARD = damageStarterCard;

export function findCardClusters() {
  const cards = CARDS;
  const battleNumber = BATTLE_NUMBER;
  const fillerCard = FILLER_CARD;

  const { numWins, numGames } = getCardsWinRate({ cards, battleNumber, fillerCard });
  console.log('win rate:', percent(numWins / numGames, 1));
}

function getCardsWinRate({
  cards,
  battleNumber,
  fillerCard,
}: {
  cards: CardState[];
  battleNumber: number;
  fillerCard: CardState;
}) {
  let numWins = 0;

  for (let i = 0; i < ITERATIONS; i++) {
    const userCards = getUserCards({ cards, battleNumber, fillerCard });
    const { isWin } = runSimulation({ userCards });
    if (isWin) {
      numWins += 1;
    }
  }

  return { numWins, numGames: ITERATIONS };
}

function getUserCards({
  cards,
  battleNumber,
  fillerCard,
}: {
  cards: CardState[];
  battleNumber: number;
  fillerCard: CardState;
}) {
  assert(battleNumber > 0);

  const userCards = cards.slice();

  const numFillerCards =
    NUM_STARTING_CARDS + battleNumber * NUM_CARD_SELECTION_OPTIONS - cards.length;
  assert(numFillerCards >= 0);

  for (let i = 0; i < numFillerCards; i++) {
    userCards.push(fillerCard);
  }

  return userCards;
}

function runSimulation({ userCards }: { userCards: CardState[] }) {
  const remainingUserCards = userCards.slice();

  const game = createInitialGameState();
  game.user.cards = remainingUserCards.splice(0, NUM_STARTING_CARDS);

  while (remainingUserCards.length > 0) {
    startCardSelection(game);
    const picks = remainingUserCards.splice(0, NUM_CARD_SELECTION_OPTIONS);
    picks.forEach((card) => addCard(game, card));

    if (remainingUserCards.length > 0) {
      runFakeBattle(game);
    }
  }

  const previousWins = game.wins;
  runBattle(game);
  return { game, isWin: game.wins > previousWins };
}

function runFakeBattle(game: GameState) {
  startBattle(game);

  // user wins unless they're one win away from ending the game
  const isUserWin = game.wins < MAX_WINS - 1;
  if (isUserWin) {
    game.enemy.health = 0;
  } else {
    game.user.health = 0;
  }

  endBattle(game);
}
