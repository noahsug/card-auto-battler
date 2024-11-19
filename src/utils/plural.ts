export function plural(n: number, singular: string, plural?: string) {
  if (!plural) {
    if (singular.endsWith('s') || singular.endsWith('x')) {
      plural = `${singular}es`;
    } else {
      plural = `${singular}s`;
    }
  }

  return n === 1 ? singular : plural;
}
