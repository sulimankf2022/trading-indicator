'use strict';

const { sma } = require('./sma');

/**
 * Bollinger Bands
 *
 * A volatility indicator that consists of a middle band (SMA) and two outer bands
 * set at a standard deviation above and below the middle band.
 *
 * @param {number[]} prices - Array of price values
 * @param {number} period - Number of periods (default: 20)
 * @param {number} stdDevMultiplier - Standard deviation multiplier (default: 2)
 * @returns {{ upper: number[], middle: number[], lower: number[] }}
 *   - upper: Upper Bollinger Band
 *   - middle: Middle Band (SMA)
 *   - lower: Lower Bollinger Band
 * @throws {Error} If prices array is too short or period is invalid
 */
function bollingerBands(prices, period = 20, stdDevMultiplier = 2) {
  if (!Array.isArray(prices) || prices.length === 0) {
    throw new Error('prices must be a non-empty array');
  }
  if (!Number.isInteger(period) || period <= 0) {
    throw new Error('period must be a positive integer');
  }
  if (typeof stdDevMultiplier !== 'number' || stdDevMultiplier <= 0) {
    throw new Error('stdDevMultiplier must be a positive number');
  }
  if (prices.length < period) {
    throw new Error('prices array must have at least "period" elements');
  }

  const middle = sma(prices, period);
  const upper = [];
  const lower = [];

  for (let i = 0; i < middle.length; i++) {
    const slice = prices.slice(i, i + period);
    const mean = middle[i];
    const variance = slice.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    upper.push(mean + stdDevMultiplier * stdDev);
    lower.push(mean - stdDevMultiplier * stdDev);
  }

  return { upper, middle, lower };
}

module.exports = { bollingerBands };
