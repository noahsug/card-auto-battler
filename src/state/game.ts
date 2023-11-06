import { PlayerState, createPlayerState } from './player'

export interface GameState {
  players: [PlayerState, PlayerState];
}

const deck1 = [
  { text: 'dmg 5' },
  { text: 'dmg 5' },
  { text: 'dmg 5' },
  { text: 'dmg 3' },
  { text: 'dmg 3' },
  { text: 'dmg 3' },
]

const deck2 = [
  { text: 'dmg 5' },
  { text: 'dmg 5' },
  { text: 'dmg 5' },
  { text: 'dmg 3' },
  { text: 'dmg 3' },
  { text: 'dmg 3' },
]

export function createGameState(): GameState {
  const player1 = createPlayerState();
  const player2 = createPlayerState();

  player1.cards = deck1.slice();
  player2.cards = deck2.slice();

  return {
    players: [player1, player2],
  }
}

export function getP1(state: GameState) {
  return state.players[0];
}
export function getP2(state: GameState) {
  return state.players[1];
}
