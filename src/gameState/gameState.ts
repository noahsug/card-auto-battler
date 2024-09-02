import { PickByValue } from '../utils/types';
import { STARTING_HEALTH } from './constants';
import { getStartingCards } from './cardSelection';
import sample from 'lodash/sample';

export type ScreenName =
  | 'cardCollection'
  | 'gameStart'
  | 'cardSelection'
  | 'battle'
  | 'battleEnd'
  | 'gameEnd';

export const enemyTypes = [
  'strength',
  'bleed',
  'lowHealth',
  'heal',
  'mill',
  'trash',
  'multicard',
] as const;

export type EnemyType = (typeof enemyTypes)[number];

export interface BattleEvent {
  type: 'damage' | 'heal' | 'miss';
  target: Target;
  value?: number;
}

export const statusEffectNames = ['bleed', 'extraCardPlays', 'dodge', 'strength'] as const;

export const EMPTY_STATUS_EFFECTS = Object.fromEntries(
  statusEffectNames.map((effectName) => [effectName, 0]),
) as StatusEffects;

export type StatusEffectName = (typeof statusEffectNames)[number];

export type StatusEffects = Record<StatusEffectName, number>;

export type Target = 'self' | 'opponent';

export type PlayerValueName = keyof PlayerState;

export interface PlayerValueIdentifier {
  target: Target;
  name: PlayerValueName;
}

export const EMPTY_BATTLE_STATS = {
  damageDealt: 0,
  healthRestored: 0,
  numberOfHits: 0,
};

export type BattleStats = typeof EMPTY_BATTLE_STATS;

export type IdentifiableBattleStats = keyof BattleStats;

export type BattleStatsIdentifier = {
  name: IdentifiableBattleStats;
};

export interface Comparable {
  comparison: '>' | '<' | '=' | '<=' | '>=';
  compareToValue?: number;
  compareToPlayerValue?: PlayerValueIdentifier;
  compareToBattleStat?: BattleStatsIdentifier;
  // multiplier for the compareTo values (e.g. 0.5 = 50% of comparison value)
  multiplier?: number;
}

export interface IfBattleStatOptions extends BattleStatsIdentifier, Comparable {}

export interface IfPlayerValueOptions extends PlayerValueIdentifier, Comparable {}

export interface Conditional<T> {
  ifBattleStat?: IfBattleStatOptions;
  ifPlayerValue?: IfPlayerValueOptions;
  else?: T;
}

export type GainableCardEffects = PickByValue<Required<CardEffects>, number | boolean>;

export interface GainEffectsOptions extends Conditional<GainEffectsOptions> {
  effects: Partial<GainableCardEffects>;

  forEveryPlayerValue?: PlayerValueIdentifier;
  forEveryBattleStat?: BattleStatsIdentifier;

  isMultiplicative?: boolean;
  divisor?: number;
}

export interface CardGrowEffects
  extends Omit<GainEffectsOptions, 'else'>,
    Conditional<CardGrowEffects> {
  isPermanent?: boolean;
}

export interface CardEffects extends Partial<StatusEffects>, Conditional<CardEffects> {
  target: Target;

  damage?: number;
  heal?: number;
  // TODO: implement random effects
  randomNegativeStatusEffects?: number;
  randomPositiveStatusEffects?: number;
  // cause target to trash X cards
  trash?: number;
  // trash this card after use
  trashSelf?: boolean;
  activations?: number;

  // gain temporary effects as the card is being played
  gainEffectsList?: GainEffectsOptions[];
  // gain (semi-)permanent effects after the card is played
  // TODO: implement grow effects
  growEffectsList?: CardGrowEffects[];
}

export interface CardState {
  effects: CardEffects[];
  name: string;
}

export interface PlayerState extends StatusEffects {
  health: number;
  startingHealth: number;
  cards: CardState[];
  currentCardIndex: number;
  cardsPlayedThisTurn: number;
  trashedCards: CardState[];
}

export interface GameState {
  user: PlayerState;
  enemy: PlayerState;
  turn: number;
  wins: number;
  losses: number;
  screen: ScreenName;
  battleEvents: BattleEvent[];
  wonLastBattle: boolean;
  currentEnemyType: EnemyType;
}

function createInitialPlayerState(): PlayerState {
  return {
    cards: [],
    trashedCards: [],
    currentCardIndex: 0,
    health: STARTING_HEALTH,
    startingHealth: STARTING_HEALTH,
    cardsPlayedThisTurn: 0,
    ...EMPTY_STATUS_EFFECTS,
  };
}

export function getCurrentBattleNumber(game: GameState) {
  return game.wins + game.losses;
}

export function createInitialGameState(): GameState {
  const user = createInitialPlayerState();
  user.cards = getStartingCards();

  const enemy = createInitialPlayerState();

  return {
    user,
    enemy,
    turn: 0,
    wins: 0,
    losses: 0,
    screen: 'gameStart',
    // screen: 'cardCollection', // DEBUG
    battleEvents: [],
    wonLastBattle: false,
    currentEnemyType: getRandomEnemyType(),
  };
}

export function getIsEnemyTurn(game: GameState) {
  return game.turn % 2 === 1;
}

export function getActivePlayer(game: GameState) {
  return getIsEnemyTurn(game) ? game.enemy : game.user;
}

export function getNonActivePlayer(game: GameState) {
  return getIsEnemyTurn(game) ? game.user : game.enemy;
}

export function getCurrentCard(playerOrGame: PlayerState | GameState) {
  let player = playerOrGame as PlayerState;
  if (player.currentCardIndex === undefined) {
    player = getActivePlayer(playerOrGame as GameState);
  }

  return player.cards[player.currentCardIndex];
}

export function getCanPlayCard(game: GameState) {
  const activePlayer = getActivePlayer(game);
  const hasCardToPlay = activePlayer.cardsPlayedThisTurn === 0 || activePlayer.extraCardPlays > 0;
  const isInInfiniteLoop = activePlayer.cardsPlayedThisTurn > 40;
  return hasCardToPlay && !isInInfiniteLoop;
}

export function getIsBattleOver(game: GameState) {
  const { user, enemy } = game;
  return user.health <= 0 || enemy.health <= 0;
}

export function getRandomEnemyType() {
  return sample(enemyTypes);
}
