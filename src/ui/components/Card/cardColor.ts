import { CardColor } from '../../../game/gameState';

const hsl: Record<CardColor, [number, number, number]> = {
  basic: [67, 0, 80],
  purple: [267, 30, 80],
  red: [0, 30, 80],
  green: [118, 30, 80],
};

function getHSLString(hue: number, saturation: number, lightness: number) {
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

interface CardColorOptions {
  hueShift?: number;
  saturate?: number;
  brighten?: number;
}

export function getCardColor(color: CardColor, options: CardColorOptions = {}) {
  const hueShift = options.hueShift || 0;
  const saturate = options.saturate || 0;
  const brighten = options.brighten || 0;

  const [hue, saturation, lightness] = hsl[color];
  return getHSLString(hue + hueShift, saturation + saturate, lightness + brighten);
}
