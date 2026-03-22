'use strict';

/**
 * Stochastic Oscillator
 *
 * A momentum indicator comparing a particular closing price to a range of prices
 * over a certain period of time. Values range from 0 to 100.
 *
 * @param {number[]} highs - Array of high prices
 * @param {number[]} lows - Array of low prices
 * @param {number[]} closes - Array of closing prices
 * @param {number} kPeriod - %K period (default: 14)
 * @param {number} dPeriod - %D period (default: 3)
 * @returns {{ k: number[], d: number[] }}
 *   - k: Fast stochastic (%K)
 *   - d: Slow stochastic (%D), the SMA of %K
 * @throws {Error} If arrays are too short or periods are invalid
 */
function stochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
  if (
    !Array.isArray(highs) || !Array.isArray(lows) || !Array.isArray(closes) ||
    highs.length === 0 || lows.length === 0 || closes.length === 0
  ) {
    throw new Error('highs, lows, and closes must be non-empty arrays');
  }
  if (highs.length !== lows.length || lows.length !== closes.length) {
    throw new Error('highs, lows, and closes must have the same length');
  }
  if (!Number.isInteger(kPeriod) || kPeriod <= 0) {
    throw new Error('kPeriod must be a positive integer');
  }
  if (!Number.isInteger(dPeriod) || dPeriod <= 0) {
    throw new Error('dPeriod must be a positive integer');
  }
  if (closes.length < kPeriod) {
    throw new Error('prices arrays must have at least kPeriod elements');
  }

  const k = [];
  for (let i = kPeriod - 1; i < closes.length; i++) {
    const periodHighs = highs.slice(i - kPeriod + 1, i + 1);
    const periodLows = lows.slice(i - kPeriod + 1, i + 1);
    const highestHigh = Math.max(...periodHighs);
    const lowestLow = Math.min(...periodLows);
    const range = highestHigh - lowestLow;
    if (range === 0) {
      k.push(50); // Avoid division by zero; price unchanged
    } else {
      k.push(((closes[i] - lowestLow) / range) * 100);
    }
  }

  // %D is a simple moving average of %K
  if (k.length < dPeriod) {
    return { k, d: [] };
  }

  const d = [];
  for (let i = dPeriod - 1; i < k.length; i++) {
    const sum = k.slice(i - dPeriod + 1, i + 1).reduce((s, v) => s + v, 0);
    d.push(sum / dPeriod);
  }

  return { k, d };
}

module.exports = { stochastic };
