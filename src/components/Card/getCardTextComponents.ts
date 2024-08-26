import {
  StatusEffectName,
  Target,
  IdentifiablePlayerValue,
  statusEffectNames,
} from '../../gameState/gameState';
import { readonlyIncludes } from '../../utils/iterators';

// Deal 1 damage. Repeat for each bleed the enemy has.

// OLD WAY
// {
//   target: 'opponent',
//   damage: 1,
//   gainEffectsList: [
//     {
//       effects: { activations: 1 },
//       forEveryPlayerValue: { target: 'opponent', name: 'bleed' },
//     },
//   ],
// })

// const flushBleed = {
//   target: 'opponent',
//   effect: 'damage',
//   value: 1,
//   repeat: {
//     value: 1,
//     multiplyBy: {
//       type: 'opponent',
//       name: 'bleed',
//     },
//   },
// };

// Deal damage and gain strength equal to 2 times the enemy's bleed.

// const damgeAndStrengthFromBleed = {
//   target: 'opponent',
//   effect: 'damage',
//   and: {
//     target: 'self',
//     effect: 'strength',
//   },
//   value: 2,
//   // times: 1, (1 by default)
//   multiplyBy: {
//     type: 'opponent',
//     name: 'bleed',
//   },
// };

// Deal 10 damage.
// Take 5 damage if this misses.

// const highJumpKick = {
//   effects: [{
//     target: 'opponent',
//     effect: 'damage',
//     value: 10,
//   }],
//   then: {
//     effects: [{
//       target: 'self',
//       effect: 'damage',
//       value: 5,
//       if: {
//         type: 'miss',
//       },
//     }],
//   },
// };

// Deal 10 damage.
// Misses if you have more HP than the enemy.

// const damageIfHigherHP = {
//   effects: [{
//     target: 'opponent',
//     effect: 'damage',
//     value: 10,
//   }],
//   modify: {
//     effect: 'miss',
//     if: {
//       type: 'self',
//       name: 'health',
//       comparison: '>',
//       compareTo: {
//         type: 'opponent',
//       },
//     },
//   },
// };

// Deal 5 damage.
// Deals double damage if you have less than half HP.

// const doubleDamageIfLowHp = {
//   effects: [{
//     target: 'opponent',
//     effect: 'damage',
//     value: 5,
//   }],
//   modify: {
//     effect: 'doubleDamage',
//     if: {
//       type: 'maxHealth',
//       target: 'self',
//       comparison: '<',
//       value: 'half',
//     },
//   },
// };

// Deal 5 damage.
// Deals 3 extra damage if you have more HP than bleed.

// Deal 3 damage.
// Deals extra damage for every 5 missing health.
// Apply bleed equal to damage dealt.

// const damageForMissingHealth = {
//   target: 'opponent',
//   effect: 'damage',
//   value: 3,
//   additionalEffect: {
//     target: 'opponent',
//     effect: 'damage',
//     multiplyBy: {
//       type: 'playerValue',
//       target: 'opponent',
//       name: 'missingHealth',
//       divisor: 5,
//     },
//   },
//   additionalEffect: {
//     target: 'opponent',
//     effect: 'bleed',
//     value: 1,
//   },
// };
// }

// Deal damage and apply bleed equal to the number of cards you've played this turn.

// BAD: confusing, do not support
// Deal 3 damage and gain 2 strength if you have full HP.

type CardEffectName = StatusEffectName | 'damage' | 'heal' | 'trash';

interface CompareToPlayerValue {
  type: Target;
  name: IdentifiablePlayerValue;
}

interface CompareToValue {
  type: 'value';
  value: number;
}

interface If {
  type: Target;
  playerValue: IdentifiablePlayerValue;
  comparison: '>' | '<' | '=' | '<=' | '>=';
  compareTo: CompareToPlayerValue | CompareToValue;
}

export interface CardEffect {
  target: Target;
  name: CardEffectName;
  value: number;
  multiHit?: number;
  multiplyBy?: {
    type: Target;
    name: IdentifiablePlayerValue;
  };
  if?: If;
}

export interface CardState {
  effects: CardEffect[];
}

const SYMBOL_NAMES = ['damage', 'heal', ...statusEffectNames];
const KEYWORDS = ['trash'];

type SymbolName = (typeof SYMBOL_NAMES)[number];
type Keyword = (typeof KEYWORDS)[number];

interface PlainText {
  type: 'plain';
  text: string;
}

interface SymbolText {
  type: 'symbol';
  symbolName: SymbolName;
}

interface KeywordText {
  type: 'keyword';
  keyword: Keyword;
  text: string;
}

interface ValueText {
  type: 'value';
  value: number;
}

export type TextComponent = PlainText | SymbolText | KeywordText | ValueText;

function getPlainText(text: string): TextComponent {
  return { type: 'plain', text: text };
}

function getValueText(value: number): TextComponent {
  return { type: 'value', value };
}

function getSymbolText(effectName: CardEffectName): SymbolText {
  return { type: 'symbol', symbolName: effectName };
}

function getKeywordText(text: string, keyword: Keyword): KeywordText {
  return { type: 'keyword', keyword, text };
}

// Given a self targeted string, transforms it into an enemy targeted string if needed.
function targeted(text: string, target: Target) {
  const selfTextToEnemyText: Record<string, string> = {
    You: 'Enemy',
    Take: 'Deal',
    Gain: 'Apply',
    your: `the enemy's`,
    you: 'the enemy',
    [`you've`]: 'the enemy has',
  };

  if (selfTextToEnemyText[text] == null) throw new Error(`Unknown targeted text: ${text}`);

  return target === 'self' ? text : selfTextToEnemyText[text];
}

function getPlayerValueText(name: IdentifiablePlayerValue) {
  if (name === 'health') return 'HP';
  if (name === 'startingHealth') return 'max HP';
  if (name === 'cardsPlayedThisTurn') return 'cards played this turn';
  if (name === 'trashedCards') return 'trashed cards';

  return name;
}

function getMainEffectComponents(effect: CardEffect): TextComponent[] {
  if (effect.name === 'trash') {
    const targetComponent = getPlainText(targeted('You', effect.target));
    const effectText = effect.target === 'self' ? 'trash' : 'trashes';
    const effectComponent = getKeywordText(effectText, effect.name);

    if (effect.multiplyBy) {
      // "You trash cards" (equal to...)
      return [targetComponent, effectComponent, getPlainText('cards')];
    }

    // "Enemy trashes 2"
    const valueComponent = getValueText(effect.value);
    return [targetComponent, effectComponent, valueComponent];
  }

  const applyText = effect.name === 'damage' ? 'Take' : 'Gain';
  const applyComponent = getPlainText(targeted(applyText, effect.target));
  const effectComponent = getSymbolText(effect.name);

  if (effect.multiplyBy) {
    // Deal damage" (equal to...)
    return [applyComponent, effectComponent];
  }

  // "Deal 3 damage"
  const valueComponent = getValueText(effect.value);
  return [applyComponent, valueComponent, effectComponent];
}

function getMultiplyByComponents(effect: CardEffect): TextComponent[] {
  if (!effect.multiplyBy) return [];

  const { multiplyBy } = effect;

  // "equal to"
  let equalToText = 'equal to';

  if (effect.value > 1) {
    // "twice" or "3 times"
    const numberText = effect.value === 2 ? 'twice' : `${effect.value} times`;
    equalToText += ` ${numberText}`;
  }

  if (effect.value < 1) {
    // "half" or "1/4"
    const numberText = effect.value === 0.5 ? 'half' : `1/${1 / effect.value}`;
    equalToText += ` ${numberText}`;
  }

  if (multiplyBy.name === 'cardsPlayedThisTurn') {
    // "the number of cards you've played this turn
    const targetText = targeted(`you've`, multiplyBy.type);
    return [getPlainText(`${equalToText} the number of cards ${targetText} played this turn`)];
  }

  if (multiplyBy.name === 'trashedCards') {
    // "the number of cards you've trashed"
    const targetText = targeted(`you've`, multiplyBy.type);
    return [getPlainText(`${equalToText} the number of cards ${targetText} trashed`)];
  }

  // "your"
  equalToText += ` ${targeted('your', multiplyBy.type)}`;

  if (readonlyIncludes(statusEffectNames, multiplyBy.name)) {
    // "bleed"
    const effectComponent = getSymbolText(multiplyBy.name);
    return [getPlainText(equalToText), effectComponent];
  }

  // "health"
  return [getPlainText(`${equalToText} ${getPlayerValueText(multiplyBy.name)}`)];
}

function getMultiHitComponents(effect: CardEffect): TextComponent[] {
  if (!effect.multiHit) return [];

  // "2 times"
  return [getValueText(effect.multiHit), getPlainText('times')];
}

function getComparisonText(comparison: If['comparison']): string {
  switch (comparison) {
    case '>':
      return 'more than';
    case '<':
      return 'less than';
    case '=':
      return '';
    case '<=':
      return 'no more than';
    case '>=':
      return 'at least';
  }
}

function getIfComponents(effect: CardEffect): TextComponent[] {
  if (!effect.if) return [];

  // TODO: Implement
  if (effect.if.compareTo.type !== 'value') return [];

  // const { playerValue } = effect.if;

  // const ifYouHave = ['if', getTargetedText('you have', effect.if.type)];
  // const moreThanX = getMoreThanXText(effect.if);

  // if (readonlyIncludes(statusEffectNames, playerValue) || playerValue === 'health') {
  //   const playerValue = getPlayerValueText(playerValue);
  //   return [ifYouHave, moreThanX, playerValue];
  // }

  // if (playerValue === 'trashedCards') {
  //   return [ifYouHave, 'trashed', moreThanX, 'cards'];
  // }

  // if (playerValue === 'cardsPlayedThisTurn') {
  //   return [ifYouHave, 'played', moreThanX, 'cards this turn'];
  // }

  const { type: ifType, playerValue: ifName, comparison, compareTo } = effect.if;

  // if you have dodge
  // if you have 3 dodge
  // if you have at least 3 dodge
  // if you have trashed cards
  // if you have trashed 3 cards
  // if you have trashed at least 3 cards
  // if you have played X cards this turn
  // if you have more than 10 health
  // if you have full health

  const isCheckingStatusEffect = readonlyIncludes(statusEffectNames, ifName);

  if (isCheckingStatusEffect) {
    const targetText = targeted('you', ifType);
    const hasText = ifType === 'self' ? 'have' : 'has';

    const isCheckingGreaterThanZero =
      compareTo.type === 'value' &&
      ((comparison === '>' && compareTo.value === 0) ||
        (comparison === '>=' && compareTo.value === 1));
    const comparisonText = isCheckingGreaterThanZero ? '' : ` ${getComparisonText(comparison)}`;

    const ifTargetHas = getPlainText(`if ${targetText} ${hasText}${comparisonText}`);
    const valueComponents = isCheckingGreaterThanZero
      ? []
      : [getValueText((compareTo as CompareToValue).value)];
    const effectComponent = getSymbolText(ifName);

    // "if the enemy has dodge" or "if you have at least 3 dodge"
    return [ifTargetHas, ...valueComponents, effectComponent];
  }

  return [];
}

function cleanupTextComponents(components: TextComponent[]): TextComponent[] {
  return components;
}

function getEffectTextComponents(effect: CardEffect): TextComponent[] {
  // "Deal 3 damage" or "Enemy trashes cards" (equal to...)
  const mainEffectComponents = getMainEffectComponents(effect);

  // "equal to the enemy's bleed"
  const multiplyByComponents = getMultiplyByComponents(effect);

  // "2 times"
  const multiHitComponents = getMultiHitComponents(effect);

  // "if the enemy has dodge"
  const ifComponents = getIfComponents(effect);

  // .flat(Infinity)
  // text, value, keyword

  return cleanupTextComponents([
    ...mainEffectComponents,
    ...multiplyByComponents,
    ...multiHitComponents,
    ...ifComponents,
  ]);
}

export default function getCardTextComponents(card: CardState): TextComponent[][] {
  return card.effects.map(getEffectTextComponents);
}
