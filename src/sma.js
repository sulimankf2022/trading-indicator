'use strict';

/**
 * Simple Moving Average (SMA)
 *
 * Calculates the arithmetic mean of a given set of prices over a specified period.
 *
 * @param {number[]} prices - Array of price values
 * @param {number} period - Number of periods to calculate the average over
 * @returns {number[]} Array of SMA values (length = prices.length - period + 1)
 * @throws {Error} If prices array is too short or period is invalid
 */
function sma(prices, period) {
  if (!Array.isArray(prices) || prices.length === 0) {
    throw new Error('prices must be a non-empty array');
  }
  if (!Number.isInteger(period) || period <= 0) {
    throw new Error('period must be a positive integer');
  }
  if (prices.length < period) {
    throw new Error('prices array must have at least "period" elements');
  }

  const result = [];
  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += prices[j];
    }
    result.push(sum / period);
  }
  return result;
}

module.exports = { sma };
