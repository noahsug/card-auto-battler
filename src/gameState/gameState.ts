import { PickType } from '../utils/types/types';
export type ScreenName = 'game-start' | 'card-selection' | 'battle' | 'battle-end' | 'game-end';

export const EMPTY_STATUS_EFFECTS = {
  bleed: 0,
  extraCardPlays: 0,
  dodge: 0,
  strength: 0,
};

export type StatusEffects = {
  [K in keyof typeof EMPTY_STATUS_EFFECTS]: number;
};

// TODO: rename to 'self' | 'enemy'
type Target = 'self' | 'target';

type Targeted<T> = T & { target: Target };

interface StatusEffectIdentifier {
  isStatusEffect: true;
  name: keyof StatusEffects;
}

interface NonStatusEffectIdentifier<T> {
  isStatusEffect: false;
  name: keyof T;
}

// Card effect that is a number
export type GainableCardEffects = Partial<PickType<Required<CardEffects>, number>>;

export type PlayerValueIdentifier = StatusEffectIdentifier | NonStatusEffectIdentifier<PlayerState>;

export type CardEffectIdentifier = StatusEffectIdentifier | NonStatusEffectIdentifier<CardEffects>;

export type GainableCardEffectIdentifier =
  | StatusEffectIdentifier
  | NonStatusEffectIdentifier<GainableCardEffects>;

export interface CardEffects {
  damage?: number;
  repeat?: number;
  statusEffects?: Partial<StatusEffects>;
  // gain card effect based on target, self or current card value
  effectBasedOnPlayerValue?: {
    effect: GainableCardEffectIdentifier;
    basedOn: Targeted<PlayerValueIdentifier>;
    ratio?: number;
  };
}

export interface CardState {
  self?: CardEffects;
  target?: CardEffects;
}

export interface PlayerState {
  cards: CardState[];
  currentCardIndex: number;
  health: number;
  maxHealth: number;
  cardsPlayedThisTurn: number;
  statusEffects: StatusEffects;
}

export interface GameState {
  user: PlayerState;
  enemy: PlayerState;
  turn: number;
  wins: number;
  losses: number;
  screen: ScreenName;
}

export const MAX_WINS = 3;
export const MAX_LOSSES = 2;

export const BLEED_DAMAGE = 3;

function createInitialPlayerState(): PlayerState {
  const maxHealth = 6;

  return {
    cards: [],
    currentCardIndex: 0,
    health: maxHealth,
    maxHealth,
    cardsPlayedThisTurn: 0,
    statusEffects: { ...EMPTY_STATUS_EFFECTS },
  };
}

// const userCards = [{ dmg: 1, playAnotherCard: 1 }, { text: 'dmg 2' }];
const userCards: CardState[] = [{ target: { damage: 1, statusEffects: { bleed: 2 } } }];

const enemyCardsByBattle = [
  [
    { target: { damage: 1 } },
    { target: { damage: 1 } },
    { target: { damage: 1 } },
    { target: { damage: 1 } },
    { target: { damage: 1 } },
    { target: { damage: 1 } },
  ], // 5 hits
  [
    { target: { damage: 0 } },
    { target: { damage: 0 } },
    { target: { damage: 0 } },
    { target: { damage: 3 } },
    { target: { damage: 3 } },
  ], // 4 hits
  [
    { target: { damage: 2 } },
    { target: { damage: 2 } },
    { target: { damage: 3 } },
    { target: { damage: 3 } },
  ], // 3 hits
  [{ target: { damage: 3 } }, { target: { damage: 6 } }, { target: { damage: 9 } }], // 2 hits
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
    screen: 'game-start',
  };
}

const cardSelectionsByBattle: CardState[][] = [];
for (let i = 0; i < MAX_WINS + MAX_LOSSES - 1; i++) {
  cardSelectionsByBattle[i] = [];
  for (let j = 0; j < 6; j++) {
    const damage = Math.round(6 * Math.random() * Math.random());
    cardSelectionsByBattle[i].push({
      target: { damage, statusEffects: { bleed: 2 } },
      self: { statusEffects: { extraCardPlays: 1 } },
    });
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
  return activePlayer.cardsPlayedThisTurn === 0 || activePlayer.statusEffects.extraCardPlays > 0;
}

export function getIsBattleOver(game: GameState) {
  const { user, enemy } = game;
  return user.health <= 0 || enemy.health <= 0;
}
