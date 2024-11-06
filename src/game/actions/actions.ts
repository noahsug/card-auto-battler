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
import { applyCardEffects, applyHeal } from './applyCardEffects';
import { BattleEvent, createDamageEvent, createCardEvent, createShuffleEvent } from './battleEvent';

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

function startTurn(game: GameState) {
  const [activePlayer] = getPlayers(game);
  const events: BattleEvent[] = [];

  activePlayer.damageDealtLastTurn = activePlayer.damageDealtThisTurn;
  activePlayer.damageDealtThisTurn = 0;

  if (activePlayer.regen > 0) {
    // regen
    applyHeal({ value: activePlayer.regen, target: 'self' }, { game, events });
    activePlayer.regen -= 1;
  }
  return events;
}

export function playCard(game: GameState): BattleEvent[] {
  const [activePlayer] = getPlayers(game);
  const events: BattleEvent[] = [];

  if (activePlayer.cardsPlayedThisTurn === 0) {
    if (game.turn === 0) {
      startBattle(game);
    }
    const startTurnEvents = startTurn(game);
    events.push(...startTurnEvents);
  }

  const card = activePlayer.cards[activePlayer.currentCardIndex];

  // die if out of cards
  if (card == null) {
    const damage = activePlayer.health;
    activePlayer.health = 0;
    return [createDamageEvent(damage, 'self')];
  }

  if (activePlayer.cardsPlayedThisTurn > 0) {
    assert(activePlayer.extraCardPlays > 0);
    activePlayer.extraCardPlays -= 1;
  }
  activePlayer.cardsPlayedThisTurn += 1;

  // play card
  events.push(createCardEvent('cardPlayed', card.acquiredId));
  const playCardEvents = applyCardEffects(game, card);
  events.push(...playCardEvents);

  activePlayer.previousCard = card;

  if (card.trash) {
    // trash card
    activePlayer.trashedCards.push(card);
    activePlayer.cards.splice(activePlayer.currentCardIndex, 1);
    events.push(createCardEvent('cardTrashed', card.acquiredId));
  } else {
    // discard card
    activePlayer.currentCardIndex += 1;
    events.push(createCardEvent('cardDiscarded', card.acquiredId));
  }

  if (activePlayer.currentCardIndex >= activePlayer.cards.length) {
    // shuffle deck
    activePlayer.currentCardIndex = 0;
    activePlayer.cards = shuffle(activePlayer.cards);
    events.push(createShuffleEvent());
  }

  const damageDealt = events.reduce((damageDealt, event) => {
    if (event.type === 'damage' && event.target === 'opponent') {
      damageDealt += event.value;
    }
    return damageDealt;
  }, 0);
  activePlayer.damageDealtThisTurn += damageDealt;

  if (activePlayer.extraCardPlays === 0) {
    activePlayer.cardsPlayedThisTurn = 0;
    game.turn++;
  }

  return events;
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
