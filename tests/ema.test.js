'use strict';

const { ema } = require('../src/ema');

describe('EMA (Exponential Moving Average)', () => {
  test('calculates EMA correctly for period 3', () => {
    // k = 2/(3+1) = 0.5
    // Seed: (1+2+3)/3 = 2
    // EMA[1] = 4*0.5 + 2*0.5 = 3
    // EMA[2] = 5*0.5 + 3*0.5 = 4
    const prices = [1, 2, 3, 4, 5];
    const result = ema(prices, 3);
    expect(result).toHaveLength(3);
    expect(result[0]).toBeCloseTo(2);
    expect(result[1]).toBeCloseTo(3);
    expect(result[2]).toBeCloseTo(4);
  });

  test('EMA with period equal to array length returns single value', () => {
    const prices = [2, 4, 6];
    const result = ema(prices, 3);
    expect(result).toHaveLength(1);
    expect(result[0]).toBeCloseTo(4); // SMA seed: (2+4+6)/3 = 4
  });

  test('EMA gives more weight to recent values than SMA', () => {
    const prices = [10, 10, 10, 10, 20];
    const emaResult = ema(prices, 4);
    const lastEMA = emaResult[emaResult.length - 1];
    // The last value (20) should pull EMA above SMA(10) = 11
    expect(lastEMA).toBeGreaterThan(11);
  });

  test('throws error for empty prices', () => {
    expect(() => ema([], 3)).toThrow('prices must be a non-empty array');
  });

  test('throws error for invalid period', () => {
    expect(() => ema([1, 2, 3], 0)).toThrow('period must be a positive integer');
    expect(() => ema([1, 2, 3], -2)).toThrow('period must be a positive integer');
  });

  test('throws error when prices array is shorter than period', () => {
    expect(() => ema([1, 2], 5)).toThrow('prices array must have at least "period" elements');
  });
});
