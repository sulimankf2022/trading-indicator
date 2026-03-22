'use strict';

const { stochastic } = require('../src/stochastic');

describe('Stochastic Oscillator', () => {
  const highs  = [48, 49, 50, 49, 48, 51, 52, 51, 50, 49, 50, 51, 52, 51, 50];
  const lows   = [44, 45, 46, 45, 44, 47, 48, 47, 46, 45, 46, 47, 48, 47, 46];
  const closes = [46, 47, 48, 47, 46, 49, 50, 49, 48, 47, 48, 49, 50, 49, 48];

  test('returns k and d arrays', () => {
    const result = stochastic(highs, lows, closes, 5, 3);
    expect(result).toHaveProperty('k');
    expect(result).toHaveProperty('d');
  });

  test('%K values are between 0 and 100', () => {
    const result = stochastic(highs, lows, closes, 5, 3);
    result.k.forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    });
  });

  test('%D values are between 0 and 100', () => {
    const result = stochastic(highs, lows, closes, 5, 3);
    result.d.forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    });
  });

  test('%K length is correct', () => {
    const result = stochastic(highs, lows, closes, 5, 3);
    expect(result.k).toHaveLength(closes.length - 5 + 1);
  });

  test('%D length is correct', () => {
    const result = stochastic(highs, lows, closes, 5, 3);
    expect(result.d).toHaveLength(result.k.length - 3 + 1);
  });

  test('returns 50 for %K when range is zero (all same price)', () => {
    const flatHighs = Array(10).fill(100);
    const flatLows = Array(10).fill(100);
    const flatCloses = Array(10).fill(100);
    const result = stochastic(flatHighs, flatLows, flatCloses, 5, 3);
    result.k.forEach((val) => expect(val).toBe(50));
  });

  test('throws error for empty arrays', () => {
    expect(() => stochastic([], [], [], 5, 3)).toThrow(
      'highs, lows, and closes must be non-empty arrays'
    );
  });

  test('throws error for mismatched array lengths', () => {
    expect(() => stochastic([1, 2, 3], [1, 2], [1, 2, 3], 2, 2)).toThrow(
      'highs, lows, and closes must have the same length'
    );
  });

  test('throws error for invalid kPeriod', () => {
    expect(() => stochastic(highs, lows, closes, 0, 3)).toThrow(
      'kPeriod must be a positive integer'
    );
  });

  test('throws error for invalid dPeriod', () => {
    expect(() => stochastic(highs, lows, closes, 5, 0)).toThrow(
      'dPeriod must be a positive integer'
    );
  });

  test('throws error when arrays are shorter than kPeriod', () => {
    expect(() => stochastic([1, 2], [1, 2], [1, 2], 5, 3)).toThrow(
      'prices arrays must have at least kPeriod elements'
    );
  });
});
