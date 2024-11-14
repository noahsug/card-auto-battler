import { RelicState } from '../../../game/gameState';
import { parseDescriptionTemplate } from '../../utils/parseDescriptionTemplate';

export function parseRelicDescriptionTemplate(relic: RelicState): string {
  function getValue(templateStr: string): number | undefined {
    if (templateStr === '$V') {
      return relic.value;
    }
    if (templateStr === '$V2') {
      return relic.value2;
    }
  }

  return parseDescriptionTemplate(relic.description, getValue);
}
