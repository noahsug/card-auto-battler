import cloneDeep from 'lodash/cloneDeep';
import range from 'lodash/range';

import { assert, assertIsNonNullable } from '../../utils/asserts';
import { MAX_SHOCK } from '../constants';
import {
  CardState,
  GameState,
  PlayerState,
  RelicState,
  createGameState,
  statusEffectNames,
} from '../gameState';
import { addCardsToPlayer } from '../utils/cards';
import { getBattleWinner, getPlayers, getRandom, getRelic } from '../utils/selectors';
import { applyCardEffects, applyHeal, getDamageDealt, reduceHealth } from './applyCardEffects';
import { BattleEvent, createBattleEvent } from './battleEvent';

export function addCards(game: GameState, cards: CardState[]) {
  game.rewindGameState = cloneDeep(game);
  addCardsToPlayer(game.user, cards);
}

export function removeCards(game: GameState, cardIndexes: number[]) {
  game.user.cards = game.user.cards.filter((_, index) => !cardIndexes.includes(index));
}

export function addRelic(game: GameState, relic: RelicState) {
  game.user.relics.push(relic);
}

function triggerStartOfBattleEffects(
  game: GameState,
  { self }: { self: PlayerState; opponent: PlayerState },
) {
  const { shuffle } = getRandom(game);

  shuffle(self.cards);

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

  game.undoGameState = cloneDeep(game);

  activePlayer.damageDealtLastTurn = activePlayer.damageDealtThisTurn;
  activePlayer.damageDealtThisTurn = 0;
  activePlayer.cardsPlayedThisTurn = 0;

  const events: BattleEvent[] = [];
  const card = activePlayer.cards[activePlayer.currentCardIndex];
  const context = { game, events, card };

  activePlayer.temporaryDodge = 0;

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

  return events;
}

export function playCard(game: GameState): BattleEvent[] {
  const [activePlayer, nonActivePlayer] = getPlayers(game);
  const card = activePlayer.cards[activePlayer.currentCardIndex];
  const { shuffle } = getRandom(game);

  // set undo point after the 2nd+ card is played (we skip the first card because an undo point is
  // set when the turn starts)
  if (activePlayer.cardsPlayedThisTurn > 0) {
    game.undoGameState = cloneDeep(game);
  }

  // die if out of cards
  if (!card) {
    const damage = activePlayer.health;
    activePlayer.health = 0;
    return [createBattleEvent('damage', damage, 'self')];
  }

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

  if (card.trash) {
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
    shuffle(activePlayer.cards);
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

  nonActivePlayer.shock = 0;

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
  game.undoGameState = undefined;

  resetPlayerAfterBattle(game.user);
  resetPlayerAfterBattle(game.enemy);

  game.enemy.startingHealth += 10;
  game.enemy.health = game.enemy.startingHealth;
}

export function undoPlayedCard(game: GameState) {
  assertIsNonNullable(game.undoGameState);
  Object.assign(game, game.undoGameState);
}

export function rewind(game: GameState) {
  assertIsNonNullable(game.rewindGameState);
  Object.assign(game, game.rewindGameState);
  game.losses += 1;
}

export function resetGame(game: GameState) {
  Object.assign(game, createGameState());
}
