import { assert, assertIsNonNullable, assertType } from '../../utils';
import {
  CardEffect,
  CardState,
  ValueDescriptor,
  MaybeValue,
  BasicValueDescriptor,
  PlayerValueDescriptor,
  If,
  Target,
  CardEffectName,
} from '../../gameState/gameState';
import { KeysOfUnion } from '../../utils/types';
import { assertEqual, assertNotEqual } from '../../utils/asserts';

type Translations = { [key: string]: () => string };

// note: We need getTranslationsList to be a function (rather that simply passing in the
// translations list) to avoid an infinite loop.
function getTranslationFn<T extends Translations>(getTranslationsList: () => T[]) {
  return (text: KeysOfUnion<T>): string => {
    const translations = getTranslationsList().find((t) => text in t);

    // return an empty string when an optional property is missing, e.g. when we see
    // t('if the enemy has more than 3 bleed') but `effect.if` is undefined
    if (!translations) return '';

    return translations[text]();
  };
}

interface ValueOptions {
  prevTarget?: Target;
  prevEffect?: CardEffectName;
}

function getNestedPlayerValueTranslations(
  playerValue: PlayerValueDescriptor,
  options: ValueOptions = {},
) {
  return [
    getPlayerValueTranslations(playerValue, options),
    getTargetTranslations(playerValue.target),
  ];
}

function getNestedValueTranslations(value: ValueDescriptor, options: ValueOptions = {}) {
  return value.type === 'basicValue'
    ? [getBasicValueTranslations(value)]
    : getNestedPlayerValueTranslations(value, options);
}

function getNestedIfTranslations(ifStatement?: If, options: ValueOptions = {}) {
  if (ifStatement == null) return [];
  return [
    getIfTranslations(ifStatement, options),
    ...getNestedPlayerValueTranslations(ifStatement.value, options),
    getBasicValueTranslations(ifStatement.value2),
  ];
}

function getNestedRepeatTranslations(repeat: MaybeValue) {
  return [
    getRepeatTranslations(repeat),
    ...getNestedValueTranslations(repeat.value),
    ...getNestedIfTranslations(repeat.if),
  ];
}

interface EffectOptions {
  isAddingToValue?: boolean;
}

function getNestedEffectTranslations(effect: CardEffect, options: EffectOptions = {}) {
  const valueOptions = { prevTarget: effect.target, prevEffect: effect.name };
  return [
    getEffectTranslations(effect, options),
    getTargetTranslations(effect.target),
    ...getNestedValueTranslations(effect.value, valueOptions),
    ...getNestedIfTranslations(effect.if, valueOptions),
  ];
}

function getTargetTranslations(target: Target) {
  return {
    [`your`]: () => {
      return target === 'self' ? `your` : `the enemy's`;
    },
    ['Enemy']: () => {
      return target === 'self' ? `You` : `Enemy`;
    },
  };
}

function getBasicValueTranslations({ value }: BasicValueDescriptor) {
  return {
    ['cards']: () => {
      return value === 1 ? 'card' : 'cards';
    },

    ['3']: () => {
      return String(value);
    },
  };
}

function getPlayerValueTranslations(playerValue: PlayerValueDescriptor, options: ValueOptions) {
  const t = getTranslationFn(() => getNestedPlayerValueTranslations(playerValue, options));

  // not supported
  assertNotEqual(playerValue.name, 'currentCardIndex');
  assertNotEqual(playerValue.name, 'startingHealth');

  return {
    [`your bleed`]: (): string => {
      if (playerValue.name === 'trashedCards') {
        return `the number of cards ${t(`you've`)} trashed`;
      }
      if (playerValue.name === 'cardsPlayedThisTurn') {
        return `the number of cards ${t(`you've`)} played ${t('this turn')}`;
      }
      return `${t(`your`)} ${t('bleed')}`;
    },
    [`you have`]: () => {
      if (
        options.prevTarget === 'opponent' &&
        playerValue.target === 'opponent' &&
        (options.prevEffect === 'extraCardPlays' || options.prevEffect === 'trash')
      ) {
        return 'they have';
      }
      return playerValue.target === 'self' ? `you have` : `the enemy has`;
    },

    [`you've`]: () => {
      return playerValue.target === 'self' ? `you've` : `the enemy`;
    },

    ['this turn']: (): string => {
      return playerValue.target === 'opponent' ? 'last turn' : 'this turn';
    },

    ['bleed']: () => {
      if (playerValue.name === 'health') return 'HP';
      return playerValue.name;
    },

    [`twice`]: () => {
      switch (playerValue.multiplier) {
        case undefined:
        case 1:
          return '';
        case 2:
          return 'twice';
        case 0.5:
          return 'half';
        default: {
          if (playerValue.multiplier > 1) {
            return `${playerValue.multiplier} times`;
          }
          // 1/4
          const denominator = (1 / playerValue.multiplier).toFixed(0);
          return `1/${denominator}`;
        }
      }
    },
  };
}

function getIfTranslations(ifStatement: If, options: ValueOptions) {
  const t = getTranslationFn(() => getNestedIfTranslations(ifStatement, options));

  // not supported
  assert(
    ifStatement.value.multiplier === 1 || ifStatement.value.multiplier == null,
    'if multiplier not supported',
  );

  return {
    [`if the enemy has more than 3 bleed`]: (): string => {
      switch (ifStatement.value.name) {
        case 'trashedCards':
          return `if ${t(`you've`)} trashed ${t('more than 3')} cards`;

        case 'cardsPlayedThisTurn':
          return `if ${t(`you've`)} played ${t('more than 3')} cards this turn`;

        default:
          return `if ${t('you have')} ${t('more than 3')} ${t('bleed')}`;
      }
    },

    [`more than 3`]: (): string => {
      const { comparison, value2 } = ifStatement;
      const isCheckingExistence =
        (comparison === '>' && value2.value === 0) || (comparison === '>=' && value2.value === 1);
      if (isCheckingExistence) {
        // (if you have) "" (bleed)
        return '';
      }
      return `${t('more than')} ${t(`3`)}`;
    },

    [`more than`]: () => {
      switch (ifStatement.comparison) {
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
      return ifStatement.comparison satisfies never;
    },
  };
}

function getEffectTranslations(effect: CardEffect, options: EffectOptions = {}) {
  const t = getTranslationFn(() => getNestedEffectTranslations(effect, options));

  return {
    [`Deal damage equal to your bleed`]: (): string => {
      switch (effect.value.type) {
        case 'playerValue':
          if (
            options.isAddingToValue &&
            effect.target === 'opponent' &&
            effect.name === 'damage' &&
            effect.value.name === 'strength'
          ) {
            const x = (effect.value.multiplier || 1) + 1;
            return `Strength affects this card ${x} times`;
          }
          if (
            effect.target === effect.value.target &&
            effect.name === effect.value.name &&
            effect.name !== 'extraCardPlays'
          ) {
            return `${t('Triple')} ${t('your bleed')}`;
          }
          return `${t(`Deal damage`)} ${t(`equal to your bleed`)}`;
        case 'basicValue':
          return t(`Deal 3 damage`);
      }
      return effect.value satisfies never;
    },

    ['Triple']: (): string => {
      assertType(effect.value, 'playerValue');
      const multiplier = (effect.value.multiplier || 1) + 1;

      switch (multiplier) {
        case 2:
          return 'Double';
        case 3:
          return 'Triple';
        case 4:
          return 'Quadruple';
        default: {
          return `${multiplier}x`;
        }
      }
    },

    [`Deal damage`]: (): string => {
      if (effect.name === 'trash') {
        return `${t(`You trash`)} ${t('extra')}`;
      }
      if (effect.name === 'extraCardPlays') {
        return t('Enemy plays extra cards next turn');
      }
      return `${t(`Deal`)} ${t(`extra`)} ${t(`damage`)}`;
    },

    [`Deal 3 damage`]: (): string => {
      if (effect.name === 'trash') {
        return `${t(`You trash`)} ${t('3')} ${t('extra')}`;
      }
      if (effect.name === 'extraCardPlays') {
        return `${t('Enemy plays 3 extra cards next turn')}`;
      }
      return `${t(`Deal`)} ${t('+')}${t('3')} ${t(`extra`)} ${t(`damage`)}`;
    },

    ['Deal double damage']: (): string => {
      const { multiply } = effect;
      if (multiply == null) return '';

      // not supported - would need 'Apply twice as much poison if...'
      assertEqual(effect.name, 'damage');

      return `${t('Deal')} ${t('double')} ${t(`damage`)}`;
    },

    ['Enemy plays 3 extra cards next turn']: (): string => {
      if (effect.target === 'self') {
        return `Play ${t('3')} ${t(`extra`)} ${t('cards')}`;
      }
      return `Enemy plays ${t('3')} extra ${t('cards')} next turn`;
    },

    ['Enemy plays extra cards next turn']: (): string => {
      if (effect.target === 'self') {
        return `Play ${t(`extra`)} cards`;
      }
      return `Enemy plays extra cards next turn`;
    },

    [`equal to your bleed`]: (): string => {
      return `equal to ${t('twice')} ${t('your bleed')}`;
    },

    [`You trash`]: () => {
      return effect.target === 'self' ? `You trash` : `Enemy trashes`;
    },

    [`Deal`]: () => {
      if (effect.name === 'damage') {
        return effect.target === 'self' ? 'Take' : 'Deal';
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
    },

    ['extra']: () => {
      if (!options.isAddingToValue) return '';
      if (effect.name === 'trash') return 'more';
      return 'extra';
    },

    ['+']: () => {
      return options.isAddingToValue && effect.name === 'damage' ? '+' : '';
    },

    ['damage']: () => {
      if (effect.name === 'heal') return 'HP';
      return effect.name;
    },

    [`3 times`]: () => {
      if (effect.multiHit == null || effect.multiHit === 1) return '';
      return `${effect.multiHit} times`;
    },

    ['double']: () => {
      const basicValue = effect.multiply?.value;
      assertIsNonNullable(basicValue);

      // not supported - "Damage is reduced by 50%"
      assert(basicValue.value > 1, `${basicValue.value} > 1`);

      switch (basicValue.value) {
        case 2:
          return 'double';
        case 3:
          return 'triple';
        case 4:
          return 'quadruple';
        default: {
          const percent = (basicValue.value * 100).toFixed(0);
          return `${percent}%`;
        }
      }
    },
  };
}

function getRepeatTranslations(repeat: MaybeValue) {
  const t = getTranslationFn(() => getNestedRepeatTranslations(repeat));

  // not supported
  if (repeat.value.type === 'playerValue') {
    assert(
      repeat.value.multiplier === 1 || repeat.value.multiplier == null,
      'repeat multiplier not supported',
    );
    assertNotEqual(repeat.value.name, 'cardsPlayedThisTurn');
    assertNotEqual(repeat.value.name, 'currentCardIndex');
    assertNotEqual(repeat.value.name, 'extraCardPlays');
    assertNotEqual(repeat.value.name, 'startingHealth');
    assertNotEqual(repeat.value.name, 'trashedCards');
  }

  return {
    [`Repeat for each bleed you have`]: (): string => {
      if (repeat.value.type === 'basicValue') {
        return `Repeat ${t('3')} times`;
      }
      return `Repeat for each ${t('bleed')} ${t('you have')}`;
    },
  };
}

function getAddText(effect: CardEffect) {
  if (effect.add == null) return '';

  const addEffect: CardEffect = Object.assign({}, effect, {
    value: effect.add.value,
    if: effect.add.if,
  });

  const t = getTranslationFn(() =>
    getNestedEffectTranslations(addEffect, { isAddingToValue: true }),
  );
  return `${t('Deal damage equal to your bleed')} ${t('if the enemy has more than 3 bleed')}`;
}

function getCardEffectText(effect: CardEffect) {
  const t = getTranslationFn(() => getNestedEffectTranslations(effect));
  const effectText = [
    t(`Deal damage equal to your bleed`),
    t(`3 times`),
    t(`if the enemy has more than 3 bleed`),
  ].join(' ');

  const addText = getAddText(effect);

  const tm = getTranslationFn(() => getNestedIfTranslations(effect.multiply?.if));
  const multiplyText = `${t('Deal double damage')} ${tm('if the enemy has more than 3 bleed')}`;

  return [effectText, addText, multiplyText];
}

function getRepeatText(repeat?: MaybeValue) {
  if (!repeat) return [];

  const t = getTranslationFn(() => getNestedRepeatTranslations(repeat));
  const text = `${t(`Repeat for each bleed you have`)} ${t('if the enemy has more than 3 bleed')}`;

  return [text];
}

// Remove extra spaces
function fixSpacing(text: string) {
  return text.trim().replace(/\s+/g, ' ');
}

function isNotEmpty(text: string) {
  return !text.match(/^\s*$/);
}

export default function getCardText(card: CardState): string[] {
  return [...card.effects.flatMap(getCardEffectText), ...getRepeatText(card.repeat)]
    .filter(isNotEmpty)
    .map(fixSpacing);
}
