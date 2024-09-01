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

// Usage:
//   const animal = { type: 'dog', bark };
//   assertType(animal, 'dog');
//   animal.bark(); // animal is now known to be of type dog
export function assertType<T, const R extends T>(
  object: { type: T } | undefined,
  type: R,
): asserts object is { type: R } {
  if (object?.type !== type) {
    throw new Error(`expected type ${type}, got ${object?.type}`);
  }
}
