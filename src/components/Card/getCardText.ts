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
import { unreachable } from '../../utils/asserts';

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

type TranslateSubject = CardEffect | ValueDescriptor | Repeat | If;

// helper function to get a particular translation function, supports currying
function translate(subject: TranslateSubject): (text: string) => string;
function translate(subject: TranslateSubject, text: string): string;
function translate(subject: TranslateSubject, text?: string): string | ((text: string) => string) {
  // curry subject
  if (text == null) return (text: string) => translate(subject, text);

  const translation = getTranslationForSubject(subject, text);
  if (translation != null) return translation;

  throw new Error(`cannot translate "${text}" from subject: ${JSON.stringify(subject, null, 2)}`);
}

function getTranslationForSubject(subject: TranslateSubject, text: string): string | undefined {
  // if
  if ('comparison' in subject) {
    const translation = translateIf(subject, text);
    if (translation != null) return translation;
  }

  const hasType = 'type' in subject;

  // basic value
  if (hasType && subject.type === 'basicValue') {
    const translation = translateBasicValue(subject, text);
    if (translation != null) return translation;
  }

  // player value
  if (hasType && subject.type === 'playerValue') {
    const translation = translatePlayerValue(subject, text);
    if (translation != null) return translation;
  }

  const hasName = 'name' in subject;
  const hasTarget = 'target' in subject;
  const hasValue = 'value' in subject;

  // card effect
  if (hasName && hasTarget && hasValue) {
    const translation = translateCardEffect(subject, text);
    if (translation != null) return translation;
  }

  // repeat
  if (hasValue && typeof subject.value === 'object') {
    const translation = translateRepeat(subject as Repeat, text);
    if (translation != null) return translation;
  }

  // target
  if (hasTarget) {
    const translation = translateTarget(subject.target, text);
    if (translation != null) return translation;
  }

  // subject.value
  if (hasValue && typeof subject.value === 'object') {
    const translation = getTranslationForSubject(subject.value, text);
    if (translation != null) return translation;
  }

  // subject.if
  if ('if' in subject && subject.if) {
    const translation = getTranslationForSubject(subject.if, text);
    if (translation != null) return translation;
  }
}

function translateTarget(target: Target, text: string) {
  switch (text) {
    case `you've`:
      return target === 'self' ? `you've` : `the enemy has`;

    case `you have`:
      return target === 'self' ? `you have` : `the enemy has`;

    case `your`:
      return target === 'self' ? `your` : `the enemy's`;
  }
}

function translateBasicValue({ value }: BasicValueDescriptor, text: string) {
  switch (text) {
    case 'cards':
      return value === 1 ? 'card' : 'cards';

    case '3':
      return String(value);
  }
}

function translatePlayerValue(playerValue: PlayerValueDescriptor, text: string) {
  const t = translate(playerValue);

  // not supported yet
  assert(playerValue.name != 'currentCardIndex');
  assert(playerValue.name != 'startingHealth');

  switch (text) {
    case `your bleed`:
      if (playerValue.name === 'trashedCards') {
        return `the number of cards ${t(`you've`)} trashed`;
      }
      if (playerValue.name === 'cardsPlayedThisTurn') {
        return `the number of cards ${t(`you've`)} played this turn`;
      }
      return `${t(`your`)} ${t('bleed')}`;

    case 'bleed':
      if (playerValue.name === 'health') return 'HP';
      return playerValue.name;

    case `twice`:
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
  }
}

function translateIf(ifStatement: If, text: string) {
  const t = translate(ifStatement);

  switch (text) {
    case `if the enemy has more than 3 bleed`: {
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
    }

    case `more than 3`: {
      const { comparison, value2 } = ifStatement;
      const isCheckingExistence =
        (comparison === '>' && value2.value === 0) || (comparison === '>=' && value2.value === 1);
      if (isCheckingExistence) {
        // (if you have) "" (bleed)
        return '';
      }
      const t2 = translate(ifStatement.value2);
      return `${t('more than')} ${t2(`3`)}`;
    }

    case `more than`:
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
      unreachable();
  }
}

function translateCardEffect(effect: CardEffect, text: string) {
  const t = translate(effect);

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
      if (effect.name === 'trash') {
        return t(`Enemy trashes`);
      }
      if (effect.name === 'extraCardPlays') {
        return 'Enemy plays cards';
      }
      return `${t(`Deal`)} ${t(`damage`)}`;

    case `Deal 3 damage`: {
      if (effect.name === 'trash') {
        return `${t(`Enemy trashes`)} ${t('3')}`;
      }
      if (effect.name === 'extraCardPlays') {
        return `${t('Enemy plays 3 extra cards next turn')}`;
      }
      return `${t(`Deal`)} ${t('3')} ${t(`damage`)}`;
    }

    case 'Enemy plays 3 extra cards next turn':
      if (effect.target === 'self') {
        return `Play ${t('3')} ${t('cards')}`;
      }
      return `Enemy plays ${t('3')} extra ${t('cards')} next turn`;

    case `equal to your bleed`: {
      return `equal to ${t('twice')} ${t('your bleed')}`;
    }

    case `Enemy trashes`:
      return effect.target === 'self' ? `You trash` : `Enemy trashes`;

    case `Deal`: {
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
    }

    case 'damage':
      return effect.name;

    case `3 times`:
      if (effect.multiHit == null || effect.multiHit === 1) return '';
      return `${effect.multiHit} times`;
  }
}

function translateRepeat(repeat: Repeat, text: string) {
  const t = translate(repeat);

  switch (text) {
    case `Repeat for each bleed you have`:
      // not supported yet
      assertType(repeat.value, 'playerValue' as const);
      assert(repeat.value.multiplier == null);
      assert(repeat.value.name != 'cardsPlayedThisTurn');
      assert(repeat.value.name != 'currentCardIndex');
      assert(repeat.value.name != 'extraCardPlays');
      assert(repeat.value.name != 'startingHealth');
      assert(repeat.value.name != 'trashedCards');

      return `Repeat for each ${t('bleed')} ${t('you have')}`;
  }
}

function getCardEffectText(effect: CardEffect): string {
  const t = translate(effect);

  return [
    t(`Deal damage equal to your bleed`),
    effect.multiHit ? t(`3 times`) : '',
    effect.if ? t(`if the enemy has more than 3 bleed`) : '',
  ].join(' ');
}

function getRepeatText(repeat: Repeat): string {
  const t = translate(repeat);

  return [
    t(`Repeat for each bleed you have`),
    repeat.if ? t(`if the enemy has more than 3 bleed`) : '',
  ].join(' ');
}

// Remove extra spaces
function fixSpacing(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

export default function getCardText(card: CardState): string[] {
  return [
    ...card.effects.map(getCardEffectText),
    ...(card.repeat ? [getRepeatText(card.repeat)] : []),
  ].map(fixSpacing);
}
