'use strict';

const indicators = require('../index');

describe('trading-indicator index exports', () => {
  test('exports sma function', () => {
    expect(typeof indicators.sma).toBe('function');
  });

  test('exports ema function', () => {
    expect(typeof indicators.ema).toBe('function');
  });

  test('exports rsi function', () => {
    expect(typeof indicators.rsi).toBe('function');
  });

  test('exports macd function', () => {
    expect(typeof indicators.macd).toBe('function');
  });

  test('exports bollingerBands function', () => {
    expect(typeof indicators.bollingerBands).toBe('function');
  });

  test('exports stochastic function', () => {
    expect(typeof indicators.stochastic).toBe('function');
  });

  test('sma computes correctly via index', () => {
    const result = indicators.sma([1, 2, 3, 4, 5], 3);
    expect(result[0]).toBeCloseTo(2);
  });
});
