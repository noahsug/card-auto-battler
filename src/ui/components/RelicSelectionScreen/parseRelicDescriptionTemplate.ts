import { RelicState } from '../../../game/gameState';

export function parseRelicDescriptionTemplate(relic: RelicState): string {
  return relic.description.replaceAll(/\$[^ .]+/g, (templateStr: string) => {
    if (templateStr === '$V') {
      return String(relic.value);
    }
    if (templateStr === '$V2') {
      return String(relic.value2);
    }
    throw new Error('Unknown template string: ' + templateStr);
  });
}
