import { moveItem } from './iterators';

describe('moveItem', () => {
  it('moves an item from one index to another in an array', () => {
    const result = moveItem([1, 2, 3, 4, 5], 2, 3);
    expect(result).toEqual([1, 2, 4, 3, 5]);
  });

  it('handles moving an item to the beginning of the array', () => {
    const result = moveItem([1, 2, 3, 4, 5], 3, 0);
    expect(result).toEqual([4, 1, 2, 3, 5]);
  });

  it('should handle moving an item to the end of the array', () => {
    const result = moveItem([1, 2, 3, 4, 5], 2, 4);
    expect(result).toEqual([1, 2, 4, 5, 3]);
  });

  it('should not modify the array if the fromIndex and toIndex are the same', () => {
    const result = moveItem([1, 2, 3, 4, 5], 2, 2);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle moving an item in an empty array', () => {
    const result = moveItem([], 0, 0);
    expect(result).toEqual([]);
  });
});
