import { allCards } from '../content/cards';
import { allEnemies } from '../content/enemies';
import { allHeroes } from '../content/heroes';
import { STARTING_HEALTH } from './constants';
import { addCardsToPlayer } from './utils/cards';

export type Target = 'self' | 'opponent';

export const statusEffectNames = [
  'bleed',
  'extraCardPlays',
  'dodge',
  'strength',
  'regen',
  'channel',
  'burn',
  'lifesteal',
  'lifestealWhenBurning',
  'shock',
  'stun',
  'shockOpponentNextTurn',
  'temporaryDodge',
  'critNextAttack',
  'temporaryStrength',
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
  name: string;
  description: string;
  image: string;
  tribe: Tribe;
  // unique ID used to sort cards from first added to last added
  acquiredId: number;
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
    trashedCards: [],
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
  const game = {
    user: createPlayer(allHeroes.warrior),
    enemy: createPlayer(allEnemies.fireMonster),
    turn: 0,
    wins: 0,
    losses: 0,
  };

  const { attack, heal } = allCards;
  addCardsToPlayer(game.user, [allCards.stealth, allCards.shockTrap, allCards.pumpedUp]);
  // addCardsToPlayer(game.user, [attack, attack, heal]);
  addCardsToPlayer(game.enemy, [attack, attack, attack, heal]);

  return game;
}
