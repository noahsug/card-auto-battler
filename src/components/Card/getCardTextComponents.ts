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

// const damageAndStrengthFromBleed = {
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

const SYMBOL_NAMES = ['damage', 'heal', ...statusEffectNames] as const;
const KEYWORDS = ['trash'] as const;

type SymbolName = (typeof SYMBOL_NAMES)[number];
type Keyword = (typeof KEYWORDS)[number];

export interface PlainText {
  type: 'plain';
  text: string;
}

export interface SymbolText {
  type: 'symbol';
  symbolName: SymbolName;
}

export interface KeywordText {
  type: 'keyword';
  keyword: Keyword;
  text: string;
}

export interface ValueText {
  type: 'value';
  value: number;
}

export type TextComponent = PlainText | SymbolText | KeywordText | ValueText;

function getPlainText(text: string): PlainText {
  return { type: 'plain', text: text };
}

function getValueText(value: number): ValueText {
  return { type: 'value', value };
}

function getSymbolText(symbolName: SymbolName): SymbolText {
  return { type: 'symbol', symbolName };
}

function getKeywordText(text: string, keyword: Keyword): KeywordText {
  if (!text) {
    if (readonlyIncludes(KEYWORDS, text)) {
      keyword = text;
    } else {
      throw new Error(`Unknown keyword: ${text}, please specify a keyword`);
    }
  }
  return { type: 'keyword', keyword, text };
}

// Intermediate type for building text components.
type TextBuilder = (string | TextComponent | TextBuilder)[];

// Given a self targeted string, transforms it into an enemy targeted string if needed.
function getTargetedText(text: string, target: Target) {
  const selfTextToEnemyText: Record<string, string> = {
    You: 'Enemy',
    Take: 'Deal',
    Gain: 'Apply',
    your: `the enemy's`,
    you: 'the enemy',
    [`you've`]: 'the enemy has',
    'you have': 'the enemy has',
  };

  if (selfTextToEnemyText[text] == null) throw new Error(`Unknown targeted text: ${text}`);

  return target === 'self' ? text : selfTextToEnemyText[text];
}

// deal with
//  - (if you have 3) "cards in your deck" <-- only handling this case currently
//  - (equal to) "the number of cards in your deck"
//  - (for each) "card in your deck"
function getPlayerValueText(playerValue: IdentifiablePlayerValue) {
  if (SYMBOL_NAMES.includes(playerValue as SymbolName)) {
    return getSymbolText(playerValue as SymbolName);
  }

  switch (playerValue) {
    case 'health':
      return 'HP';
    case 'startingHealth':
      return 'max HP';
    case 'cards':
      return 'cards in your deck';
  }

  // case 'cardsPlayedThisTurn':
  //   return 'cards played this turn';
  // case 'trashedCards':
  //   return 'trashed cards';

  return playerValue;
}

function getMoreThanText(comparison: If['comparison']): string {
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

function getMoreThanXText({ compareTo, comparison }: Pick<If, 'compareTo' | 'comparison'>) {
  // TODO: implement compare to player value
  if (compareTo.type !== 'value') return '';

  const isCheckingExistence =
    compareTo.type === 'value' &&
    ((comparison === '>' && compareTo.value === 0) ||
      (comparison === '>=' && compareTo.value === 1));

  if (isCheckingExistence) {
    // (if you have) "" (bleed)
    return '';
  }

  const moreThan = getMoreThanText(comparison);
  const x = getValueText(compareTo.value);

  // (if you have) "more than 3" (bleed)
  return [moreThan, x];
}

function getMainEffectComponents(effect: CardEffect): TextBuilder {
  if (effect.name === 'trash') {
    const targetComponent = getPlainText(getTargetedText('You', effect.target));
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
  const applyComponent = getPlainText(getTargetedText(applyText, effect.target));
  const effectComponent = getSymbolText(effect.name);

  if (effect.multiplyBy) {
    // Deal damage" (equal to...)
    return [applyComponent, effectComponent];
  }

  // "Deal 3 damage"
  const valueComponent = getValueText(effect.value);
  return [applyComponent, valueComponent, effectComponent];
}

function getMultiplyByComponents(effect: CardEffect): TextBuilder {
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
    const targetText = getTargetedText(`you've`, multiplyBy.type);
    return [getPlainText(`${equalToText} the number of cards ${targetText} played this turn`)];
  }

  if (multiplyBy.name === 'trashedCards') {
    // "the number of cards you've trashed"
    const targetText = getTargetedText(`you've`, multiplyBy.type);
    return [getPlainText(`${equalToText} the number of cards ${targetText} trashed`)];
  }

  // "your"
  equalToText += ` ${getTargetedText('your', multiplyBy.type)}`;

  if (readonlyIncludes(statusEffectNames, multiplyBy.name)) {
    // "bleed"
    const effectComponent = getSymbolText(multiplyBy.name);
    return [getPlainText(equalToText), effectComponent];
  }

  // "health"
  return [getPlainText(`${equalToText} ${getPlayerValueText(multiplyBy.name)}`)];
}

function getMultiHitComponents(effect: CardEffect): TextBuilder {
  if (!effect.multiHit) return [];

  // "2 times"
  return [getValueText(effect.multiHit), getPlainText('times')];
}

function getIfText(effect: CardEffect): TextBuilder {
  if (!effect.if) return [];

  const { playerValue } = effect.if;

  const moreThanX = getMoreThanXText(effect.if);

  // used for "if you have 3 ..." (e.g. bleed, HP, max HP)
  const isSimpleValue =
    readonlyIncludes(statusEffectNames, playerValue) ||
    playerValue === 'health' ||
    playerValue === 'startingHealth' ||
    playerValue === 'cards';

  if (isSimpleValue) {
    const ifYouHave = ['if', getTargetedText('you have', effect.if.type)];
    const condition = getPlayerValueText(playerValue);

    return [ifYouHave, moreThanX, condition];
  }

  const ifYouve = ['if', getTargetedText(`you've`, effect.if.type)];

  if (playerValue === 'trashedCards') {
    return [ifYouve, 'trashed', moreThanX, 'cards'];
  }

  if (playerValue === 'cardsPlayedThisTurn') {
    return [ifYouve, 'played', moreThanX, 'cards this turn'];
  }

  return [];
}

function getEffectTextComponents(effect: CardEffect): TextBuilder {
  // "Deal 3 damage" or "Enemy trashes cards" (equal to...)
  const mainEffectComponents = getMainEffectComponents(effect);

  // "equal to the enemy's bleed"
  const multiplyByComponents = getMultiplyByComponents(effect);

  // "2 times"
  const multiHitComponents = getMultiHitComponents(effect);

  // "if the enemy has dodge"
  const ifComponents = getIfText(effect);

  return [...mainEffectComponents, ...multiplyByComponents, ...multiHitComponents, ...ifComponents];
}

// Before:
//   ['You', [K('trash'), ['', V(3)], 'cards']]
// After:
//   ['You ', K('trash'), ' ', V(3), ' cards']
function buildTextComponents(textBuilder: TextBuilder): TextComponent[] {
  // remove all nested arrays
  let flatTextBuilder = textBuilder.flat(20) as (string | TextComponent)[];

  // remove empty strings
  flatTextBuilder = flatTextBuilder.filter((part) => part !== '');

  // insert spaces between each element, e.g. ['you', trash'] -> ['you', ' ', 'trash']
  flatTextBuilder = flatTextBuilder.reduce<typeof flatTextBuilder>((result, part, i) => {
    if (i === 0) {
      return [part];
    }
    return result.concat(' ', part);
  }, []);

  // convert strings to plain text components
  return flatTextBuilder.reduce<TextComponent[]>((components, part, i) => {
    if (typeof part === 'string') {
      const prevComponent = components[i - 1];
      if (prevComponent && prevComponent.type === 'plain') {
        // combine multiple strings in a row into a single plain text component
        prevComponent.text = `${prevComponent.text}${part}`;
        // remove extra spaces
        prevComponent.text = prevComponent.text.replace(/\s+/g, ' ');
        // TODO: remove spaces before punctuation (e.g. 'you trash , gian' -> 'you trash, gain')
      } else {
        components.push(getPlainText(part));
      }
    } else {
      components.push(part);
    }

    return components;
  }, []);
}

export default function getCardTextComponents(card: CardState): TextComponent[][] {
  return card.effects.map(getEffectTextComponents).map(buildTextComponents);
}
