export function joinText(...textParts: Array<string | number | undefined>) {
  return textParts.filter(Boolean).join(' ');
}
