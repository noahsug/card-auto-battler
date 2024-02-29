export function joinText(...textParts: Array<string | number | undefined>) {
  return textParts.filter(Boolean).join(' ');
}

export function percent(value: number, decimalPlaces = 0) {
  return `${(value * 100).toFixed(decimalPlaces)}%`;
}
