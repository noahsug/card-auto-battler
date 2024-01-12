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

export interface CardEffects {
  damage?: number;
  multihitPerBleed?: number;
  multihit?: number;
  statusEffects?: Partial<StatusEffects>;
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
  opponent: PlayerState;
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

const opponentCardsByBattle = [
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

export function getOpponentCardsForBattle(battleCount: number) {
  return opponentCardsByBattle[battleCount].slice();
}

export function getBattleCount(game: GameState) {
  return game.wins + game.losses;
}

export function createInitialGameState(): GameState {
  const user = createInitialPlayerState();
  user.cards = userCards.slice();

  const opponent = createInitialPlayerState();
  opponent.cards = getOpponentCardsForBattle(0);

  return {
    user,
    opponent,
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
    const dmg = Math.round(6 * Math.random() * Math.random());
    cardSelectionsByBattle[i].push({
      target: { damage: dmg, multihit: 2, statusEffects: { bleed: 1 } },
      self: { statusEffects: { extraCardPlays: 1 } },
    });
  }
}

export function getCardSelectionsForBattle(battleCount: number) {
  return cardSelectionsByBattle[battleCount];
}

export function getIsOpponentTurn(game: GameState) {
  return game.turn % 2 === 1;
}

export function getActivePlayer(game: GameState) {
  return getIsOpponentTurn(game) ? game.opponent : game.user;
}

export function getNonActivePlayer(game: GameState) {
  return getIsOpponentTurn(game) ? game.user : game.opponent;
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
  const { user, opponent } = game;
  return user.health <= 0 || opponent.health <= 0;
}
