'use strict';

const { sma } = require('./src/sma');
const { ema } = require('./src/ema');
const { rsi } = require('./src/rsi');
const { macd } = require('./src/macd');
const { bollingerBands } = require('./src/bollingerBands');
const { stochastic } = require('./src/stochastic');

module.exports = {
  sma,
  ema,
  rsi,
  macd,
  bollingerBands,
  stochastic,
};
