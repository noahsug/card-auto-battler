import { EnemyName } from '../content/enemies';
import { heroesByName } from '../content/heroes';
import { getRandomState, Random } from '../utils/Random';
import { addCardsToPlayer } from './utils/cards';
import { getEnemyOrder } from './utils/enemies';
import { getNextEnemy } from './utils/selectors';

export type CardShopName = 'removeCards' | 'chainCards' | 'addPotions' | 'featherCards';
export type ShopName = CardShopName | 'addRelics';

export type Target = 'self' | 'opponent';

export const statusEffectNames = [
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
  | 'cardDamageDealtToTarget'
  | 'turn';

export type PlayerValueName =
  | keyof Omit<PlayerState, 'name' | 'image' | 'previousCard'>
  | CalculatedPlayerValueName;

// TODO: Add 'selfDamage' as a type, which isn't affected by things like strength
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

export interface BasicCardEffect {
  target: Target;
  name: CardEffectName;
  value: ValueDescriptor;
  add?: MaybeValue;
  multiply?: MaybeValue<BasicValueDescriptor>;
  multiHit?: ValueDescriptor;
  if?: If;
}

export interface SetValueCardEffect extends Omit<BasicCardEffect, 'name'> {
  name: 'set';
  valueName: StatusEffectName | 'health';
}

export type CardEffect = BasicCardEffect | SetValueCardEffect;

export const tribes = ['basic', 'purple', 'red', 'green'] as const;
export type Tribe = (typeof tribes)[number];

export interface CardState {
  effects: CardEffect[];
  repeat?: MaybeValue;
  lifesteal?: MaybeValue;
  trash: boolean;
  uses?: { current: number; max: number };
  name: string;
  description: string;
  image: string;
  tribe: Tribe;
  // unique ID used to sort cards from first added to last added
  acquiredId: number;
  chain: { toId?: number; fromId?: number };
  charm?: 'feather';
}

export interface RelicState {
  name: string;
  displayName: string;
  description: string;
  value: number;
  value2: number;
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
  enemyOrder: EnemyName[];
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
  initialize?: (player: PlayerState) => void;
}

export function createPlayer({
  name,
  image,
  cards,
  health,
  scale,
  initialize,
}: PlayerInfo): PlayerState {
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

  initialize?.(player);
  return player;
}

export function createGameState(seed?: number): GameState {
  const random = new Random(seed);
  const enemyOrder = getEnemyOrder(random);

  const game = {
    user: createPlayer(heroesByName.warrior),
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
