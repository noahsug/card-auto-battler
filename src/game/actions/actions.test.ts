import range from 'lodash/range';
import sample from 'lodash/sample';
import sampleSize from 'lodash/sampleSize';
import shuffle from 'lodash/shuffle';

import { getRandomSeed } from '../../utils/Random';
import {
  MAX_TURNS_IN_BATTLE,
  NUM_CARD_FEATHER_PICKS,
  NUM_CARD_REMOVAL_PICKS,
  NUM_CARD_SELECTION_PICKS,
  NUM_FIRST_CARD_SELECTION_PICKS,
} from '../constants';
import { CardState, createGameState, GameState, RelicState, ShopType } from '../gameState';
import { getChainCreatesLoop } from '../utils/cards';
import { getBattleWinner, getIsGameOver, getIsTurnOver } from '../utils/selectors';
import {
  addCards,
  addRelic,
  chainCards,
  endBattle,
  endTurn,
  featherCards,
  getAddCardOptions,
  getAddPotionOptions,
  getAddRelicOptions,
  getShopOptions,
  playCard,
  removeCards,
  rewind,
  startBattle,
  startTurn,
} from './actions';

type ChoiceFunctions = {
  chooseShop: (game: GameState, shopOptions: ShopType[]) => ShopType;
  chooseCardsToAdd: (game: GameState, cardOptions: CardState[]) => CardState[];
  chooseCardsToRemove: (game: GameState) => CardState[];
  chooseCardsToChain: (game: GameState) => CardState[];
  chooseRelicToAdd: (game: GameState, relicOptions: RelicState[]) => RelicState;
  chooseCardsToFeather: (game: GameState) => CardState[];
};

function play(game: GameState, choices: ChoiceFunctions) {
  let gameWinner = null;
  while (!gameWinner) {
    gameWinner = playRound(game, choices);
  }
  return gameWinner;
}

function playRound(game: GameState, choices: ChoiceFunctions) {
  const rewindGameState = structuredClone(game);
  makeSelections(game, choices);
  const winner = battle(game);

  if (winner === 'enemy') {
    rewind(game, rewindGameState);
  }

  return winner;
}

function makeSelections(
  game: GameState,
  {
    chooseShop,
    chooseCardsToAdd,
    chooseCardsToRemove,
    chooseCardsToChain,
    chooseRelicToAdd,
    chooseCardsToFeather,
  }: ChoiceFunctions,
) {
  // add cards
  const cardOptions = getAddCardOptions(game);
  const cardsToAdd = chooseCardsToAdd(game, cardOptions);
  addCards(game, cardsToAdd);

  // choose shop
  const shopOptions = getShopOptions(game);
  const shop = shopOptions.length === 2 ? chooseShop(game, shopOptions) : shopOptions[0];

  if (shop === 'removeCards') {
    const cards = chooseCardsToRemove(game);
    removeCards(game, cards);
  } else if (shop === 'addRelics') {
    const relicOptions = getAddRelicOptions(game);
    const relic = chooseRelicToAdd(game, relicOptions);
    addRelic(game, relic);
  } else if (shop === 'chainCards') {
    const cards = chooseCardsToChain(game);
    chainCards(game, cards);
  } else if (shop === 'addPotions') {
    const potionOptions = getAddPotionOptions(game);
    const potions = chooseCardsToAdd(game, potionOptions);
    addCards(game, potions);
  } else if (shop === 'featherCards') {
    const cards = chooseCardsToFeather(game);
    featherCards(game, cards);
  } else {
    shop satisfies never;
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

const chooseRandomCardsToChain: ChoiceFunctions['chooseCardsToChain'] = (game: GameState) => {
  const indexes = range(game.user.cards.length);
  const firstCardIndexes = shuffle(indexes);
  const secondCardIndexes = shuffle(indexes);

  let result: number[] = [];

  firstCardIndexes.forEach((firstIndex) => {
    if (result.length > 0) return;
    secondCardIndexes.forEach((secondIndex) => {
      if (result.length > 0) return;
      if (!getChainCreatesLoop(game.user.cards, firstIndex, secondIndex)) {
        result = [firstIndex, secondIndex];
      }
    });
  });

  if (result.length === 0) {
    console.log(
      'failed to chain:',
      game.user.cards.map((card) => card.chain),
    );
    throw new Error('unable to chain cards');
  }
  return result.map((index) => game.user.cards[index]);
};

const chooseRandomCardsToAdd: ChoiceFunctions['chooseCardsToAdd'] = (game, cards) => {
  const size = game.wins === 0 ? NUM_FIRST_CARD_SELECTION_PICKS : NUM_CARD_SELECTION_PICKS;
  return sampleSize(cards, size);
};

const randomPickActions: ChoiceFunctions = {
  chooseShop: (_, shops) => sample(shops)!,
  chooseCardsToAdd: chooseRandomCardsToAdd,
  chooseCardsToRemove: (game) => sampleSize(game.user.cards, NUM_CARD_REMOVAL_PICKS),
  chooseCardsToChain: chooseRandomCardsToChain,
  chooseRelicToAdd: (_, relics) => sample(relics)!,
  chooseCardsToFeather: (game) => sampleSize(game.user.cards, NUM_CARD_FEATHER_PICKS),
};

type ChoiceResults = {
  type: string;
  options: string[];
  picks: string[];
};

function trackPickActions(choices: ChoiceFunctions): {
  choices: ChoiceFunctions;
  results: ChoiceResults[];
} {
  const pickResults: ChoiceResults[] = [];
  const chooseShop = (game: GameState, shopOptions: ShopType[]) => {
    const pick = choices.chooseShop(game, shopOptions);
    pickResults.push({ type: 'chooseShop', options: shopOptions, picks: [pick] });
    return pick;
  };
  const chooseCardsToAdd = (game: GameState, cardOptions: CardState[]) => {
    const options = cardOptions.map((card) => card.name);
    const cardPicks = choices.chooseCardsToAdd(game, cardOptions);
    const picks = cardPicks.map((card) => card.name);
    pickResults.push({ type: 'chooseCardsToAdd', options, picks });
    return cardPicks;
  };
  const chooseCardsToRemove = (game: GameState) => {
    const options = game.user.cards.map((card) => card.name);
    const cardPicks = choices.chooseCardsToRemove(game);
    const picks = cardPicks.map((card) => card.name);
    pickResults.push({ type: 'chooseCardsToRemove', options, picks });
    return cardPicks;
  };
  const chooseCardsToChain = (game: GameState) => {
    const options = game.user.cards.map((card) => card.name);
    const cardPicks = choices.chooseCardsToChain(game);
    const picks = cardPicks.map((card) => card.name);
    pickResults.push({ type: 'chooseCardsToChain', options, picks });
    return cardPicks;
  };
  const chooseCardsToFeather = (game: GameState) => {
    const options = game.user.cards.map((card) => card.name);
    const cardPicks = choices.chooseCardsToFeather(game);
    const picks = cardPicks.map((card) => card.name);
    pickResults.push({ type: 'chooseCardsToFeather', options, picks });
    return cardPicks;
  };
  const chooseRelicToAdd = (game: GameState, relicOptions: RelicState[]) => {
    const options = relicOptions.map((relic) => relic.name);
    const relicPick = choices.chooseRelicToAdd(game, relicOptions);
    pickResults.push({ type: 'chooseRelicToAdd', options, picks: [relicPick.name] });
    return relicPick;
  };

  return {
    choices: {
      chooseShop,
      chooseCardsToAdd,
      chooseCardsToRemove,
      chooseCardsToChain,
      chooseRelicToAdd,
      chooseCardsToFeather,
    },
    results: pickResults,
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

it('shows the same card and relic selections after rewinding', () => {
  const { choices, results } = trackPickActions(randomPickActions);
  const game = createGameState();

  // force a win so we immediately choose relics
  game.wins = 1;

  let rewindGameState = structuredClone(game);
  makeSelections(game, choices);
  const beforeRewind = results.splice(0, results.length).map(({ options }) => options);

  battle(game);
  rewind(game, rewindGameState);
  rewindGameState = structuredClone(game);
  makeSelections(game, choices);
  const afterRewind1 = results.splice(0, results.length).map(({ options }) => options);

  battle(game);
  rewind(game, rewindGameState);
  makeSelections(game, choices);
  const afterRewind2 = results.splice(0, results.length).map(({ options }) => options);

  expect(beforeRewind).toEqual(afterRewind1);
  expect(beforeRewind).toEqual(afterRewind2);
});
