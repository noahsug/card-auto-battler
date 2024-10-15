import { CardState, GameState, PlayerState, Target, createGameState } from './gameState';
import { getBattleWinner, getPlayers } from './utils/selectors';
import { applyCardEffects } from './applyCardEffects';
import { assertEqual, assert } from '../utils/asserts';

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
  const events = applyCardEffects(card, { self: activePlayer, opponent: nonActivePlayer });

  activePlayer.currentCardIndex += 1;
  if (activePlayer.currentCardIndex >= activePlayer.cards.length) {
    activePlayer.currentCardIndex = 0;
  }

  if (activePlayer.extraCardPlays === 0) {
    game.turn++;
  }

  return events;
}

function resetBattlePlayer(player: PlayerState) {
  player.health = player.startingHealth;
  player.currentCardIndex = 0;
}

function resetBattle({ user, enemy }: GameState) {
  resetBattlePlayer(user);
  resetBattlePlayer(enemy);
}

export function endBattle(game: GameState) {
  const winner = getBattleWinner(game);
  winner === 'user' ? game.wins++ : game.losses++;
  resetBattle(game);
}

export function resetGame(game: GameState) {
  Object.assign(game, createGameState());
}
