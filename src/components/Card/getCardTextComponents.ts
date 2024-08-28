import { Target, PlayerValueName, statusEffectNames } from '../../gameState/gameState';
import { assertIsNonNullable, assert } from '../../utils';
import { readonlyIncludes } from '../../utils/iterators';
import {
  CardEffectName,
  CardEffect,
  ValueDescriptor,
  CardState,
} from '../../gameState/actions/playCardV2';

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

// Deal damage equal to the turn number.

// Deal damage and apply bleed equal to the number of cards you've played this turn.

// BAD: confusing, do not support
// Deal 3 damage and gain 2 strength if you have full HP.

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
type TextBuilder = string | TextComponent | TextBuilder[];

interface TranslateOverrides {
  name?: CardEffectName | PlayerValueName;
  target?: Target;
  value?: number;
}

function getTranslateMultiplyByFn(effect: CardEffect) {
  return (text: string) => {
    if (!effect.multiplyBy) return [];

    const overrides = {
      target: effect.multiplyBy.target,
      name: effect.multiplyBy.playerValue,
    };

    return translate(effect, text, overrides);
  };
}

function getTranslateIfFn(effect: CardEffect) {
  return (text: string) => {
    if (!effect.if) return [];

    // TODO: implement "if you have more health than the enemy"
    if (effect.if.compareTo.type !== 'value') return [];

    const overrides = {
      target: effect.if.target,
      name: effect.if.playerValue,
      value: (effect.if.compareTo as ValueDescriptor).value,
    };

    return translate(effect, text, overrides);
  };
}

// TODO: deal with
//  - (if you have 3) "cards in your deck" <-- only handling this case currently
//  - (equal to) "the number of cards in your deck"
//  - (for each) "card in your deck"
function translate(
  effect: CardEffect,
  text: string,
  overrides: TranslateOverrides = {},
): TextBuilder {
  const t = (text: string) => translate(effect, text, overrides);

  const name = overrides.name == null ? effect.name : overrides.name;
  const target = overrides.target == null ? effect.target : overrides.target;
  const value = overrides.value == null ? effect.value : overrides.value;

  switch (text) {
    case `Deal damage equal to your bleed`:
      if (effect.multiplyBy) {
        return [t(`Deal damage`), t(`equal to your bleed`)];
      }
      return t(`Deal 3 damage`);

    case `Deal damage`:
      if (name === 'trash') {
        return t(`Enemy trashes`);
      }
      if (name === 'extraCardPlays') {
        return ['Enemy plays cards'];
      }
      return [t(`Deal`), t(`damage`)];

    case `Deal 3 damage`:
      if (name === 'trash') {
        return [t(`Enemy trashes`), t(`3`)];
      }
      if (name === 'extraCardPlays') {
        return [t('Enemy plays 3 extra cards next turn')];
      }
      return [t(`Deal`), t(`3`), t(`damage`)];

    case 'Enemy plays 3 extra cards next turn':
      if (target === 'self') {
        return ['Play', t('3'), t('cards')];
      }
      return ['Enemy plays', t('3'), 'extra', t('cards'), 'next turn'];

    case 'cards':
      return value === 1 ? 'card' : 'cards';

    case `equal to your bleed`:
      const tm = getTranslateMultiplyByFn(effect);
      return ['equal to', t('twice'), tm('your bleed')];

    case `twice`:
      if (value === 1) {
        return '';
      }
      if (value === 2) {
        return 'twice';
      }
      if (value > 1) {
        return `${value} times`;
      }
      if (value === 0.5) {
        return 'half';
      }
      // 1/4
      return `1/${1 / value}`;

    case `your bleed`:
      if (name === 'trashedCards') {
        return [`the number of cards`, t(`you've`), `trashed`];
      }
      if (name === 'cardsPlayedThisTurn') {
        return [`the number of cards`, t(`you've`), `played this turn`];
      }
      return [t(`your`), t('bleed')];

    case `if the enemy has more than 3 bleed`:
      if (!effect.if) return [];

      const ti = getTranslateIfFn(effect);
      if (effect.if.playerValue === 'trashedCards') {
        return ['if', ti(`you've`), 'trashed', ti('more than 3'), 'cards'];
      }
      if (effect.if.playerValue === 'cardsPlayedThisTurn') {
        return ['if', ti(`you've`), 'played', ti('more than 3'), 'cards this turn'];
      }
      return ['if', ti('you have'), ti('more than 3'), ti('bleed')];

    case `more than 3`:
      assertIsNonNullable(effect.if);
      const { comparison } = effect.if;
      assert(effect.if.compareTo.type === 'value');

      const isCheckingExistence =
        (comparison === '>' && value === 0) || (comparison === '>=' && value === 1);
      if (isCheckingExistence) {
        // (if you have) "" (bleed)
        return '';
      }
      return [t(`more than`), t(`3`)];

    case `more than`:
      switch (effect.if?.comparison) {
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
      throw new Error(`Unknown comparison: ${effect.if?.comparison}`);

    case `Enemy trashes`:
      return target === 'self'
        ? ['You', getKeywordText('trash', 'trash')]
        : ['Enemy', getKeywordText('trashes', 'trash')];

    case `Deal`:
      if (effect.name === 'damage') {
        return target === 'self' ? 'Take' : 'Deal';
      }
      if (effect.target === 'self') {
        return 'Gain';
      }
      const isFriendlyEffect =
        effect.name === 'heal' || effect.name === 'strength' || effect.name === 'dodge';
      if (isFriendlyEffect) {
        return 'Enemy gains';
      }
      return 'Apply';

    case `you've`:
      return target === 'self' ? `you've` : `the enemy has`;

    case `you have`:
      return target === 'self' ? `you have` : `the enemy has`;

    case `your`:
      return target === 'self' ? `your` : `the enemy's`;

    case 'bleed':
    case `damage`:
      if (SYMBOL_NAMES.includes(name as SymbolName)) {
        return getSymbolText(name as SymbolName);
      }
      // if (effect.name === 'health') {
      //   return 'HP';
      // }
      // if (effect.name === 'startingHealth') {
      // }
      return '';

    case `3`:
      return getValueText(value);

    case `2 times`:
      if (!effect.multiHit) return [];
      return [getValueText(effect.multiHit), 'times'];
  }

  return [];
}

function getCardEffectText(effect: CardEffect): TextBuilder {
  const t = (text: string) => translate(effect, text);

  return [
    t(`Deal damage equal to your bleed`),
    t(`2 times`),
    t(`if the enemy has more than 3 bleed`),
  ];
}

// Before:
//   ['You', [K('trash'), ['', V(3)], 'cards']]
// After:
//   ['You ', K('trash'), ' ', V(3), ' cards']
function buildTextComponents(textBuilder: TextBuilder): TextComponent[] {
  if (typeof textBuilder === 'string') {
    // textBuilder is just plain text
    return [getPlainText(textBuilder)];
  }
  if ('type' in textBuilder) {
    // textBuilder is already a TextComponent
    return [textBuilder];
  }

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
  return card.effects.map(getCardEffectText).map(buildTextComponents);
}
