'use strict';

const { ema } = require('./ema');

/**
 * MACD (Moving Average Convergence Divergence)
 *
 * A trend-following momentum indicator that shows the relationship between
 * two exponential moving averages.
 *
 * @param {number[]} prices - Array of price values (closing prices)
 * @param {number} fastPeriod - Fast EMA period (default: 12)
 * @param {number} slowPeriod - Slow EMA period (default: 26)
 * @param {number} signalPeriod - Signal line EMA period (default: 9)
 * @returns {{ macd: number[], signal: number[], histogram: number[] }}
 *   - macd: MACD line values
 *   - signal: Signal line values
 *   - histogram: MACD histogram values (MACD - Signal)
 * @throws {Error} If prices array is too short or periods are invalid
 */
function macd(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (!Array.isArray(prices) || prices.length === 0) {
    throw new Error('prices must be a non-empty array');
  }
  if (!Number.isInteger(fastPeriod) || fastPeriod <= 0) {
    throw new Error('fastPeriod must be a positive integer');
  }
  if (!Number.isInteger(slowPeriod) || slowPeriod <= 0) {
    throw new Error('slowPeriod must be a positive integer');
  }
  if (!Number.isInteger(signalPeriod) || signalPeriod <= 0) {
    throw new Error('signalPeriod must be a positive integer');
  }
  if (fastPeriod >= slowPeriod) {
    throw new Error('fastPeriod must be less than slowPeriod');
  }
  if (prices.length < slowPeriod + signalPeriod - 1) {
    throw new Error(
      'prices array is too short: requires at least ' + (slowPeriod + signalPeriod - 1) + ' elements'
    );
  }

  const fastEMA = ema(prices, fastPeriod);
  const slowEMA = ema(prices, slowPeriod);

  // Align: slowEMA starts at index (slowPeriod - 1), fastEMA starts at (fastPeriod - 1)
  // The MACD line aligns from when slowEMA has its first value
  const offset = slowPeriod - fastPeriod;
  const macdLine = slowEMA.map((val, i) => fastEMA[i + offset] - val);

  const signalLine = ema(macdLine, signalPeriod);

  // Histogram aligns with signal line
  const signalOffset = signalPeriod - 1;
  const histogram = signalLine.map((val, i) => macdLine[i + signalOffset] - val);

  return {
    macd: macdLine,
    signal: signalLine,
    histogram,
  };
}

module.exports = { macd };
