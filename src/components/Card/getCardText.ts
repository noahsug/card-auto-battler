import { Target } from '../../gameState/gameState';
import { assert, assertType } from '../../utils';
import {
  CardEffect,
  CardState,
  ValueDescriptor,
  Repeat,
  BasicValueDescriptor,
  PlayerValueDescriptor,
  If,
} from '../../gameState/actions/playCardV2';
import { KeysOfUnion } from '../../utils/types';

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

type Translations =
  | ReturnType<typeof getTargetTranslations>
  | ReturnType<typeof getBasicValueTranslations>
  | ReturnType<typeof getPlayerValueTranslations>
  | ReturnType<typeof getIfTranslations>
  | ReturnType<typeof getEffectTranslations>
  | ReturnType<typeof getRepeatTranslations>;

function getTranslateFn(...getTranslationsFns: (() => Translations)[]) {
  return (text: KeysOfUnion<Translations>): string => {
    for (const getTranslations of getTranslationsFns) {
      const translations = getTranslations();
      if (text in translations) {
        // @ts-expect-error KeysOfUnion<Translations> can't be used to index Translations
        return translations[text]();
      }
    }
    throw new Error(`no translation found for "${text as string}"`);
  };
}

function getTargetTranslations(target: Target) {
  return {
    [`you've`]: () => {
      return target === 'self' ? `you've` : `the enemy has`;
    },

    [`you have`]: () => {
      return target === 'self' ? `you have` : `the enemy has`;
    },

    [`your`]: () => {
      return target === 'self' ? `your` : `the enemy's`;
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

function getPlayerValueTranslations(playerValue: PlayerValueDescriptor) {
  const t = getTranslateFn(
    () => getPlayerValueTranslations(playerValue),
    () => getTargetTranslations(playerValue.target),
  );

  return {
    [`your bleed`]: () => {
      // not supported yet
      assert(playerValue.name != 'currentCardIndex');
      assert(playerValue.name != 'startingHealth');

      if (playerValue.name === 'trashedCards') {
        return `the number of cards ${t(`you've`)} trashed`;
      }
      if (playerValue.name === 'cardsPlayedThisTurn') {
        return `the number of cards ${t(`you've`)} played this turn`;
      }
      return `${t(`your`)} ${t('bleed')}`;
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
        default:
          if (playerValue.multiplier > 1) {
            return `${playerValue.multiplier} times`;
          }
          // 1/4
          return `1/${1 / playerValue.multiplier}`;
      }
    },
  };
}

function getValueTranslations(value: ValueDescriptor) {
  if (value.type === 'basicValue') return getBasicValueTranslations(value);
  return getPlayerValueTranslations(value);
}

function getIfTranslations(ifStatement: If) {
  const t = getTranslateFn(
    () => getIfTranslations(ifStatement),
    () => getPlayerValueTranslations(ifStatement.value),
    () => getTargetTranslations(ifStatement.value.target),
  );
  const t2 = getTranslateFn(() => getBasicValueTranslations(ifStatement.value2));

  return {
    [`if the enemy has more than 3 bleed`]: () => {
      // not supported yet
      assert(ifStatement.value.multiplier == null);

      switch (ifStatement.value.name) {
        case 'trashedCards':
          return `if ${t(`you've`)} trashed ${t('more than 3')} cards`;

        case 'cardsPlayedThisTurn':
          return `if ${t(`you've`)} played ${t('more than 3')} cards this turn`;

        default:
          return `if ${t('you have')} ${t('more than 3')} ${t('bleed')}`;
      }
    },

    [`more than 3`]: () => {
      const { comparison, value2 } = ifStatement;
      const isCheckingExistence =
        (comparison === '>' && value2.value === 0) || (comparison === '>=' && value2.value === 1);
      if (isCheckingExistence) {
        // (if you have) "" (bleed)
        return '';
      }
      return `${t('more than')} ${t2(`3`)}`;
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

function getEffectTranslations(effect: CardEffect) {
  const t = getTranslateFn(
    () => getEffectTranslations(effect),
    () => getValueTranslations(effect.value),
    () => getTargetTranslations(effect.target),
  );

  return {
    [`Deal damage equal to your bleed`]: () => {
      switch (effect.value.type) {
        case 'playerValue':
          return `${t(`Deal damage`)} ${t(`equal to your bleed`)}`;
        case 'basicValue':
          return t(`Deal 3 damage`);
      }
      return effect.value satisfies never;
    },

    [`Deal damage`]: () => {
      if (effect.name === 'trash') {
        return t(`Enemy trashes`);
      }
      if (effect.name === 'extraCardPlays') {
        return 'Enemy plays cards';
      }
      return `${t(`Deal`)} ${t(`damage`)}`;
    },

    [`Deal 3 damage`]: () => {
      if (effect.name === 'trash') {
        return `${t(`Enemy trashes`)} ${t('3')}`;
      }
      if (effect.name === 'extraCardPlays') {
        return `${t('Enemy plays 3 extra cards next turn')}`;
      }
      return `${t(`Deal`)} ${t('3')} ${t(`damage`)}`;
    },

    ['Enemy plays 3 extra cards next turn']: () => {
      if (effect.target === 'self') {
        return `Play ${t('3')} ${t('cards')}`;
      }
      return `Enemy plays ${t('3')} extra ${t('cards')} next turn`;
    },

    [`equal to your bleed`]: () => {
      return `equal to ${t('twice')} ${t('your bleed')}`;
    },

    [`Enemy trashes`]: () => {
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

    ['damage']: () => {
      return effect.name;
    },

    [`3 times`]: () => {
      if (effect.multiHit == null || effect.multiHit === 1) return '';
      return `${effect.multiHit} times`;
    },
  };
}

function getRepeatTranslations(repeat: Repeat) {
  // not supported yet
  assertType(repeat.value, 'playerValue' as const);
  assert(repeat.value.multiplier == null);
  assert(repeat.value.name != 'cardsPlayedThisTurn');
  assert(repeat.value.name != 'currentCardIndex');
  assert(repeat.value.name != 'extraCardPlays');
  assert(repeat.value.name != 'startingHealth');
  assert(repeat.value.name != 'trashedCards');

  const t = getTranslateFn(
    () => getRepeatTranslations(repeat),
    () => getValueTranslations(repeat.value),
    () => getTargetTranslations((repeat.value as PlayerValueDescriptor).target),
  );

  return {
    [`Repeat for each bleed you have`]: () => {
      return `Repeat for each ${t('bleed')} ${t('you have')}`;
    },
  };
}

function getCardEffectText(effect: CardEffect): string {
  const t = getTranslateFn(() => getEffectTranslations(effect));
  const ti = effect.if ? getTranslateFn(() => getIfTranslations(effect.if!)) : () => '';

  return [
    t(`Deal damage equal to your bleed`),
    effect.multiHit ? t(`3 times`) : '',
    effect.if ? ti(`if the enemy has more than 3 bleed`) : '',
  ].join(' ');
}

function getRepeatText(repeat: Repeat): string {
  const t = getTranslateFn(() => getRepeatTranslations(repeat));
  const ti = repeat.if ? getTranslateFn(() => getIfTranslations(repeat.if!)) : () => '';

  return [
    t(`Repeat for each bleed you have`),
    repeat.if ? ti(`if the enemy has more than 3 bleed`) : '',
  ].join(' ');
}

// Remove extra spaces
function fixSpacing(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

export default function getCardText(card: CardState): string[] {
  const linesOfText = card.effects.map(getCardEffectText);

  if (card.repeat) {
    linesOfText.push(getRepeatText(card.repeat));
  }

  return linesOfText.map(fixSpacing);
}
