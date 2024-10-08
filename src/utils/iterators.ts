import { Entries } from './types';

export function getNonNullEntries<T extends object>(obj: T): Entries<Required<T>> {
  return (Object.entries(obj) as Entries<Required<T>>).filter(([, value]) => value != null);
}

export function moveItem<T>(arr: T[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) return arr;

  const [item] = arr.splice(fromIndex, 1);
  return [...arr.slice(0, toIndex), item, ...arr.slice(toIndex)];
}

export function swap<T>(arr: T[], index1: number, index2: number) {
  const tmp = arr[index2];
  arr[index2] = arr[index1];
  arr[index1] = tmp;
}

// see https://github.com/microsoft/TypeScript/issues/31018
export function readonlyIncludes<T, A extends T>(array: ReadonlyArray<A>, item: T): item is A {
  return array.includes(item as A);
}
