import { allCards } from '../content/cards';
import { allHeroes } from '../content/heroes';
import { allEnemies } from '../content/enemies';
import { STARTING_HEALTH } from './constants';

export type Target = 'self' | 'opponent';

export const statusEffectNames = ['bleed', 'extraCardPlays', 'dodge', 'strength'] as const;
export type StatusEffectName = (typeof statusEffectNames)[number];
export type StatusEffects = Record<StatusEffectName, number>;

export const EMPTY_STATUS_EFFECTS = Object.fromEntries(
  statusEffectNames.map((effectName) => [effectName, 0]),
) as StatusEffects;

export type PlayerValueName = keyof PlayerState;

export type CardEffectName = StatusEffectName | 'damage' | 'heal' | 'trash';

export interface BasicValueDescriptor {
  type: 'basicValue';
  value: number;
}

export interface PlayerValueDescriptor {
  type: 'playerValue';
  target: Target;
  name: PlayerValueName;
  multiplier?: number;
}

export type ValueDescriptor = BasicValueDescriptor | PlayerValueDescriptor;

export interface If {
  value: PlayerValueDescriptor;
  comparison: '>' | '<' | '=' | '<=' | '>=';
  value2: BasicValueDescriptor;
}

export interface MaybeValue<T = ValueDescriptor> {
  value: T;
  if?: If;
}

export interface CardEffect {
  target: Target;
  name: CardEffectName;
  value: ValueDescriptor;
  add?: MaybeValue;
  multiply?: MaybeValue<BasicValueDescriptor>;
  multiHit?: number;
  if?: If;
}

export interface CardState {
  effects: CardEffect[];
  repeat?: MaybeValue;
  name: string;
  description: string;
  image: string;
}

export interface PlayerState extends StatusEffects {
  health: number;
  startingHealth: number;
  cards: CardState[];
  currentCardIndex: number;
  cardsPlayedThisTurn: number;
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
    ...EMPTY_STATUS_EFFECTS,
    cards: [],
    currentCardIndex: 0,
    cardsPlayedThisTurn: 0,
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
