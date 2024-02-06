export type Writable<T> = { -readonly [P in keyof T]: T[P] };

export type Tail<T extends unknown[]> = T extends [unknown, ...infer R] ? R : never;

export type Keys<T> = Array<keyof T>;

export type Value<T> = T[keyof T];

export type Values<T> = Array<Value<T>>;

export type Entries<T> = NonNullable<
  {
    [K in keyof T]: [K, T[K]];
  }[keyof T]
>[];

export type KeysWithValueType<T, ValueType> = {
  [P in keyof T]: T[P] extends ValueType ? P : never;
}[keyof T];

/**
 * Usage:
 *   PickByValue<{ a: 1, b: 'hi'}, number> => { a: 1 }
 */
export type PickByValue<T, ValueType> = Pick<T, KeysWithValueType<T, ValueType>>;

/**
 * Required but for only one key
 *
 * Usage:
 *   Require<{ a?: 1, b?: 2}, 'b'> => { a?: 1, b: 2 }
 */
export type Require<T, Key extends keyof T> = Omit<T, Key> & { [P in Key]-?: T[P] };

/**
 * Partial but for only one key
 *
 * Usage:
 *   MakeOptional<{ a: 1, b: 2}, 'b'> => { a: 1, b?: 2 }
 */
export type MakeOptional<T, Key extends keyof T> = Omit<T, Key> & { [P in Key]?: T[P] };

export type ExtendUnion<T, U> = T extends unknown ? U & T : never;
