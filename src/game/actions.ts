import { GameState, PlayerState, Target } from './gameState';
import { getIsUserTurn, getPlayers } from './utils';

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

  if (nonActivePlayer.health <= 0) {
    game.wonLastBattle = getIsUserTurn(game);
  }

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

function resetPlayer(player: PlayerState) {
  player.health = player.startingHealth;
  player.currentCardIndex = 0;
}

export function resetBattle({ user, enemy }: GameState) {
  resetPlayer(user);
  resetPlayer(enemy);
}
