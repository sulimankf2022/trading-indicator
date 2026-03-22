'use strict';

const { bollingerBands } = require('../src/bollingerBands');

describe('Bollinger Bands', () => {
  const prices = [10, 11, 12, 11, 10, 11, 12, 13, 12, 11, 10, 11, 12, 11, 10, 11, 12, 13, 12, 11, 10];

  test('returns upper, middle, and lower bands', () => {
    const result = bollingerBands(prices, 20);
    expect(result).toHaveProperty('upper');
    expect(result).toHaveProperty('middle');
    expect(result).toHaveProperty('lower');
  });

  test('upper, middle, lower have the same length', () => {
    const result = bollingerBands(prices, 5);
    const { upper, middle, lower } = result;
    expect(upper).toHaveLength(middle.length);
    expect(lower).toHaveLength(middle.length);
  });

  test('upper band is always above or equal to middle', () => {
    const result = bollingerBands(prices, 5);
    result.upper.forEach((val, i) => {
      expect(val).toBeGreaterThanOrEqual(result.middle[i]);
    });
  });

  test('lower band is always below or equal to middle', () => {
    const result = bollingerBands(prices, 5);
    result.lower.forEach((val, i) => {
      expect(val).toBeLessThanOrEqual(result.middle[i]);
    });
  });

  test('for constant prices, upper equals lower equals middle', () => {
    const constantPrices = Array(10).fill(100);
    const result = bollingerBands(constantPrices, 5);
    result.upper.forEach((val) => expect(val).toBeCloseTo(100));
    result.lower.forEach((val) => expect(val).toBeCloseTo(100));
    result.middle.forEach((val) => expect(val).toBeCloseTo(100));
  });

  test('result length is prices.length - period + 1', () => {
    const result = bollingerBands(prices, 5);
    expect(result.middle).toHaveLength(prices.length - 5 + 1);
  });

  test('throws error for empty prices', () => {
    expect(() => bollingerBands([], 5)).toThrow('prices must be a non-empty array');
  });

  test('throws error for invalid period', () => {
    expect(() => bollingerBands(prices, 0)).toThrow('period must be a positive integer');
  });

  test('throws error for invalid stdDevMultiplier', () => {
    expect(() => bollingerBands(prices, 5, 0)).toThrow('stdDevMultiplier must be a positive number');
    expect(() => bollingerBands(prices, 5, -1)).toThrow('stdDevMultiplier must be a positive number');
  });

  test('throws error when prices array is shorter than period', () => {
    expect(() => bollingerBands([1, 2], 5)).toThrow(
      'prices array must have at least "period" elements'
    );
  });
});
