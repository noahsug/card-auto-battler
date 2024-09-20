import { GameState, PlayerState } from './gameState';
import { getPlayers } from './utils';

export function playCard(game: GameState) {
  const [activePlayer, nonActivePlayer] = getPlayers(game);

  const card = activePlayer.cards[activePlayer.currentCardIndex];

  nonActivePlayer.health -= card.damage;
  activePlayer.currentCardIndex++;

  game.turn++;
}

function resetPlayer(player: PlayerState) {
  player.health = player.startingHealth;
  player.currentCardIndex = 0;
}

export function resetBattle({ user, enemy }: GameState) {
  resetPlayer(user);
  resetPlayer(enemy);
}
