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
import { getBattleWinner, getPlayers, getRelic } from '../utils/selectors';
import { applyCardEffects } from './applyCardEffects';
import { BattleEvent, createDamageEvent, createHealEvent } from './battleEvent';

export function addCards(game: GameState, cards: CardState[]) {
  game.user.cards.push(...cards);
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
    activePlayer.health += activePlayer.regen;
    events.push(createHealEvent(activePlayer.regen, 'self', 'startOfTurn'));
    activePlayer.regen -= 1;
  }

  return events;
}

export function playCard(game: GameState): BattleEvent[] {
  const [activePlayer, nonActivePlayer] = getPlayers(game);
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
    return [createDamageEvent(damage, 'self', 'startOfTurn')];
  }

  if (activePlayer.cardsPlayedThisTurn > 0) {
    assert(activePlayer.extraCardPlays > 0);
    activePlayer.extraCardPlays -= 1;
  }
  activePlayer.cardsPlayedThisTurn += 1;

  // play card
  const playCardEvents = applyCardEffects(game, card);
  events.push(...playCardEvents);

  activePlayer.previousCard = card;
  activePlayer.currentCardIndex += 1;
  if (activePlayer.currentCardIndex >= activePlayer.cards.length) {
    activePlayer.currentCardIndex = 0;
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
