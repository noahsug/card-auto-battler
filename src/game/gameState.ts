import { allCards } from '../content/cards';
import { allHeroes } from '../content/heroes';
import { allEnemies } from '../content/enemies';
import { STARTING_HEALTH } from './constants';

export type Target = 'self' | 'opponent';

export const statusEffectNames = [
  'bleed',
  'permaBleed',
  'extraCardPlays',
  'dodge',
  'strength',
  'regen',
  'reduceLowDamage',
  'regenForHighDamage',
] as const;
export type StatusEffectName = (typeof statusEffectNames)[number];
export type StatusEffects = Record<StatusEffectName, number>;
export const EMPTY_STATUS_EFFECTS = Object.fromEntries(
  statusEffectNames.map((effectName) => [effectName, 0]),
) as StatusEffects;

type CalculatedPlayerValueName =
  | 'percentGreen'
  | 'percentRed'
  | 'percentPurple'
  | 'prevCardIsGreen'
  | 'prevCardIsRed'
  | 'prevCardIsPurple'
  | 'turn';

export type PlayerValueName =
  | keyof Omit<PlayerState, 'name' | 'image' | 'previousCard'>
  | CalculatedPlayerValueName;

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
  multiHit?: ValueDescriptor;
  if?: If;
}

export const tribes = ['basic', 'purple', 'red', 'green'] as const;
export type Tribe = (typeof tribes)[number];

export interface CardState {
  effects: CardEffect[];
  repeat?: MaybeValue;
  name: string;
  description: string;
  image: string;
  tribe: Tribe;
}

export interface RelicEffect {
  target: Target;
  statusEffectName: StatusEffectName;
  value: number;
}

export interface RelicState {
  effect: RelicEffect;
  name: string;
  description: string;
  image: string;
  tribe: Tribe;
}

export interface PlayerState extends StatusEffects {
  health: number;
  startingHealth: number;
  cards: CardState[];
  relics: RelicState[];
  currentCardIndex: number;
  cardsPlayedThisTurn: number;
  previousCard?: CardState;
  damageDealtThisTurn: number;
  damageDealtLastTurn: number;
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
    relics: [],
    currentCardIndex: 0,
    cardsPlayedThisTurn: 0,
    damageDealtThisTurn: 0,
    damageDealtLastTurn: 0,
    name,
    image,
  };
}

export function createGameState(): GameState {
  const { attack, heal, fireball } = allCards;

  const user = createPlayer(allHeroes.warrior);
  // user.cards = [attack, attack, heal];
  user.cards = [allCards.damageForGreen, allCards.damagePerTurn, allCards.regen];

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
