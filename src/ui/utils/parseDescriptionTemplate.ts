import { assertIsNonNullable } from '../../utils/asserts';

// TODO: remove this and instead have card/relic descriptions use `${v1}` where v1 is the function
// (card, game) => string, this will allow for more dynamic descriptions (e.g. # of punch cards for
// punk relic)
export function parseDescriptionTemplate(
  description: string,
  getValueFn: (templateStr: string) => number | undefined,
) {
  return description.replaceAll(/\$[^ .]+/g, (templateStr: string) => {
    let suffix = '';
    let multiplier = 1;
    let offset = 0;

    // match "%" suffix
    if (templateStr.endsWith('%')) {
      templateStr = templateStr.slice(0, -1);
      suffix = '%';
      multiplier = 100;
    }

    // match "+2"
    const addMatch = templateStr.match(/[+](\d+)$/);
    if (addMatch) {
      const [entireMatch, addValue] = addMatch;
      templateStr = templateStr.slice(0, -entireMatch.length);
      offset = Number(addValue);
    }

    const value = getValueFn(templateStr);
    assertIsNonNullable(value, 'invalid template string: ' + templateStr);

    return (value + offset) * multiplier + suffix;
  });
}
