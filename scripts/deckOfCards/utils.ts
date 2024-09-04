export function swapKeysAndValues<T extends Record<string, S>, S extends string>(obj: T) {
  const res = {} as any; // I'm not worried about impl safety
  Object.entries(obj).forEach(([key, value]) => {
    res[value] = key;
  });
  return res as { [K in keyof T as T[K]]: K };
}
