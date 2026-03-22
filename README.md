# trading-indicator

A lightweight Node.js library for computing common technical trading indicators.

## Installation

```bash
npm install
```

## Usage

```js
const { sma, ema, rsi, macd, bollingerBands, stochastic } = require('./index');

const prices = [44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.15, 43.61, 44.33,
                44.83, 45.1, 45.15, 45.15, 45.15, 45.15, 45.10, 44.50, 44.00, 43.61];

// Simple Moving Average
const smaValues = sma(prices, 5);

// Exponential Moving Average
const emaValues = ema(prices, 5);

// Relative Strength Index
const rsiValues = rsi(prices, 14);

// MACD
const { macd: macdLine, signal, histogram } = macd(prices, 12, 26, 9);

// Bollinger Bands
const { upper, middle, lower } = bollingerBands(prices, 20, 2);

// Stochastic Oscillator
const highs  = prices.map(p => p + 0.5);
const lows   = prices.map(p => p - 0.5);
const { k, d } = stochastic(highs, lows, prices, 14, 3);
```

## Indicators

### `sma(prices, period)`
**Simple Moving Average** — Arithmetic mean of prices over a sliding window.

| Parameter | Type | Description |
|-----------|------|-------------|
| `prices`  | `number[]` | Array of price values |
| `period`  | `number` | Window size (positive integer) |

Returns `number[]` of length `prices.length - period + 1`.

---

### `ema(prices, period)`
**Exponential Moving Average** — Weighted average that gives more importance to recent prices.

| Parameter | Type | Description |
|-----------|------|-------------|
| `prices`  | `number[]` | Array of price values |
| `period`  | `number` | Window size (positive integer) |

Returns `number[]` of length `prices.length - period + 1`.

---

### `rsi(prices, period = 14)`
**Relative Strength Index** — Momentum oscillator in the range [0, 100]. Values above 70 are traditionally considered overbought, below 30 oversold.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prices`  | `number[]` | — | Closing prices |
| `period`  | `number` | `14` | Look-back period |

Returns `number[]` of length `prices.length - period`.

---

### `macd(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9)`
**MACD** — Trend-following momentum indicator derived from two EMAs.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prices`  | `number[]` | — | Closing prices |
| `fastPeriod` | `number` | `12` | Fast EMA period |
| `slowPeriod` | `number` | `26` | Slow EMA period |
| `signalPeriod` | `number` | `9` | Signal line EMA period |

Returns `{ macd: number[], signal: number[], histogram: number[] }`.

---

### `bollingerBands(prices, period = 20, stdDevMultiplier = 2)`
**Bollinger Bands** — Volatility bands placed above and below a moving average.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prices`  | `number[]` | — | Price values |
| `period`  | `number` | `20` | SMA window size |
| `stdDevMultiplier` | `number` | `2` | Standard deviation multiplier |

Returns `{ upper: number[], middle: number[], lower: number[] }`.

---

### `stochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3)`
**Stochastic Oscillator** — Compares closing price to a price range over a period.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `highs`   | `number[]` | — | High prices |
| `lows`    | `number[]` | — | Low prices |
| `closes`  | `number[]` | — | Closing prices |
| `kPeriod` | `number` | `14` | %K period |
| `dPeriod` | `number` | `3`  | %D smoothing period |

Returns `{ k: number[], d: number[] }`.

---

## Testing

```bash
npm test
```

All indicators have comprehensive unit tests covering normal cases, edge cases, and input validation.

## License

ISC
