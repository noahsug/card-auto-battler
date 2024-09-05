import { diffValues } from './objects';

it('diffs two shallow objects', () => {
  const prev = { a: true, b: true };
  const next = { a: true, b: false };

  expect(diffValues(prev, next)).toEqual({ b: false });
});

it('diffs two deep objects', () => {
  const prev = { a: 1, b: { age: 2, name: 'joe' } };
  const next = { a: 1, b: { age: 2, name: 'noah' } };

  expect(diffValues(prev, next)).toEqual({ b: { name: 'noah' } });
});

it('subtracts numbers', () => {
  const prev = { a: 5 };
  const next = { a: 6 };

  expect(diffValues(prev, next)).toEqual({ a: 1 });
});

it('returns new properties', () => {
  const prev = { a: 5 };
  const next = { a: 5, b: 7 };

  expect(diffValues(prev, next)).toEqual({ b: 7 });
});

it('handles arrays', () => {
  const prev = { a: [1, 2] };
  const next = { a: [0, 2, 3] };

  expect(diffValues(prev, next)).toEqual({ a: { 0: -1, 2: 3 } });
});
