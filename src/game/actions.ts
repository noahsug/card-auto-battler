import { GameState, PlayerState, Target } from './gameState';
import { getIsUserTurn, getPlayers, getUserTarget } from './utils';

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

export function playCard(game: GameState): BattleEvent[] {
  const [activePlayer, nonActivePlayer] = getPlayers(game);

  const card = activePlayer.cards[activePlayer.currentCardIndex];

  nonActivePlayer.health -= card.damage;
  activePlayer.currentCardIndex++;

  game.turn++;

  return [{ type: 'damage', target: 'opponent', value: card.damage }];
}

function resetPlayer(player: PlayerState) {
  player.health = player.startingHealth;
  player.currentCardIndex = 0;
}

export function resetBattle({ user, enemy }: GameState) {
  resetPlayer(user);
  resetPlayer(enemy);
}
