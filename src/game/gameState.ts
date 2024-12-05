import { EnemyType } from '../content/enemies';
import { heroesByType } from '../content/heroes';
import { getRandomState, Random } from '../utils/Random';
import { addCardsToPlayer } from './utils/cards';
import { getEnemyOrder } from './utils/enemies';
import { getNextEnemy } from './utils/selectors';

export type CardShopType = 'removeCards' | 'chainCards' | 'addPotions' | 'featherCards';
export type ShopType = CardShopType | 'addRelics';

export type Target = 'self' | 'opponent';

export const statusEffectTypes = [
  'bleed',
  'extraCardPlays',
  'dodge',
  'temporaryDodge',
  'strength',
  'temporaryStrength',
  'regen',
  'burn',
  'lifesteal',
  'lifestealWhenBurning',
  'shock',
  'delayedShock',
  'stun',
  'crit',
  'temporaryFireCrit',
  'thickSkin',
] as const;
export type StatusEffectType = (typeof statusEffectTypes)[number];
export type StatusEffects = Record<StatusEffectType, number>;
export const EMPTY_STATUS_EFFECTS = Object.fromEntries(
  statusEffectTypes.map((effectType) => [effectType, 0]),
) as StatusEffects;

type CalculatedPlayerValueType =
  | 'percentGreen'
  | 'percentRed'
  | 'percentPurple'
  | 'prevCardIsGreen'
  | 'prevCardIsRed'
  | 'prevCardIsPurple'
  | 'cardDamageDealtToTarget'
  | 'turn';

export type PlayerValueType =
  | keyof Omit<PlayerState, 'name' | 'image' | 'previousCard'>
  | CalculatedPlayerValueType;

export type CardEffectType = StatusEffectType | 'damage' | 'heal' | 'trash';

export interface BasicValueDescriptor {
  type: 'basicValue';
  value: number;
}

export interface PlayerValueDescriptor {
  type: 'playerValue';
  target: Target;
  valueType: PlayerValueType;
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

export interface BasicCardEffect {
  target: Target;
  type: CardEffectType;
  value: ValueDescriptor;
  add?: MaybeValue;
  multiply?: MaybeValue<BasicValueDescriptor>;
  multiHit?: ValueDescriptor;
  if?: If;
}

export interface SetValueCardEffect extends Omit<BasicCardEffect, 'type'> {
  type: 'set';
  valueType: StatusEffectType | 'health';
}

export type CardEffect = BasicCardEffect | SetValueCardEffect;

export const tribes = ['basic', 'purple', 'red', 'green'] as const;
export type Tribe = (typeof tribes)[number];

export interface CardState {
  effects: CardEffect[];
  repeat?: MaybeValue;
  trash: boolean;
  uses?: { current: number; max: number };
  // unique ID used to sort cards from first added to last added
  chain: { toId?: number; fromId?: number };
  charm?: 'feather';
  name: string;
  description: string;
  image: string;
  tribe: Tribe;
  acquiredId: number;
}

export interface RelicState {
  type: string;
  description: string;
  value: number;
  value2: number;
  name: string;
  image: string;
  tribe: Tribe;
}

export interface PlayerState extends StatusEffects {
  health: number;
  startingHealth: number;
  cards: CardState[];
  trashedCards: CardState[];
  relics: RelicState[];
  currentCardIndex: number;
  cardsPlayedThisTurn: number;
  previousCard?: CardState;
  damageDealtThisTurn: number;
  damageDealtLastTurn: number;
  name: string;
  image: string;
  scale: number;
}

export interface GameState {
  user: PlayerState;
  enemy: PlayerState;
  enemyOrder: EnemyType[];
  turn: number;
  wins: number;
  losses: number;
  randomnessState: Uint32Array;
}

export interface PlayerInfo {
  name: string;
  image: string;
  cards: CardState[];
  health: number;
  scale: number;
  initialize?: (player: PlayerState, battleNumber: number) => void;
}

export function createPlayer({ name, image, cards, health, scale }: PlayerInfo): PlayerState {
  const player = {
    health,
    startingHealth: health,
    ...EMPTY_STATUS_EFFECTS,
    cards: [],
    trashedCards: [],
    relics: [],
    currentCardIndex: 0,
    cardsPlayedThisTurn: 0,
    damageDealtThisTurn: 0,
    damageDealtLastTurn: 0,
    name,
    image,
    scale,
  };

  addCardsToPlayer(
    player,
    cards.map((c) => structuredClone(c)),
  );

  return player;
}

export function createGameState(seed?: number): GameState {
  const random = new Random(seed);
  const enemyOrder = getEnemyOrder(random);

  const game = {
    user: createPlayer(heroesByType.warrior),
    enemy: getNextEnemy({ enemyOrder, wins: 0 }),
    enemyOrder,
    turn: 0,
    wins: 0,
    losses: 0,
    randomnessState: getRandomState(seed),
  };

  // game.enemy.health = 5;
  // game.user.health = 1;

  return game;
}
