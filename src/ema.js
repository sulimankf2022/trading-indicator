'use strict';

/**
 * Exponential Moving Average (EMA)
 *
 * Gives more weight to recent prices, making it more responsive to new information.
 *
 * @param {number[]} prices - Array of price values
 * @param {number} period - Number of periods for EMA calculation
 * @returns {number[]} Array of EMA values (length = prices.length - period + 1)
 * @throws {Error} If prices array is too short or period is invalid
 */
function ema(prices, period) {
  if (!Array.isArray(prices) || prices.length === 0) {
    throw new Error('prices must be a non-empty array');
  }
  if (!Number.isInteger(period) || period <= 0) {
    throw new Error('period must be a positive integer');
  }
  if (prices.length < period) {
    throw new Error('prices array must have at least "period" elements');
  }

  const k = 2 / (period + 1);
  // Seed EMA with the first SMA
  let emaValue = prices.slice(0, period).reduce((sum, p) => sum + p, 0) / period;
  const result = [emaValue];

  for (let i = period; i < prices.length; i++) {
    emaValue = prices[i] * k + emaValue * (1 - k);
    result.push(emaValue);
  }
  return result;
}

module.exports = { ema };
