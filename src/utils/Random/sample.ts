import { shuffle } from './shuffle';

export function sample<T>(array: T[], size: number, random: () => number = Math.random): T[] {
  const shuffledCollection = shuffle(array.slice(), random);
  return shuffledCollection.slice(0, size);
}
