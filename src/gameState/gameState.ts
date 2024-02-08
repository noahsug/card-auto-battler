import { PickByValue } from '../utils/types';
import { createCard } from './utils';

export type ScreenName = 'gameStart' | 'cardSelection' | 'battle' | 'battleEnd' | 'gameEnd';

export interface AnimationEvent {
  type: 'damage' | 'heal';
  target: Target;
  value: number;
}

export const statusEffectNames = ['bleed', 'extraCardPlays', 'dodge', 'strength'] as const;

export const EMPTY_STATUS_EFFECTS = Object.fromEntries(
  statusEffectNames.map((effectName) => [effectName, 0]),
) as StatusEffects;

export type StatusEffectName = (typeof statusEffectNames)[number];

export type StatusEffects = Record<StatusEffectName, number>;

export type Target = 'self' | 'opponent';

export type IdentifiablePlayerValue = keyof PlayerState;

export interface PlayerValueIdentifier {
  target: Target;
  name: IdentifiablePlayerValue;
}

export interface Comparable {
  comparator: '>' | '<' | '=';
  compareToValue?: number;
  compareToPlayerValue?: PlayerValueIdentifier;
}

export interface Conditional<T> {
  ifDamageDealt?: Comparable;
  ifHits?: Comparable;
  ifPlayerValue?: PlayerValueIdentifier & Comparable;
  else?: T;
}

export const EMPTY_BATTLE_STATS = {
  damageDealt: 0,
  healthRestored: 0,
  numberOfHits: 0,
};

export type BattleStats = typeof EMPTY_BATTLE_STATS;

export type BattleStatsIdentifier = keyof BattleStats;

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
  growEffectsList?: CardGrowEffects[];
}

export interface CardState {
  effects: CardEffects[];
}

export interface PlayerState extends StatusEffects {
  health: number;
  maxHealth: number;
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
  animationEvents: AnimationEvent[];
}

export const MAX_WINS = 3;
export const MAX_LOSSES = 2;

export const BLEED_DAMAGE = 3;

// the player with the highest health wins after this many turns
export const MAX_TURNS_IN_BATTLE = 40;

function createInitialPlayerState(): PlayerState {
  const maxHealth = 100;

  return {
    cards: [],
    trashedCards: [],
    currentCardIndex: 0,
    health: maxHealth,
    maxHealth,
    cardsPlayedThisTurn: 0,
    ...EMPTY_STATUS_EFFECTS,
  };
}

const userCards: CardState[] = [
  createCard({ target: 'self', heal: 3 }, { target: 'opponent', bleed: 3 }),
];

const enemyCardsByBattle: CardState[][] = [
  [
    createCard({ target: 'opponent', damage: 1 }),
    createCard({ target: 'opponent', damage: 1 }),
    createCard({ target: 'opponent', damage: 1 }),
    createCard({ target: 'opponent', damage: 1 }),
    createCard({ target: 'opponent', damage: 1 }),
    createCard({ target: 'opponent', damage: 1 }),
  ],
  // 5 hits
  [
    createCard({ target: 'opponent', damage: 0 }),
    createCard({ target: 'opponent', damage: 0 }),
    createCard({ target: 'opponent', damage: 0 }),
    createCard({ target: 'opponent', damage: 3 }),
    createCard({ target: 'opponent', damage: 3 }),
  ],
  // 4 hits
  [
    createCard({ target: 'opponent', damage: 2 }),
    createCard({ target: 'opponent', damage: 2 }),
    createCard({ target: 'opponent', damage: 3 }),
    createCard({ target: 'opponent', damage: 3 }),
  ],
  // 3 hits
  [
    createCard({ target: 'opponent', damage: 3 }),
    createCard({ target: 'opponent', damage: 6 }),
    createCard({ target: 'opponent', damage: 9 }),
  ],
];

export function getEnemyCardsForBattle(battleCount: number) {
  return enemyCardsByBattle[battleCount].slice();
}

export function getBattleCount(game: GameState) {
  return game.wins + game.losses;
}

export function createInitialGameState(): GameState {
  const user = createInitialPlayerState();
  user.cards = userCards.slice();

  const enemy = createInitialPlayerState();
  enemy.cards = getEnemyCardsForBattle(0);

  return {
    user,
    enemy,
    turn: 0,
    wins: 0,
    losses: 0,
    screen: 'gameStart',
    animationEvents: [],
  };
}

const cardSelectionsByBattle: CardState[][] = [];
for (let i = 0; i < MAX_WINS + MAX_LOSSES - 1; i++) {
  cardSelectionsByBattle[i] = [];
  for (let j = 0; j < 6; j++) {
    const damage = Math.round(6 * Math.random() * Math.random());
    cardSelectionsByBattle[i].push(
      createCard({
        target: 'opponent',
        damage,
        bleed: 2,
        activations: 0,
        gainEffectsList: [
          {
            effects: { activations: 1 },
            forEveryPlayerValue: {
              target: 'opponent',
              name: 'bleed',
            },
          },
        ],
      }),
    );
  }
}

export function getCardSelectionsForBattle(battleCount: number) {
  return cardSelectionsByBattle[battleCount];
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
  return activePlayer.cardsPlayedThisTurn === 0 || activePlayer.extraCardPlays > 0;
}

export function getIsBattleOver(game: GameState) {
  const { user, enemy } = game;
  return user.health <= 0 || enemy.health <= 0;
}
