import range from 'lodash/range';
import sampleSize from 'lodash/sampleSize';
import sample from 'lodash/sample';

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

function play(game: GameState, pickActions: PickActions) {
  let gameWinner = null;
  while (!gameWinner) {
    gameWinner = playRound(game, pickActions);
  }
  return gameWinner;
}

function playRound(game: GameState, pickActions: PickActions) {
  makeSelections(game, pickActions);
  const winner = battle(game);

  if (winner === 'enemy') {
    rewind(game);
  }

  return winner;
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

const randomPickActions: PickActions = {
  selectCardsToAdd: (_, cards) => sampleSize(cards, NUM_CARD_SELECTION_PICKS),
  selectCardsToRemove: (game) => sampleSize(range(game.user.cards.length)),
  // TODO: make random but smart about which cards to chain
  selectCardsToChain: simplePickActions.selectCardsToChain,
  selectRelicToAdd: (_, relics) => sample(relics)!,
};

type PickResults = {
  type: string;
  options?: CardState[] | RelicState[];
  picks: CardState[] | RelicState[];
};

function trackPickActions(pickActions: PickActions): {
  pickActions: PickActions;
  pickResults: PickResults[];
} {
  const pickResults: PickResults[] = [];
  const selectCardsToAdd = (game: GameState, cardOptions: CardState[]) => {
    const picks = pickActions.selectCardsToAdd(game, cardOptions);
    pickResults.push({ type: 'selectCardsToAdd', options: cardOptions, picks });
    return picks;
  };
  const selectCardsToRemove = (game: GameState) => {
    const pickIndexes = pickActions.selectCardsToRemove(game);
    const picks = pickIndexes.map((index) => game.user.cards[index]);
    pickResults.push({ type: 'selectCardsToRemove', picks });
    return pickIndexes;
  };
  const selectCardsToChain = (game: GameState) => {
    const pickIndexes = pickActions.selectCardsToChain(game);
    const picks = pickIndexes.map((index) => game.user.cards[index]);
    pickResults.push({ type: 'selectCardsToChain', picks });
    return pickIndexes;
  };
  const selectRelicToAdd = (game: GameState, relicOptions: RelicState[]) => {
    const pick = pickActions.selectRelicToAdd(game, relicOptions);
    pickResults.push({ type: 'selectRelicToAdd', options: relicOptions, picks: [pick] });
    return pick;
  };

  return {
    pickActions: {
      selectCardsToAdd,
      selectCardsToRemove,
      selectCardsToChain,
      selectRelicToAdd,
    },
    pickResults,
  };
}

it('plays a full game without error', () => {
  for (let i = 0; i < 5; i++) {
    const seed = getRandomSeed();
    const game = createGameState(seed);

    try {
      play(game, randomPickActions);
    } catch (error) {
      console.log('failed on seed:', seed);
      expect(error).toBeUndefined();
    }
  }
});

it('avoids invalid chain error', () => {
  const seed = 873466592;
  const game = createGameState(seed);

  expect(() => play(game, simplePickActions)).not.toThrow();
});

it('shows the same pick options after rewinding', () => {
  const { pickActions, pickResults } = trackPickActions(randomPickActions);

  const game = createGameState();

  // force a win so we immediately select relics
  game.wins = 1;

  makeSelections(game, pickActions);
  battle(game);
  rewind(game);
  makeSelections(game, pickActions);

  const options = pickResults.map(({ options }) => (options || []).map((pick) => pick.name));
  const beforeRewind = options.slice(0, 2);
  const afterRewind = options.slice(2);

  expect(beforeRewind).toEqual(afterRewind);
});
