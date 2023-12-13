export type Writable<T> = { -readonly [P in keyof T]: T[P] };

export type Tail<T extends unknown[]> = T extends [unknown, ...infer R] ? R : never;
