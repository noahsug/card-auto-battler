import { getRandomSeed } from '../../utils/Random';
import { CardState, createGameState, GameState, RelicState } from '../gameState';
import {
  addCards,
  addRelic,
  chainCards,
  endBattle,
  endTurn,
  getCardAddOptions,
  getRelicAddOptions,
  playCard,
  removeCards,
  rewind,
  startBattle,
  startTurn,
} from './actions';
import {
  getBattleWinner,
  getIsGameOver,
  getIsTurnOver,
  getNextPickAction,
} from '../utils/selectors';
import {
  MAX_TURNS_IN_BATTLE,
  NUM_CARD_REMOVAL_PICKS,
  NUM_CARD_SELECTION_PICKS,
} from '../constants';
import range from 'lodash/range';

type SelectCardsToAdd = (game: GameState, cardOptions: CardState[]) => CardState[];
type SelectCardsToRemove = (game: GameState) => number[];
type SelectCardsToChain = (game: GameState) => number[];
type SelectRelicToAdd = (game: GameState, relicOptions: RelicState[]) => RelicState;

type PickActions = {
  selectCardsToAdd: SelectCardsToAdd;
  selectCardsToRemove: SelectCardsToRemove;
  selectCardsToChain: SelectCardsToChain;
  selectRelicToAdd: SelectRelicToAdd;
};

function playOrLogSeed(pickActions: PickActions, seed: number) {
  try {
    play(pickActions, seed);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.log('failed on seed:', seed);
    throw error;
  }
}

function play(pickActions: PickActions, seed: number) {
  const game = createGameState(seed);

  let gameWinner = null;
  while (!gameWinner) {
    makeSelections(game, pickActions);
    gameWinner = battle(game);
  }

  return gameWinner;
}

function makeSelections(
  game: GameState,
  { selectCardsToAdd, selectCardsToRemove, selectCardsToChain, selectRelicToAdd }: PickActions,
) {
  const cardOptions = getCardAddOptions(game);
  const cardsToAdd = selectCardsToAdd(game, cardOptions);
  addCards(game, cardsToAdd);

  const nextPickAction = getNextPickAction(game);
  if (nextPickAction === 'removeCards') {
    const cardIndexes = selectCardsToRemove(game);
    removeCards(game, cardIndexes);
  } else if (nextPickAction === 'addRelic') {
    const relicOptions = getRelicAddOptions(game);
    const relic = selectRelicToAdd(game, relicOptions);
    addRelic(game, relic);
  } else if (nextPickAction === 'chainCards') {
    const cardIndexes = selectCardsToChain(game);
    chainCards(game, cardIndexes);
  }
}

function battle(game: GameState) {
  startBattle(game);

  for (let turn = 0; turn < MAX_TURNS_IN_BATTLE; turn++) {
    startTurn(game);
    const winner = playCards(game);
    if (winner) break;
    endTurn(game);
  }
  const winner = getBattleWinner(game);

  endBattle(game);

  if (getIsGameOver(game)) return winner;

  if (winner === 'enemy') {
    rewind(game);
  }
  return null;
}

function playCards(game: GameState) {
  playCard(game);

  const winner = getBattleWinner(game);
  if (winner) return winner;

  if (getIsTurnOver(game)) return null;

  return playCards(game);
}

const simplePickActions: PickActions = {
  selectCardsToAdd: (_, cards) => cards.slice(0, NUM_CARD_SELECTION_PICKS),
  selectCardsToRemove: () => range(NUM_CARD_REMOVAL_PICKS),
  selectCardsToChain: (game) => [game.user.cards.length - 2, game.user.cards.length - 1],
  selectRelicToAdd: (_, relics) => relics[0],
};

it('plays a full game without error', () => {
  for (let i = 0; i < 20; i++) {
    const seed = getRandomSeed();
    expect(() => playOrLogSeed(simplePickActions, seed)).not.toThrow();
  }
});

it('avoids invalid chain error', () => {
  const seed = 873466592;
  expect(() => playOrLogSeed(simplePickActions, seed)).not.toThrow();
});
