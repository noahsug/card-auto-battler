import { Entries } from './types';

export function getNonNullEntries<T extends object>(obj: T): Entries<Required<T>> {
  return (Object.entries(obj) as Entries<Required<T>>).filter(([_, value]) => value != null);
}
