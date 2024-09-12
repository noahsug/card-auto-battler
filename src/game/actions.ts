import { GameState, PlayerState } from './gameState';

export function playCard({ user, enemy }: GameState) {
  const card = user.cards[user.currentCardIndex];
  enemy.health -= card.damage;
  user.currentCardIndex++;
}

function resetPlayer(player: PlayerState) {
  player.health = player.startingHealth;
  player.currentCardIndex = 0;
}

export function resetBattle({ user, enemy }: GameState) {
  resetPlayer(user);
  resetPlayer(enemy);
}
