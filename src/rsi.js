'use strict';

/**
 * Relative Strength Index (RSI)
 *
 * A momentum oscillator that measures the speed and change of price movements.
 * RSI oscillates between 0 and 100. Traditionally, RSI >= 70 is considered
 * overbought and RSI <= 30 is considered oversold.
 *
 * @param {number[]} prices - Array of price values (closing prices)
 * @param {number} period - Number of periods (default: 14)
 * @returns {number[]} Array of RSI values
 * @throws {Error} If prices array is too short or period is invalid
 */
function rsi(prices, period = 14) {
  if (!Array.isArray(prices) || prices.length === 0) {
    throw new Error('prices must be a non-empty array');
  }
  if (!Number.isInteger(period) || period <= 0) {
    throw new Error('period must be a positive integer');
  }
  if (prices.length <= period) {
    throw new Error('prices array must have more than "period" elements');
  }

  const gains = [];
  const losses = [];

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // Initial average gain/loss using simple average
  let avgGain = gains.slice(0, period).reduce((sum, g) => sum + g, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((sum, l) => sum + l, 0) / period;

  const result = [];
  result.push(_calculateRSI(avgGain, avgLoss));

  // Use Wilder's smoothing for subsequent values
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    result.push(_calculateRSI(avgGain, avgLoss));
  }

  return result;
}

function _calculateRSI(avgGain, avgLoss) {
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

module.exports = { rsi };
