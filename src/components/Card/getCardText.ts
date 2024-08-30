import { Target, PlayerValueName } from '../../gameState/gameState';
import { assert, assertType } from '../../utils';
import {
  CardEffectName,
  CardEffect,
  CardState,
  ValueDescriptor,
  Repeat,
  BasicValueDescriptor,
  PlayerValueDescriptor,
} from '../../gameState/actions/playCardV2';
import { assertIsNonNullable, unreachable } from '../../utils/asserts';

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

// helper function to get a particular translation function, supports currying
function translate(subject: CardEffect | ValueDescriptor | Repeat): (text: string) => string;
function translate(subject: CardEffect | ValueDescriptor | Repeat, text: string): string;
function translate(effect: CardEffect | ValueDescriptor | Repeat, text?: string) {
  const t = (text: string) => translate(effect, text);
  if (text == null) return t;
}

function translateCardEffect(effect: CardEffect, text: string): string {
  const t = (text: string) => translate(effect, text);

  switch (text) {
    case `Deal damage equal to your bleed`:
      switch (effect.value.type) {
        case 'playerValue':
          return `${t(`Deal damage`)} ${t(`equal to your bleed`)}`;
        case 'basicValue':
          return t(`Deal 3 damage`);
      }
  }

  throw new Error(`cannot translate text: ${text}`);
}

function translate(effect: CardEffect | ValueDescriptor | Repeat, text?: string) {
  const t = (text: string) => translate(effect, text);
  if (text == null) return t;

  switch (text) {
    case `Deal damage equal to your bleed`:
      switch (effect.value.type) {
        case 'playerValue':
          return `${t(`Deal damage`)} ${t(`equal to your bleed`)}`;
        case 'basicValue':
          return t(`Deal 3 damage`);
      }
      // TODO: effect.value.type satisfies never
      return unreachable();

    case `Deal damage`:
      if (name === 'trash') {
        return t(`Enemy trashes`);
      }
      if (name === 'extraCardPlays') {
        return 'Enemy plays cards';
      }
      return `${t(`Deal`)} ${t(`damage`)}`;

    case `Deal 3 damage`:
      if (name === 'trash') {
        return `${t(`Enemy trashes`)} ${t('3')}`;
      }
      if (name === 'extraCardPlays') {
        return `${t('Enemy plays 3 extra cards next turn')}`;
      }
      return `${t(`Deal`)} ${t('3')} ${t(`damage`)}`;

    case 'Enemy plays 3 extra cards next turn':
      if (target === 'self') {
        return `Play ${t('3')} ${t('cards')}`;
      }
      return `Enemy plays ${t('3')} extra ${t('cards')} next turn`;

    case 'cards':
      assertType(value, 'basicValue' as const);
      return value.value === 1 ? 'card' : 'cards';

    case `equal to your bleed`: {
      const tm = getTranslateFn(effect, effect.value);
      return `equal to ${t('twice')} ${tm('your bleed')}`;
    }

    case `twice`:
      assertType(value, 'playerValue' as const);
      // TODO: update typescript and use assert('multiplier' in value);
      switch (value.multiplier) {
        case undefined:
        case 1:
          return '';
        case 2:
          return 'twice';
        case 0.5:
          return 'half';
        default:
          if (value.multiplier > 1) {
            return `${value.multiplier} times`;
          }
          // 1/4
          return `1/${1 / value.multiplier}`;
      }

    case `your bleed`:
      if (name === 'trashedCards') {
        return `the number of cards ${t(`you've`)} trashed`;
      }
      if (name === 'cardsPlayedThisTurn') {
        return `the number of cards ${t(`you've`)} played this turn`;
      }
      return `${t(`your`)} ${t('bleed')}`;

    case `if the enemy has more than X bleed`: {
      if (!effect.if) return '';
      // not supported yet
      assert(effect.if.value.multiplier == null);

      const tv = getTranslateFn(effect, effect.if.value);
      switch (effect.if.value.name) {
        case 'trashedCards':
          return `if ${tv(`you've`)} trashed ${t('more than 3')} cards`;

        case 'cardsPlayedThisTurn':
          return `if ${tv(`you've`)} played ${t('more than 3')} cards this turn`;

        default:
          return `if ${tv('you have')} ${t('more than 3')} ${tv('bleed')}`;
      }
    }

    case `more than 3`: {
      assertIsNonNullable(effect.if);
      const { comparison, value2 } = effect.if;
      const isCheckingExistence =
        (comparison === '>' && value2.value === 0) || (comparison === '>=' && value2.value === 1);
      if (isCheckingExistence) {
        // (if you have) "" (bleed)
        return '';
      }
      const tv2 = getTranslateFn(effect, effect.if.value2);
      return `${t('more than')} ${tv2(`3`)}`;
    }

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
      return target === 'self' ? `You trash` : `Enemy trashes`;

    case `Deal`: {
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
    }

    case `you've`:
      return target === 'self' ? `you've` : `the enemy has`;

    case `you have`:
      return target === 'self' ? `you have` : `the enemy has`;

    case `your`:
      return target === 'self' ? `your` : `the enemy's`;

    case 'bleed':
    case 'damage':
      if (name === 'health') return 'HP';
      return name;

    case `3 times`:
      if (effect.multiHit == null || effect.multiHit === 1) return '';
      return `${effect.multiHit} times`;

    case '3':
      assertType(value, 'basicValue' as const);
      return String(value.value);
  }

  throw new Error(`cannot translate text: ${text}`);
}

function getCardEffectText(effect: CardEffect): string {
  const t = getTranslateFn(effect);

  return [
    t(`Deal damage equal to your bleed`),
    t(`3 times`),
    t(`if the enemy has more than X bleed`),
  ].join(' ');
}

// Remove extra spaces
function fixSpacing(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

export default function getCardText(card: CardState): string[] {
  // const text = [
  //   ...card.effects.map(getCardEffectText),
  //   getRepeatText(card),
  // ]
  return card.effects.map(getCardEffectText).map(fixSpacing);
}
