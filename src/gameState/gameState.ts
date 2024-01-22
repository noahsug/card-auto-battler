import { PickType } from '../utils/types/types';
import { createCard } from './utils';

export type ScreenName = 'game-start' | 'card-selection' | 'battle' | 'battle-end' | 'game-end';

export const statusEffectNames = ['bleed', 'extraCardPlays', 'dodge', 'strength'] as const;

export const EMPTY_STATUS_EFFECTS = Object.fromEntries(
  statusEffectNames.map((effectName) => [effectName, 0]),
) as StatusEffects;

export type StatusEffectName = (typeof statusEffectNames)[number];

export type StatusEffects = Record<StatusEffectName, number>;

export type Target = 'self' | 'opponent';

// Card effects that are numbers
export type GainableCardEffect = keyof PickType<Required<CardEffects>, number>;

export interface PlayerStateValueIdentifier {
  valueName: keyof PlayerState;
  target: Target;
}

export interface CardEffects extends Partial<StatusEffects> {
  target: Target;
  damage?: number;
  repeat?: number;
  // gain card effect based on target, self or current card value
  effectBasedOnPlayerValue?: {
    effectName: GainableCardEffect;
    basedOn: PlayerStateValueIdentifier;
    ratio?: number;
  };
}

export interface CardState {
  effects: CardEffects[];
  trash?: boolean;
}

export interface PlayerState extends StatusEffects {
  cards: CardState[];
  trashedCards: CardState[];
  currentCardIndex: number;
  health: number;
  maxHealth: number;
  cardsPlayedThisTurn: number;
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
    trashedCards: [],
    currentCardIndex: 0,
    health: maxHealth,
    maxHealth,
    cardsPlayedThisTurn: 0,
    ...EMPTY_STATUS_EFFECTS,
  };
}

// const userCards = [{ dmg: 1, playAnotherCard: 1 }, { text: 'dmg 2' }];
const userCards: CardState[] = [createCard({ target: 'opponent', damage: 1, bleed: 2 })];

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
    screen: 'game-start',
  };
}

const cardSelectionsByBattle: CardState[][] = [];
for (let i = 0; i < MAX_WINS + MAX_LOSSES - 1; i++) {
  cardSelectionsByBattle[i] = [];
  for (let j = 0; j < 6; j++) {
    const damage = Math.round(6 * Math.random() * Math.random());
    cardSelectionsByBattle[i].push(
      createCard({ target: 'opponent', damage, bleed: 2 }, { target: 'self', extraCardPlays: 1 }),
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
