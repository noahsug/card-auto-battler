export function assertIsNonNullable<T>(value: T): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(`${value} is not defined`);
  }
}

export function assert(condition: boolean): asserts condition is true {
  if (!condition) {
    throw new Error('assertion failed');
  }
}
