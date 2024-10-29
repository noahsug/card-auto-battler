import { Tribe } from '../../../game/gameState';

const hsl: Record<Tribe, [number, number, number]> = {
  basic: [67, 0, 90],
  purple: [267, 10, 80],
  red: [0, 10, 80],
  green: [118, 10, 80],
};

function getHSLString(hue: number, saturation: number, lightness: number) {
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

interface CardColorOptions {
  hueShift?: number;
  saturate?: number;
  brighten?: number;
}

export function getCardColor(tribe: Tribe, options: CardColorOptions = {}) {
  const hueShift = options.hueShift || 0;
  const saturate = options.saturate || 0;
  const brighten = options.brighten || 0;

  const [hue, saturation, lightness] = hsl[tribe];
  return getHSLString(hue + hueShift, saturation + saturate, lightness + brighten);
}
