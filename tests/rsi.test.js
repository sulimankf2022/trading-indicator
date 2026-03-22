'use strict';

const { rsi } = require('../src/rsi');

describe('RSI (Relative Strength Index)', () => {
  test('returns RSI of 100 when all moves are gains', () => {
    const prices = Array.from({ length: 20 }, (_, i) => i + 1); // 1..20
    const result = rsi(prices, 14);
    expect(result[0]).toBeCloseTo(100);
  });

  test('returns RSI of 0 when all moves are losses', () => {
    const prices = Array.from({ length: 20 }, (_, i) => 20 - i); // 20..1
    const result = rsi(prices, 14);
    expect(result[0]).toBeCloseTo(0);
  });

  test('returns RSI between 0 and 100 for mixed prices', () => {
    const prices = [
      44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.15,
      43.61, 44.33, 44.83, 45.1, 45.15, 45.15, 45.15, 45.15,
    ];
    const result = rsi(prices, 14);
    // prices.length(16) - period(14) = 2 values
    expect(result).toHaveLength(2);
    result.forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    });
  });

  test('result length is correct', () => {
    const prices = Array.from({ length: 20 }, (_, i) => i + 1);
    const result = rsi(prices, 14);
    // prices.length - period = 20 - 14 = 6
    expect(result).toHaveLength(6);
  });

  test('throws error for empty prices', () => {
    expect(() => rsi([], 14)).toThrow('prices must be a non-empty array');
  });

  test('throws error for invalid period', () => {
    expect(() => rsi([1, 2, 3], 0)).toThrow('period must be a positive integer');
  });

  test('throws error when prices length is not greater than period', () => {
    expect(() => rsi([1, 2, 3, 4, 5], 5)).toThrow(
      'prices array must have more than "period" elements'
    );
  });
});
