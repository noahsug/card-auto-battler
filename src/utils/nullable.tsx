export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value != null;
}

export function isArrayNonNullable<T>(array: Array<T>): array is Array<NonNullable<T>> {
  return array.every(isNonNullable);
}

export function areEntriesNonNullable<T>(
  entries: Array<Array<T>>,
): entries is Array<Array<NonNullable<T>>> {
  return entries.every(isArrayNonNullable);
}
