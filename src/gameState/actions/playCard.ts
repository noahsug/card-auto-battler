import cloneDeep from 'lodash/cloneDeep';
import shuffle from 'lodash/shuffle';

import {
  AnimationEvent,
  BattleStats,
  CardEffects,
  Comparable,
  EMPTY_BATTLE_STATS,
  GainEffectsOptions,
  GameState,
  IfBattleStatOptions,
  IfPlayerValueOptions,
  MAX_TURNS_IN_BATTLE,
  PlayerState,
  PlayerValueIdentifier,
  Target,
  getActivePlayer,
  getCurrentCard,
  getNonActivePlayer,
  statusEffectNames,
} from '..';
import { assert, getNonNullEntries } from '../../utils';
import { getIsEnemyTurn } from '../gameState';

interface PlayCardResult {
  battleStats: BattleStats;
  trashSelf: boolean;
  events: AnimationEvent[];
}

export default function playCard(game: GameState) {
  const self = getActivePlayer(game);
  const opponent = getNonActivePlayer(game);
  const card = getCurrentCard(self);

  // die if out of cards
  if (card == null) {
    self.health = 0;
    return;
  }

  if (self.cardsPlayedThisTurn > 0) {
    assert(self.extraCardPlays > 0);
    self.extraCardPlays -= 1;
  }

  const result: PlayCardResult = {
    battleStats: { ...EMPTY_BATTLE_STATS },
    trashSelf: false,
    events: [] as AnimationEvent[],
  };

  card.effects.forEach((cardEffects) => {
    handleCardEffects({
      self: self,
      opponent: opponent,
      cardEffects,
      result,
    });
  });

  self.cardsPlayedThisTurn += 1;

  game.animationEvents.push(...result.events);

  if (self.cards.length === 0) return;

  if (result.trashSelf) {
    trashCurrentCard(self);
  }

  self.currentCardIndex = (self.currentCardIndex + 1) % self.cards.length;

  if (self.currentCardIndex === 0) {
    self.cards = shuffle(self.cards);
  }

  // end game after max turns
  if (game.turn + 1 >= MAX_TURNS_IN_BATTLE) {
    const target = game.user.health <= game.enemy.health ? game.user : game.enemy;
    target.health = 0;
  }
}

function handleCardEffects({
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
  const { ifPlayerValue, ifBattleStat } = cardEffects;

  if (ifPlayerValue && !evalPlayerValueConditional({ self, opponent, result, ifPlayerValue })) {
    return cardEffects;
  }
  if (ifBattleStat && !evalBattleStatConditional({ self, opponent, result, ifBattleStat })) {
    return cardEffects;
  }

  const resultingCardEffects = cloneDeep(cardEffects);
  cardEffects.gainEffectsList?.forEach((gainEffectsOptions) => {
    gainEffects({
      self,
      opponent,
      cardEffects: resultingCardEffects,
      gainEffectsOptions,
      result,
    });
  });

  for (let i = 0; i < (resultingCardEffects.activations ?? 1); i++) {
    applyCardEffects({
      self,
      opponent,
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

  const {
    effects,
    forEveryPlayerValue,
    forEveryBattleStat,
    ifPlayerValue,
    ifBattleStat,
    divisor = 1,
  } = gainEffectsOptions;
  const { battleStats } = result;

  if (ifPlayerValue && !evalPlayerValueConditional({ self, opponent, result, ifPlayerValue })) {
    return cardEffects;
  }
  if (ifBattleStat && !evalBattleStatConditional({ self, opponent, result, ifBattleStat })) {
    return cardEffects;
  }

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
      cardEffects[name] = currentValue + Math.floor((value * multiplier) / divisor);
    }
  });

  return cardEffects;
}

function evalPlayerValueConditional({
  self,
  opponent,
  result,
  ifPlayerValue,
}: {
  self: PlayerState;
  opponent: PlayerState;
  result: PlayCardResult;
  ifPlayerValue: IfPlayerValueOptions;
}) {
  const value = getPlayerValue({ self, opponent, identifier: ifPlayerValue });
  return evalConditional({ self, opponent, result, value, comparable: ifPlayerValue });
}

function evalBattleStatConditional({
  self,
  opponent,
  result,
  ifBattleStat,
}: {
  self: PlayerState;
  opponent: PlayerState;
  result: PlayCardResult;
  ifBattleStat: IfBattleStatOptions;
}) {
  const { battleStats } = result;

  const value = battleStats[ifBattleStat.name];
  return evalConditional({ self, opponent, result, value, comparable: ifBattleStat });
}

function evalConditional({
  self,
  opponent,
  result,
  value,
  comparable,
}: {
  self: PlayerState;
  opponent: PlayerState;
  result: PlayCardResult;
  value: number;
  comparable: Comparable;
}) {
  const { battleStats } = result;
  const {
    comparison,
    multiplier = 1,
    compareToValue,
    compareToPlayerValue,
    compareToBattleStat,
  } = comparable;

  if (compareToValue != null) {
    const compareTo = compareToValue * multiplier;
    if (!compareValues({ value, compareTo, comparison })) return false;
  }

  if (compareToPlayerValue != null) {
    const compareTo =
      getPlayerValue({ self, opponent, identifier: compareToPlayerValue }) * multiplier;
    if (!compareValues({ value, compareTo, comparison })) return false;
  }

  if (compareToBattleStat != null) {
    const compareTo = battleStats[compareToBattleStat.name] * multiplier;
    if (!compareValues({ value, compareTo, comparison })) return false;
  }

  return true;
}

function compareValues({
  value,
  compareTo,
  comparison,
}: {
  value: number;
  compareTo: number;
  comparison: Comparable['comparison'];
}) {
  if (comparison === '>') return value > compareTo;
  if (comparison === '<') return value < compareTo;
  if (comparison === '=') return value === compareTo;
  if (comparison === '>=') return value >= compareTo;
  if (comparison === '<=') return value <= compareTo;

  throw new Error(`invalid comparison: ${comparison}`);
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
      result.events.push({ type: 'miss', target });
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

  if (target === 'opponent') {
    damage += self.strength;
    if (targetPlayer.bleed) {
      damage += 3;
      targetPlayer.bleed -= 1;
    }
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

  const trashStart = target === 'self' ? currentCardIndex + 1 : currentCardIndex;
  const removeFromFront = Math.max(trashStart + trash - cards.length, 0);

  targetPlayer.cards = cards.filter((_, i) => {
    const removeCard =
      // trash cards after or at the current card
      (i >= trashStart && i < trashStart + trash) ||
      // trash cards from the front of the deck
      i < removeFromFront;

    if (removeCard) {
      targetPlayer.trashedCards.push(cards[i]);
    }

    return !removeCard;
  });

  targetPlayer.currentCardIndex = Math.max(currentCardIndex - removeFromFront, 0);
}

function trashCurrentCard(player: PlayerState) {
  const [card] = player.cards.splice(player.currentCardIndex, 1);
  player.trashedCards.push(card);
  player.currentCardIndex -= 1;
}
