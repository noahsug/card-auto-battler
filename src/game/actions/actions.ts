import shuffle from 'lodash/shuffle';

import { assert } from '../../utils/asserts';
import {
  CardState,
  GameState,
  PlayerState,
  RelicState,
  Target,
  createGameState,
  statusEffectNames,
} from '../gameState';
import { getBattleWinner, getPlayers } from '../utils/selectors';
import { applyCardEffects } from './applyCardEffects';

interface MissBattleEvent {
  type: 'miss';
  target: Target;
}

interface BattleEventWithValue {
  type: 'damage' | 'heal';
  target: Target;
  value: number;
}

export type BattleEvent = MissBattleEvent | BattleEventWithValue;

export function addCards(game: GameState, cards: CardState[]) {
  game.user.cards.push(...cards);
  game.user.cards = shuffle(game.user.cards);
}

export function addRelic(game: GameState, relic: RelicState) {
  game.user.relics.push(relic);
}

function applyRelicStatusEffects({ self, opponent }: { self: PlayerState; opponent: PlayerState }) {
  self.relics.forEach((relic) => {
    const { target, statusEffectName, value } = relic.effect;
    const targetPlayer = target === 'self' ? self : opponent;
    targetPlayer[statusEffectName] += value;
  });
}

function triggerStartOfBattleEffects({ self }: { self: PlayerState; opponent: PlayerState }) {
  // permaBleed
  if (self.permaBleed > 0) {
    self.bleed += self.permaBleed;
  }
}

export function startBattle(game: GameState) {
  const userPerspective = { self: game.user, opponent: game.enemy };
  const enemyPerspective = { self: game.enemy, opponent: game.user };

  applyRelicStatusEffects(userPerspective);
  applyRelicStatusEffects(enemyPerspective);

  triggerStartOfBattleEffects(userPerspective);
  triggerStartOfBattleEffects(enemyPerspective);
}

export function playCard(game: GameState): BattleEvent[] {
  const [activePlayer, nonActivePlayer] = getPlayers(game);

  const card = activePlayer.cards[activePlayer.currentCardIndex];

  // die if out of cards
  if (card == null) {
    const damage = activePlayer.health;
    activePlayer.health = 0;
    return [{ type: 'damage', target: 'self', value: damage }];
  }

  if (activePlayer.cardsPlayedThisTurn > 0) {
    assert(activePlayer.extraCardPlays > 0);
    activePlayer.extraCardPlays -= 1;
  }
  activePlayer.cardsPlayedThisTurn += 1;

  // play card
  const events = applyCardEffects(card, { game, self: activePlayer, opponent: nonActivePlayer });

  activePlayer.currentCardIndex += 1;
  if (activePlayer.currentCardIndex >= activePlayer.cards.length) {
    activePlayer.currentCardIndex = 0;
  }

  if (activePlayer.extraCardPlays === 0) {
    activePlayer.cardsPlayedThisTurn = 0;
    game.turn++;
  }

  return events;
}

function resetPlayerAfterBattle(player: PlayerState) {
  player.health = player.startingHealth;
  player.currentCardIndex = 0;
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
