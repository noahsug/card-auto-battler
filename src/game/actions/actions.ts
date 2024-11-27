import range from 'lodash/range';

import { allCards } from '../../content/cards';
import { allRelics, RelicName } from '../../content/relics';
import { assert } from '../../utils/asserts';
import {
  MAX_SHOCK,
  MAX_TURNS_IN_BATTLE,
  NUM_CARD_SELECTION_OPTIONS,
  NUM_POTION_SELECTION_OPTIONS,
  NUM_RELIC_SELECTION_OPTIONS,
  NUM_FIRST_CARD_SELECTION_OPTIONS,
} from '../constants';
import {
  CardState,
  GameState,
  PlayerState,
  RelicState,
  createGameState,
  statusEffectNames,
} from '../gameState';
import { addCardsToPlayer, convertBasicAttacksToMonkAttack } from '../utils/cards';
import { getBattleWinner, getPlayers, getRandom, getRelic } from '../utils/selectors';
import { applyCardEffects, applyHeal, getDamageDealt, reduceHealth } from './applyCardEffects';
import { applyCardOrderingEffects, breakChain } from './applyCardOrderingEffects';
import { BattleEvent, createBattleEvent } from './battleEvent';
import { potionByName } from '../../content/cards/cards';

export type ShopName = 'removeCards' | 'chainCards' | 'addRelics' | 'addPotions';

// which shops to choose from after adding new cards
export function getShopOptions(game: GameState): ShopName[] {
  const { wins } = game;

  // just add cards on the first round
  if (wins === 0) return [];

  const relicRounds = [1, 4, 6, 8];
  if (relicRounds.includes(wins)) return ['addRelics'];

  const { sampleSize } = getRandom(game);

  const potionRounds = [3, 5, 7]; // no potions for final boss (aka no rounds 8 or 9)
  const otherShopOptions: ShopName[] = sampleSize(['removeCards', 'chainCards'], 2);

  if (potionRounds.includes(wins)) {
    return [otherShopOptions[0], 'addPotions'];
  }

  return otherShopOptions;
}

export function getAddCardsOptions(game: GameState): CardState[] {
  const { sampleSize } = getRandom(game);

  const numOptions =
    game.wins === 0 ? NUM_FIRST_CARD_SELECTION_OPTIONS : NUM_CARD_SELECTION_OPTIONS;

  const cards = structuredClone(sampleSize(Object.values(allCards), numOptions));
  cards.forEach((card, i) => {
    card.acquiredId = i;
  });

  // monk relic
  if (getRelic(game.user, 'monk')) {
    convertBasicAttacksToMonkAttack(cards);
  }

  return cards;
}

export function getPotionAddOptions(game: GameState): CardState[] {
  const { sampleSize } = getRandom(game);

  const cards = Object.values(potionByName);
  return structuredClone(sampleSize(cards, NUM_POTION_SELECTION_OPTIONS));
}

export function getRelicAddOptions(game: GameState): RelicState[] {
  const { sampleSize } = getRandom(game);

  const existingRelicNames = new Set(game.user.relics.map((relic) => relic.name));
  const availableRelics = allRelics.filter((relic) => !existingRelicNames.has(relic.name));
  return structuredClone(sampleSize(availableRelics, NUM_RELIC_SELECTION_OPTIONS));
}

export function addCards(game: GameState, cards: CardState[]) {
  addCardsToPlayer(game.user, cards);
}

export function removeCards(game: GameState, cardIndexes: number[]) {
  const { cards } = game.user;
  const cardsToRemove = cards.filter((_, index) => cardIndexes.includes(index));
  cardsToRemove.forEach((card) => {
    breakChain(card, 'fromId', cards);
    breakChain(card, 'toId', cards);
  });

  game.user.cards = game.user.cards.filter((_, index) => !cardIndexes.includes(index));
}

export function chainCards(game: GameState, cardIndexes: number[]) {
  assert(cardIndexes.length === 2, 'must select exactly 2 cards to chain');
  const { cards } = game.user;
  const [fromCard, toCard] = cardIndexes.map((index) => cards[index]);

  breakChain(fromCard, 'toId', cards);
  fromCard.chain.toId = toCard.acquiredId;

  breakChain(toCard, 'fromId', cards);
  toCard.chain.fromId = fromCard.acquiredId;
}

export function addRelic(game: GameState, relic: RelicState) {
  game.user.relics.push(relic);

  if (relic.name === ('monk' satisfies RelicName)) {
    convertBasicAttacksToMonkAttack(game.user.cards);
  }
}

function shuffleCards(game: GameState, player: PlayerState) {
  const { shuffle } = getRandom(game);
  shuffle(player.cards);
  applyCardOrderingEffects(player.cards);
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
}

export function startBattle(game: GameState) {
  assert(game.turn === 0);
  const { random } = getRandom(game);

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
  if (nonActivePlayer.bleed === 0) {
    const permaBleed = getRelic(activePlayer, 'permaBleed');
    if (permaBleed) {
      nonActivePlayer.bleed += permaBleed.value;
    }
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

  // stun
  if (activePlayer.stun > 0) {
    activePlayer.extraCardPlays = 0;
    return [];
  }

  if (activePlayer.cardsPlayedThisTurn > 0) {
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
    nonActivePlayer.stun = 1;
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
  statusEffectNames.forEach((statusEffectName) => {
    player[statusEffectName] = 0;
  });
}

export function endBattle(game: GameState) {
  const winner = getBattleWinner(game);
  winner === 'user' ? game.wins++ : game.losses++;

  game.turn = 0;

  resetPlayerAfterBattle(game.user);
  resetPlayerAfterBattle(game.enemy);

  game.enemy.startingHealth += 10;
  game.enemy.health = game.enemy.startingHealth;
}

// TODO: rewind should change the random state? Reason: user has more options and is never in a spot
// where they want to intentionally lose to pick that one OP card/relic combo due to now knowing
// the future - it also breaks re-rolling if we add that later
export function rewind(game: GameState, previousGameState: GameState) {
  Object.assign(game, previousGameState);
  game.losses += 1;
}

export function resetGame(game: GameState) {
  Object.assign(game, createGameState());
}
