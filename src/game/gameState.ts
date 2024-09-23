import { allCards } from '../content/cards';
import { allHeroes } from '../content/heroes';
import { allEnemies } from '../content/enemies';

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
}

function createPlayer({ name, image }: { name: string; image: string }): PlayerState {
  return {
    health: 20,
    startingHealth: 20,
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
  };
}
