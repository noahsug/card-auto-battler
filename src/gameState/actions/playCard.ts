import { cloneDeep } from 'lodash';

import {
  AnimationEvent,
  CardEffects,
  GameState,
  PlayerState,
  Target,
  getActivePlayer,
  getCurrentCard,
  getNonActivePlayer,
  statusEffectNames,
} from '../../gameState';
import { assert, getNonNullEntries } from '../../utils';
import {
  GainEffectsOptions,
  MAX_TURNS_IN_BATTLE,
  PlayerValueIdentifier,
  BattleStatsIdentifier,
  EMPTY_BATTLE_STATS,
  BattleStats,
  BattleStatsByPhase,
} from '../gameState';
import { Entries } from '../../utils/types';

interface PlayCardResult {
  currentCardBattleStats: BattleStats;
  trashSelf: boolean;
  events: AnimationEvent[];
}

export default function playCard(game: GameState) {
  const activePlayer = getActivePlayer(game);
  const nonActivePlayer = getNonActivePlayer(game);
  const card = getCurrentCard(activePlayer);

  // die if out of cards
  if (card == null) {
    activePlayer.health = 0;
    return;
  }

  if (activePlayer.cardsPlayedThisTurn > 0) {
    assert(activePlayer.extraCardPlays > 0);
    activePlayer.extraCardPlays -= 1;
  }
  activePlayer.cardsPlayedThisTurn += 1;

  const result: PlayCardResult = {
    currentCardBattleStats: { ...EMPTY_BATTLE_STATS },
    trashSelf: false,
    events: [] as AnimationEvent[],
  };

  card.effects.forEach((cardEffects) => {
    handleCardEffects({
      activePlayer,
      nonActivePlayer,
      cardEffects,
      result,
    });
  });

  if (result.trashSelf) {
    trashCurrentCard(activePlayer);
  }

  (Object.entries(result.currentCardBattleStats) as Entries<BattleStats>).forEach(
    ([name, value]) => {
      activePlayer.battleStatsByPhase.turn[name] += value;
    },
  );

  activePlayer.currentCardIndex = (activePlayer.currentCardIndex + 1) % activePlayer.cards.length;

  game.animationEvents.push(...result.events);

  // end game after max turns
  if (game.turn >= MAX_TURNS_IN_BATTLE - 1) {
    const target = game.user.health <= game.enemy.health ? game.user : game.enemy;
    target.health = 0;
  }
}

function handleCardEffects({
  activePlayer,
  nonActivePlayer,
  cardEffects,
  result,
}: {
  activePlayer: PlayerState;
  nonActivePlayer: PlayerState;
  cardEffects: CardEffects;
  result: PlayCardResult;
}) {
  const resultingCardEffects = cloneDeep(cardEffects);
  cardEffects.gainEffectsList?.forEach((gainEffectsOptions) => {
    gainEffects({
      self: activePlayer,
      opponent: nonActivePlayer,
      cardEffects: resultingCardEffects,
      gainEffectsOptions,
      result,
    });
  });

  for (let i = 0; i < (resultingCardEffects.activations ?? 1); i++) {
    applyCardEffects({
      self: activePlayer,
      opponent: nonActivePlayer,
      cardEffects: resultingCardEffects,
      result,
    });
  }

  return resultingCardEffects;
}

function gainEffects({
  self,
  opponent,
  cardEffects,
  gainEffectsOptions,
  result,
}: {
  self: PlayerState;
  opponent: PlayerState;
  cardEffects: CardEffects;
  gainEffectsOptions: GainEffectsOptions;
  result: PlayCardResult;
}) {
  if (!cardEffects.gainEffectsList) return cardEffects;

  const { effects, forEveryPlayerValue, forEveryBattleStat, divisor = 1 } = gainEffectsOptions;
  const { battleStatsByPhase } = self;
  const { currentCardBattleStats } = result;

  const playerValueMultiplier = forEveryPlayerValue
    ? getPlayerValue({ self, opponent, identifier: forEveryPlayerValue })
    : 1;

  const battleStatMultiplier = forEveryBattleStat
    ? getBattleStatsValue({
        battleStatsByPhase,
        currentCardBattleStats,
        identifier: forEveryBattleStat,
      })
    : 1;

  const multiplier = playerValueMultiplier * battleStatMultiplier;

  getNonNullEntries(effects).forEach(([name, value]) => {
    if (typeof value === 'boolean') {
      const boolValue = value && multiplier > 0;
      cardEffects[name] = cardEffects[name] || boolValue;
    } else {
      const defaultValue = name === 'activations' ? 1 : 0;
      const currentValue = cardEffects[name] ?? defaultValue;
      cardEffects[name] = currentValue + (value * multiplier) / divisor;
    }
  });

  return cardEffects;
}

function getPlayerValue({
  self,
  opponent,
  identifier,
}: {
  self: PlayerState;
  opponent: PlayerState;
  identifier: PlayerValueIdentifier;
}) {
  const targetPlayer = identifier.target === 'self' ? self : opponent;
  const value = targetPlayer[identifier.name];

  if (Array.isArray(value)) {
    return value.length;
  }
  return value;
}

function getBattleStatsValue({
  identifier,
  battleStatsByPhase,
  currentCardBattleStats,
}: {
  identifier: BattleStatsIdentifier;
  battleStatsByPhase: BattleStatsByPhase;
  currentCardBattleStats: BattleStats;
}) {
  const { name, phase } = identifier;

  const battleStats = phase === 'currentCard' ? currentCardBattleStats : battleStatsByPhase[phase];
  return battleStats[name];
}

function applyCardEffects({
  self,
  opponent,
  cardEffects,
  result,
}: {
  self: PlayerState;
  opponent: PlayerState;
  cardEffects: CardEffects;
  result: PlayCardResult;
}) {
  const { target, damage, heal, trashSelf } = cardEffects;
  const targetPlayer = target === 'self' ? self : opponent;

  // damage
  if (damage != null) {
    // dodge doesn't apply to self damage
    if (cardEffects.target === 'opponent' && opponent.dodge > 0) {
      opponent.dodge -= 1;
    } else {
      doDamage({ self, opponent, damage, target, result });
    }
  }

  // heal
  if (heal != null) {
    doHeal({ self, opponent, heal, target, result });
  }

  statusEffectNames.forEach((statusEffect) => {
    targetPlayer[statusEffect] += cardEffects[statusEffect] || 0;
  });

  if (trashSelf) {
    result.trashSelf = true;
  }
}

function doDamage({
  self,
  opponent,
  damage,
  target,
  result,
}: {
  opponent: PlayerState;
  self: PlayerState;
  damage: number;
  target: Target;
  result: PlayCardResult;
}) {
  const { events, currentCardBattleStats } = result;
  const targetPlayer = target === 'self' ? self : opponent;

  damage += self.strength;
  if (targetPlayer.bleed) {
    damage += 3;
    targetPlayer.bleed -= 1;
  }

  if (damage > 0) {
    targetPlayer.health -= damage;
    currentCardBattleStats.damageDealt += damage;
    currentCardBattleStats.numberOfHits += 1;
    events.push({ type: 'damage', target, value: damage });
  }
}

function doHeal({
  self,
  opponent,
  heal,
  target,
  result,
}: {
  opponent: PlayerState;
  self: PlayerState;
  heal: number;
  target: Target;
  result: PlayCardResult;
}) {
  const { events, currentCardBattleStats } = result;
  const targetPlayer = target === 'self' ? self : opponent;

  if (heal > 0) {
    targetPlayer.health += heal;
    currentCardBattleStats.healthRestored += heal;
    currentCardBattleStats.numberOfHeals += 1;
    events.push({ type: 'heal', target, value: heal });
  }
}

function trashCurrentCard(player: PlayerState) {
  const [card] = player.cards.splice(player.currentCardIndex, 1);
  player.trashedCards.push(card);
  player.currentCardIndex -= 1;
}
