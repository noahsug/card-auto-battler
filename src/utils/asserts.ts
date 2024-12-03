export function assertIsNonNullable<T>(
  value: T,
  message?: string,
): asserts value is NonNullable<T> {
  if (value == null) {
    throw new Error(message || `expected non-nullable, but got ${value}`);
  }
}

export function assertIsNullable(
  value: unknown,
  message?: string,
): asserts value is null | undefined {
  if (value != null) {
    throw new Error(message || `expected null or undefined, but got ${value}`);
  }
}

export function assert(condition: boolean, message?: string): asserts condition is true {
  if (!condition) {
    throw new Error(message || `expected true but got ${condition}`);
  }
}

export function assertEqual<T>(a: T, b: T, message?: string): asserts a is T {
  if (a !== b) {
    throw new Error(`expected ${a} to equal ${b}` + getMessageSuffix(message));
  }
}

export function assertNotEqual<T>(a: T, b: T, message?: string) {
  if (a === b) {
    throw new Error(`expected ${a} NOT to equal ${b}` + getMessageSuffix(message));
  }
}

// Usage:
//   const animal = { type: 'dog', bark };
//   assertType(animal, 'dog');
//   animal.bark(); // animal is now known to be of type dog
export function assertType<T, const R extends T>(
  object: { type: T } | undefined,
  type: R,
  message?: string,
): asserts object is { type: R } {
  if (object?.type !== type) {
    throw new Error(`expected type ${type}, got ${object?.type}` + getMessageSuffix(message));
  }
}

function getMessageSuffix(message?: string) {
  if (message) return `, ${message}`;
  return '';
}
