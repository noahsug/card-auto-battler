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
  BattleStats,
  EMPTY_BATTLE_STATS,
} from '../gameState';

interface PlayCardResult {
  battleStats: BattleStats;
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

  const result: PlayCardResult = {
    battleStats: { ...EMPTY_BATTLE_STATS },
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

  activePlayer.currentCardIndex = (activePlayer.currentCardIndex + 1) % activePlayer.cards.length;
  activePlayer.cardsPlayedThisTurn += 1;

  game.animationEvents.push(...result.events);

  // end game after max turns
  if (game.turn + 1 >= MAX_TURNS_IN_BATTLE) {
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
  const { battleStats } = result;

  const playerValueMultiplier = forEveryPlayerValue
    ? getPlayerValue({ self, opponent, identifier: forEveryPlayerValue })
    : 1;

  const battleStatMultiplier = forEveryBattleStat ? battleStats[forEveryBattleStat.name] : 1;

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
  const { target, damage, heal, trash, trashSelf } = cardEffects;
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

  // trash
  if (trash != null) {
    trashCards({ self, opponent, target, trash });
  }

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
  const { events, battleStats } = result;
  const targetPlayer = target === 'self' ? self : opponent;

  damage += self.strength;
  if (targetPlayer.bleed) {
    damage += 3;
    targetPlayer.bleed -= 1;
  }

  if (damage > 0) {
    targetPlayer.health -= damage;
    battleStats.damageDealt += damage;
    battleStats.numberOfHits += 1;
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
  const { events, battleStats } = result;
  const targetPlayer = target === 'self' ? self : opponent;

  if (heal > 0) {
    targetPlayer.health += heal;
    battleStats.healthRestored += heal;
    events.push({ type: 'heal', target, value: heal });
  }
}

function trashCards({
  self,
  opponent,
  target,
  trash,
}: {
  self: PlayerState;
  opponent: PlayerState;
  target: Target;
  trash: number;
}) {
  const targetPlayer = target === 'self' ? self : opponent;
  const { cards, currentCardIndex } = targetPlayer;

  // don't trash the current card if it's actively being played
  const maxCardsToTrash = target === 'self' ? cards.length - 1 : cards.length;
  trash = Math.min(trash, maxCardsToTrash);

  const trashStart = target === 'self' ? currentCardIndex + 1 : currentCardIndex;
  const removeFromFront = trashStart + trash - cards.length;

  targetPlayer.cards = cards.filter((_, i) => {
    // trash cards after or at the current card
    if (i >= trashStart && i < trashStart + trash) return false;

    // trash cards from the front of the deck
    if (i < removeFromFront) return false;

    return true;
  });

  targetPlayer.currentCardIndex -= removeFromFront;
}

function trashCurrentCard(player: PlayerState) {
  const [card] = player.cards.splice(player.currentCardIndex, 1);
  player.trashedCards.push(card);
  player.currentCardIndex -= 1;
}
