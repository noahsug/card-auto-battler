export type Writable<T> = { -readonly [P in keyof T]: T[P] };

export type Tail<T extends unknown[]> = T extends [unknown, ...infer R] ? R : never;

export type Keys<T> = Array<keyof T>;

export type Value<T> = T[keyof T];

export type Values<T> = Array<Value<T>>;

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type KeysWithValueType<T, ValueType> = {
  [P in keyof T]: T[P] extends ValueType ? P : never;
}[keyof T];

export type PickType<T, ValueType> = Pick<T, KeysWithValueType<T, ValueType>>;

export type ExtendUnion<T, U> = T extends unknown ? U & T : never;
