import shuffle from 'lodash/shuffle';

import { assert } from '../../utils/asserts';
import {
  CardState,
  GameState,
  PlayerState,
  RelicState,
  createGameState,
  statusEffectNames,
} from '../gameState';
import { addCardsToPlayer } from '../utils/cards';
import { getBattleWinner, getPlayers, getRelic } from '../utils/selectors';
import { applyCardEffects, applyHeal, reduceHealth } from './applyCardEffects';
import { BattleEvent, createBattleEvent } from './battleEvent';

export function addCards(game: GameState, cards: CardState[]) {
  addCardsToPlayer(game.user, cards);
  game.user.cards = shuffle(game.user.cards);
}

export function addRelic(game: GameState, relic: RelicState) {
  game.user.relics.push(relic);
}

function triggerStartOfBattleEffects({
  self,
  opponent,
}: {
  self: PlayerState;
  opponent: PlayerState;
}) {
  // permaBleed
  const permaBleed = getRelic(self, 'permaBleed');
  if (permaBleed) {
    opponent.bleed += permaBleed.value;
  }

  // strengthAffectsHealing
  const strengthAffectsHealing = getRelic(self, 'strengthAffectsHealing');
  if (strengthAffectsHealing) {
    self.strength += strengthAffectsHealing.value;
  }
}

function startBattle(game: GameState) {
  const userPerspective = { self: game.user, opponent: game.enemy };
  const enemyPerspective = { self: game.enemy, opponent: game.user };

  triggerStartOfBattleEffects(userPerspective);
  triggerStartOfBattleEffects(enemyPerspective);
}

export function startTurn(game: GameState): BattleEvent[] {
  // start battle
  if (game.turn === 0) {
    startBattle(game);
  }

  const [activePlayer] = getPlayers(game);

  activePlayer.damageDealtLastTurn = activePlayer.damageDealtThisTurn;
  activePlayer.damageDealtThisTurn = 0;
  activePlayer.cardsPlayedThisTurn = 0;

  // die if out of cards
  if (activePlayer.cards.length === 0) {
    const damage = activePlayer.health;
    activePlayer.health = 0;
    return [createBattleEvent('damage', damage, 'self')];
  }

  const events: BattleEvent[] = [];
  const card = activePlayer.cards[activePlayer.currentCardIndex];
  const context = { game, events, card };

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

  return events;
}

export function playCard(game: GameState): BattleEvent[] {
  const [activePlayer] = getPlayers(game);
  const events: BattleEvent[] = [];
  const card = activePlayer.cards[activePlayer.currentCardIndex];

  if (activePlayer.cardsPlayedThisTurn > 0) {
    assert(activePlayer.extraCardPlays > 0);
    activePlayer.extraCardPlays -= 1;
  }
  activePlayer.cardsPlayedThisTurn += 1;

  // play card
  const playCardEvents = applyCardEffects(game, card);
  events.push(...playCardEvents);

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
    activePlayer.cards = shuffle(activePlayer.cards);
    events.push(createBattleEvent('shuffle'));
  }

  // calculate damage dealt
  const damageDealt = events.reduce((damageDealt, event) => {
    if (event.type === 'damage' && event.target === 'opponent') {
      damageDealt += event.value;
    }
    return damageDealt;
  }, 0);
  activePlayer.damageDealtThisTurn += damageDealt;

  return events;
}

export function endTurn(game: GameState) {
  const [activePlayer] = getPlayers(game);
  assert(activePlayer.extraCardPlays === 0);

  activePlayer.channel = 0;

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
}

export function resetGame(game: GameState) {
  Object.assign(game, createGameState());
}
