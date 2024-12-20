import range from 'lodash/range';

import { potionByType, userCards } from '../../content/cards/cards';
import { allRelics, RelicType } from '../../content/relics';
import { assert } from '../../utils/asserts';
import {
  MAX_SHOCK,
  MAX_TURNS_IN_BATTLE,
  NUM_ADD_POTION_OPTIONS,
  NUM_ADD_RELIC_OPTIONS,
} from '../constants';
import {
  CardState,
  createGameState,
  GameState,
  PlayerState,
  RelicState,
  ShopType,
  statusEffectTypes,
} from '../gameState';
import {
  addCardsToPlayer,
  addFeatherCharm,
  applyCardOrderingEffects,
  breakChain,
  convertBasicAttacksToMonkAttack,
  getMatchingCards,
} from '../utils/cards';
import {
  getBattleWinner,
  getNextEnemy,
  getNumCardAddOptions,
  getPlayers,
  getRandom,
  getRelic,
} from '../utils/selectors';
import { applyCardEffects, applyHeal, getDamageDealt, reduceHealth } from './applyCardEffects';
import { BattleEvent, createBattleEvent } from './battleEvent';

// which shops to choose from after adding new cards
export function getShopOptions(game: GameState): ShopType[] {
  const { sample } = getRandom(game);
  const { wins } = game;

  // just add cards on the first round
  if (wins === 0) return [];

  const relicRounds = [1, 4, 6, 8];
  if (relicRounds.includes(wins)) return ['addRelics'];

  const shopOptions: ShopType[] = ['removeCards', 'chainCards', 'featherCards'];
  if (game.wins <= 7) {
    // no potions before the last boss
    shopOptions.push('addPotions');
  }

  return sample(shopOptions, 2);
}

export function getAddCardOptions(game: GameState): CardState[] {
  const { sample: sampleSize } = getRandom(game);

  const numOptions = getNumCardAddOptions(game);

  const cards = structuredClone(sampleSize(Object.values(userCards), numOptions));
  cards.forEach((card, i) => {
    card.acquiredId = i;
  });

  // monk relic
  if (getRelic(game.user, 'monk')) {
    convertBasicAttacksToMonkAttack(cards);
  }

  return cards;
}

export function getAddPotionOptions(game: GameState): CardState[] {
  const { sample: sampleSize } = getRandom(game);

  const cards = Object.values(potionByType);
  return structuredClone(sampleSize(cards, NUM_ADD_POTION_OPTIONS));
}

export function getAddRelicOptions(game: GameState): RelicState[] {
  const { sample: sampleSize } = getRandom(game);

  const existingRelicTypes = new Set(game.user.relics.map((relic) => relic.type));
  const availableRelics = allRelics.filter((relic) => !existingRelicTypes.has(relic.type));
  return structuredClone(sampleSize(availableRelics, NUM_ADD_RELIC_OPTIONS));
}

export function addCards(game: GameState, cards: CardState[]) {
  addCardsToPlayer(game.user, cards);
}

export function removeCards(game: GameState, cardsToRemove: CardState[]) {
  const { cards } = game.user;
  // remap cardsToRemove to the actual cards since game is a proxy object when using immer
  cardsToRemove = getMatchingCards(game.user.cards, cardsToRemove);
  cardsToRemove.forEach((card) => {
    breakChain(card, 'fromId', cards);
    breakChain(card, 'toId', cards);
  });

  game.user.cards = cards.filter((c) => !cardsToRemove.includes(c));
}

export function chainCards(game: GameState, cardsToChain: CardState[]) {
  assert(cardsToChain.length === 2, 'chaining more than 2 cards is not implemented');
  const { cards } = game.user;

  const [fromCard, toCard] = getMatchingCards(game.user.cards, cardsToChain);

  breakChain(fromCard, 'toId', cards);
  breakChain(toCard, 'fromId', cards);

  fromCard.chain.toId = toCard.acquiredId;
  toCard.chain.fromId = fromCard.acquiredId;
}

export function featherCards(game: GameState, cardsToFeather: CardState[]) {
  cardsToFeather = getMatchingCards(game.user.cards, cardsToFeather);
  cardsToFeather.forEach(addFeatherCharm);
}

export function addRelic(game: GameState, relic: RelicState) {
  game.user.relics.push(relic);

  if (relic.type === ('monk' satisfies RelicType)) {
    convertBasicAttacksToMonkAttack(game.user.cards);
  }
}

function shuffleCards(game: GameState, player: PlayerState) {
  const { shuffle } = getRandom(game);
  shuffle(player.cards);
  player.cards = applyCardOrderingEffects(player.cards);
}

function triggerStartOfBattleEffects(
  game: GameState,
  { self }: { self: PlayerState; opponent: PlayerState },
) {
  shuffleCards(game, self);

  // strengthAffectsHealing
  const strengthAffectsHealing = getRelic(self, 'strengthAffectsHealing');
  if (strengthAffectsHealing) {
    self.strength += strengthAffectsHealing.value;
  }

  // extraThickSkin
  const extraThickSkin = getRelic(self, 'extraThickSkin');
  if (extraThickSkin) {
    self.thickSkin += extraThickSkin.value;
  }
}

export function startBattle(game: GameState) {
  // TODO: this assert failed once after choosing relics
  assert(game.turn === 0);
  const { random } = getRandom(game);

  game.enemy = getNextEnemy(game);

  // increment the random state so the battle plays out differently after rewinding
  range(game.losses).forEach(random);

  const userPerspective = { self: game.user, opponent: game.enemy };
  const enemyPerspective = { self: game.enemy, opponent: game.user };

  triggerStartOfBattleEffects(game, userPerspective);
  triggerStartOfBattleEffects(game, enemyPerspective);

  // extraCardPlaysAtStart
  const extraCardPlaysAtStart = getRelic(game.user, 'extraCardPlaysAtStart');
  if (extraCardPlaysAtStart) {
    game.user.extraCardPlays += extraCardPlaysAtStart.value;
  }
}

export function startTurn(game: GameState): BattleEvent[] {
  const [activePlayer, nonActivePlayer] = getPlayers(game);

  activePlayer.damageDealtLastTurn = activePlayer.damageDealtThisTurn;
  activePlayer.damageDealtThisTurn = 0;

  const events: BattleEvent[] = [];
  const card = activePlayer.cards[activePlayer.currentCardIndex];
  const context = { game, events, card };

  activePlayer.temporaryDodge = 0;
  activePlayer.shock = 0;

  // delayedShock
  if (activePlayer.delayedShock > 0) {
    activePlayer.shock = activePlayer.delayedShock;
    activePlayer.delayedShock = 0;
  }

  // regen
  if (activePlayer.regen > 0) {
    applyHeal({ value: activePlayer.regen, target: 'self' }, context);
    activePlayer.regen -= 1;
  }

  // burn
  if (activePlayer.burn > 0) {
    reduceHealth({ value: activePlayer.burn, target: 'self' }, context);
    activePlayer.burn = Math.floor(activePlayer.burn / 2);
  }

  // permaBleed
  const permaBleed = getRelic(nonActivePlayer, 'permaBleed');
  if (permaBleed) {
    activePlayer.bleed += permaBleed.value;
  }

  // die if out of cards
  if (!card) {
    const damage = activePlayer.health;
    activePlayer.health = 0;
    return [createBattleEvent('damage', damage, 'self')];
  }

  // the player with the highest health wins after X turns
  if (game.turn >= MAX_TURNS_IN_BATTLE) {
    if (activePlayer.health >= nonActivePlayer.health) {
      // user wins
      const damage = nonActivePlayer.health;
      nonActivePlayer.health = 0;
      return [createBattleEvent('damage', damage, 'opponent')];
    }
    // enemy wins
    const damage = activePlayer.health;
    activePlayer.health = 0;
    return [createBattleEvent('damage', damage, 'self')];
  }

  return events;
}

export function playCard(game: GameState): BattleEvent[] {
  const [activePlayer, nonActivePlayer] = getPlayers(game);
  const card = activePlayer.cards[activePlayer.currentCardIndex];
  console.log(
    'A playCard, turn:',
    game.turn,
    'cardsPlayedThisTurn:',
    activePlayer.cardsPlayedThisTurn,
    'extraCardPlays:',
    activePlayer.extraCardPlays,
  );

  // stun
  if (activePlayer.stun > 0) {
    activePlayer.extraCardPlays = 0;
    return [];
  }

  if (activePlayer.cardsPlayedThisTurn > 0) {
    // TODO: this assert failed once
    assert(activePlayer.extraCardPlays > 0);
    activePlayer.extraCardPlays -= 1;
  }
  activePlayer.cardsPlayedThisTurn += 1;

  const events: BattleEvent[] = [];

  // play card
  const playCardEvents = applyCardEffects(game, card);
  events.push(...playCardEvents);

  // shock
  if (nonActivePlayer.shock >= MAX_SHOCK) {
    nonActivePlayer.shock -= MAX_SHOCK;
    nonActivePlayer.stun = Infinity;
  }

  activePlayer.previousCard = card;

  if (card.uses) {
    card.uses.current -= 1;
  }

  if (card.uses?.current === 0) {
    // permanently remove card
    activePlayer.cards.splice(activePlayer.currentCardIndex, 1);
    events.push(createBattleEvent('trashCard', card.acquiredId));
  } else if (card.trash) {
    // trash card
    activePlayer.trashedCards.push(card);
    activePlayer.cards.splice(activePlayer.currentCardIndex, 1);
    events.push(createBattleEvent('trashCard', card.acquiredId));
  } else {
    // discard card
    activePlayer.currentCardIndex += 1;
    events.push(createBattleEvent('discardCard', card.acquiredId));
  }

  if (activePlayer.currentCardIndex >= activePlayer.cards.length) {
    // shuffle deck
    activePlayer.currentCardIndex = 0;
    shuffleCards(game, activePlayer);
    events.push(createBattleEvent('shuffle'));
  }

  // calculate damage dealt
  const damageDealt = getDamageDealt(events);
  activePlayer.damageDealtThisTurn += damageDealt;

  return events;
}

export function endTurn(game: GameState) {
  const [activePlayer, nonActivePlayer] = getPlayers(game);
  console.log(
    'A end turn, turn:',
    game.turn,
    'cardsPlayedThisTurn:',
    activePlayer.cardsPlayedThisTurn,
    'extraCardPlays:',
    activePlayer.extraCardPlays,
  );

  assert(activePlayer.extraCardPlays === 0);

  activePlayer.temporaryFireCrit = 0;
  activePlayer.temporaryStrength = 0;
  activePlayer.stun = 0;

  // we set this here instead of startTurn because cardsPlayedThisTurn is used to determine if it's
  // the start of the turn
  nonActivePlayer.cardsPlayedThisTurn = 0;

  game.turn++;
}

function resetPlayerAfterBattle(player: PlayerState) {
  player.health = player.startingHealth;
  player.currentCardIndex = 0;
  player.cardsPlayedThisTurn = 0;
  player.damageDealtThisTurn = 0;
  player.damageDealtLastTurn = 0;
  player.previousCard = undefined;
  player.cards = [...player.trashedCards, ...player.cards];
  player.trashedCards = [];
  statusEffectTypes.forEach((statusEffectType) => {
    player[statusEffectType] = 0;
  });
}

export function endBattle(game: GameState) {
  const winner = getBattleWinner(game);
  winner === 'user' ? game.wins++ : game.losses++;

  game.turn = 0;
  console.log('A end battle, turn:', game.turn);

  resetPlayerAfterBattle(game.user);
}

// TODO?: rewind should change the random state? Reason: user has more options and is never in a spot
// where they want to intentionally lose to pick that one OP card/relic combo due to now knowing
// the future - it also breaks re-rolling if we add that later
export function rewind(game: GameState, previousGameState: GameState) {
  Object.assign(game, previousGameState);
  game.losses += 1;
}

export function resetGame(game: GameState) {
  Object.assign(game, createGameState());
}
