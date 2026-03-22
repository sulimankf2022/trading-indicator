'use strict';

const { macd } = require('../src/macd');

describe('MACD (Moving Average Convergence Divergence)', () => {
  const prices = Array.from({ length: 50 }, (_, i) => 10 + Math.sin(i * 0.5) * 5 + i * 0.2);

  test('returns macd, signal, and histogram arrays', () => {
    const result = macd(prices, 12, 26, 9);
    expect(result).toHaveProperty('macd');
    expect(result).toHaveProperty('signal');
    expect(result).toHaveProperty('histogram');
  });

  test('signal length equals macd length minus signalPeriod + 1', () => {
    const result = macd(prices, 12, 26, 9);
    expect(result.signal).toHaveLength(result.macd.length - 9 + 1);
  });

  test('histogram length equals signal length', () => {
    const result = macd(prices, 12, 26, 9);
    expect(result.histogram).toHaveLength(result.signal.length);
  });

  test('histogram = macd - signal at each point', () => {
    const result = macd(prices, 12, 26, 9);
    const { macd: macdLine, signal, histogram } = result;
    const offset = macdLine.length - signal.length;
    histogram.forEach((h, i) => {
      expect(h).toBeCloseTo(macdLine[i + offset] - signal[i]);
    });
  });

  test('throws error for empty prices', () => {
    expect(() => macd([], 12, 26, 9)).toThrow('prices must be a non-empty array');
  });

  test('throws error when fastPeriod >= slowPeriod', () => {
    expect(() => macd(prices, 26, 12, 9)).toThrow('fastPeriod must be less than slowPeriod');
    expect(() => macd(prices, 26, 26, 9)).toThrow('fastPeriod must be less than slowPeriod');
  });

  test('throws error when prices array is too short', () => {
    expect(() => macd([1, 2, 3], 12, 26, 9)).toThrow('prices array is too short');
  });
});
