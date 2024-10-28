import { CardState, If, MaybeValue, ValueDescriptor } from '../../../game/gameState';
import { assertIsNonNullable } from '../../../utils/asserts';

type TemplateMap = Record<string, number>;

function parseValue(value: ValueDescriptor | undefined, prefix: string): TemplateMap {
  if (!value) return {};
  if (value.type === 'basicValue') {
    return { [prefix]: value.value };
  }
  if (value.multiplier != null) {
    return { [prefix]: value.multiplier };
  }
  return {};
}

function parseIf(ifStatement: If | undefined, prefix: string): TemplateMap {
  if (!ifStatement) return {};

  // value2 is always a basic value and is the primary one we'd want to reference, while value is
  // only referenced if it has a multiplier (hence why we make value have the "2" prefix, not value2)
  return {
    ...parseValue(ifStatement.value2, prefix + 'I'),
    ...parseValue(ifStatement.value, prefix + 'I2'),
  };
}

function parseMaybeValue(maybeValue: MaybeValue | undefined, prefix: string): TemplateMap {
  if (!maybeValue) return {};
  return {
    ...parseValue(maybeValue.value, prefix),
    ...parseIf(maybeValue.if, prefix),
  };
}

/**
 * Allows card values to be quickly references using the following codes:
 * ```
 * CardState {
 *   effects: [{
 *     value: { value: $V },
 *     add: { value: { value: $A } },
 *     multiply: {
 *       value: { value: $M } },
 *       if: { ..., value2: { value: $MI } },
 *     },
 *     multiHit: { value: $H },
 *   }, {
 *     value: { value: $2V },
 *   }],
 *   repeat: {
 *     value: { value: $R } },
 *     if: {
 *       value: { type: 'playerValue', multiplier: $RI2 },
 *       value2: { type: 'basicValue', value: $RI },
 *     },
 *   },
 * }
 * ```
 */
export function parseDescriptionTemplate(card: CardState) {
  const effectsTemplateMap = card.effects.reduce((acc, effect, i) => {
    const prefix = i === 0 ? '$' : '$' + String(i + 1);
    return {
      ...acc,
      ...parseValue(effect.value, prefix + 'V'),
      ...parseMaybeValue(effect.add, prefix + 'A'),
      ...parseMaybeValue(effect.multiply, prefix + 'M'),
      ...parseValue(effect.multiHit, prefix + 'H'),
      ...parseIf(effect.if, prefix + 'I'),
    };
  }, {} as TemplateMap);

  // maps template string values to their matching card value
  const templateMap = {
    ...effectsTemplateMap,
    ...parseMaybeValue(card.repeat, 'R'),
  };

  function replaceTemplate(templateStr: string) {
    let suffix = '';
    let multiplier = 1;
    let offset = 0;

    if (templateStr.endsWith('%')) {
      templateStr = templateStr.slice(0, -1);
      suffix = '%';
      multiplier = 100;
    }

    const addMatch = templateStr.match(/[+](\d+)$/);
    if (addMatch) {
      const [entireMatch, addValue] = addMatch;
      templateStr = templateStr.slice(0, -entireMatch.length);
      offset = Number(addValue);
    }

    const value = templateMap[templateStr];
    assertIsNonNullable(value);
    return value * multiplier + offset + suffix;
  }

  return card.description.replaceAll(/\$\S+/g, replaceTemplate);
}
