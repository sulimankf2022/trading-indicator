'use strict';

const { sma } = require('../src/sma');

describe('SMA (Simple Moving Average)', () => {
  test('calculates SMA correctly for period 3', () => {
    const prices = [2, 4, 6, 8, 10];
    const result = sma(prices, 3);
    expect(result).toHaveLength(3);
    expect(result[0]).toBeCloseTo(4); // (2+4+6)/3
    expect(result[1]).toBeCloseTo(6); // (4+6+8)/3
    expect(result[2]).toBeCloseTo(8); // (6+8+10)/3
  });

  test('returns single value when period equals array length', () => {
    const prices = [1, 2, 3, 4, 5];
    const result = sma(prices, 5);
    expect(result).toHaveLength(1);
    expect(result[0]).toBeCloseTo(3); // (1+2+3+4+5)/5
  });

  test('throws error for empty prices', () => {
    expect(() => sma([], 3)).toThrow('prices must be a non-empty array');
  });

  test('throws error for invalid period', () => {
    expect(() => sma([1, 2, 3], 0)).toThrow('period must be a positive integer');
    expect(() => sma([1, 2, 3], -1)).toThrow('period must be a positive integer');
    expect(() => sma([1, 2, 3], 1.5)).toThrow('period must be a positive integer');
  });

  test('throws error when prices array is shorter than period', () => {
    expect(() => sma([1, 2], 3)).toThrow('prices array must have at least "period" elements');
  });

  test('calculates SMA for period 1 (identity)', () => {
    const prices = [5, 10, 15];
    const result = sma(prices, 1);
    expect(result).toEqual([5, 10, 15]);
  });
});
