// Returns the differences in values between the next object and the previous object.
// Numbers are subtracted, while other values are simply returned.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function diffValues<T extends Record<PropertyKey, any>>(prev: T, next: T) {
  const diff: Record<PropertyKey, number | string | boolean | object> = {};

  Object.keys(next).forEach((key) => {
    const prevValue = prev[key];
    const nextValue = next[key];

    if (nextValue == null || prevValue === nextValue) return;

    if (typeof prevValue !== typeof nextValue) {
      diff[key] = nextValue;
    } else if (typeof nextValue === 'object') {
      const nestedDiff = diffValues(prevValue, nextValue);
      if (Object.keys(nestedDiff).length > 0) {
        diff[key] = nestedDiff;
      }
    } else if (typeof nextValue === 'number') {
      diff[key] = nextValue - prevValue;
    } else {
      diff[key] = nextValue;
    }
  });

  return diff;
}
