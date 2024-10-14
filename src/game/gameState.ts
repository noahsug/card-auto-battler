import { allCards } from '../content/cards';
import { allHeroes } from '../content/heroes';
import { allEnemies } from '../content/enemies';
import { STARTING_HEALTH } from './constants';

export type Target = 'self' | 'opponent';

export interface CardState {
  name: string;
  description: string;
  image: string;
  damage: number;
}

export interface PlayerState {
  health: number;
  startingHealth: number;
  cards: CardState[];
  currentCardIndex: number;
  name: string;
  image: string;
}

export interface GameState {
  user: PlayerState;
  enemy: PlayerState;
  turn: number;
  wins: number;
  losses: number;
}

function createPlayer({ name, image }: { name: string; image: string }): PlayerState {
  return {
    health: STARTING_HEALTH,
    startingHealth: STARTING_HEALTH,
    cards: [],
    currentCardIndex: 0,
    name,
    image,
  };
}

export function createGameState(): GameState {
  const { punch, fireball, eviscerate } = allCards;

  const user = createPlayer(allHeroes.warrior);
  user.cards = [punch, fireball, eviscerate];

  const enemy = createPlayer(allEnemies.fireMonster);
  enemy.cards = [fireball, fireball, fireball];

  return {
    user,
    enemy,
    turn: 0,
    wins: 0,
    losses: 0,
  };
}
