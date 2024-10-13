import { CardState, GameState, PlayerState, Target, createGameState } from './gameState';
import { getBattleWinner, getPlayers } from './utils';

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

export function addCard(game: GameState, card: CardState) {
  game.user.cards.push(card);
}

export function playCard(game: GameState): BattleEvent[] {
  const [activePlayer, nonActivePlayer] = getPlayers(game);

  const card = activePlayer.cards[activePlayer.currentCardIndex];

  nonActivePlayer.health -= card.damage;

  activePlayer.currentCardIndex += 1;
  if (activePlayer.currentCardIndex >= activePlayer.cards.length) {
    activePlayer.currentCardIndex = 0;
  }

  game.turn++;

  if (card.damage === 1 && Math.random() < 0.5) {
    return [{ type: 'miss', target: 'opponent' }];
  }
  if (card.damage < 0) {
    return [{ type: 'heal', target: 'opponent', value: -card.damage }];
  }
  return [{ type: 'damage', target: 'opponent', value: card.damage }];
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
  winner === 'user' ? game.wins++ : game.lives--;
  resetBattle(game);
}

export function resetGame(game: GameState) {
  Object.assign(game, createGameState());
}
