# Smart Zones Trading Indicator

A professional, production-ready **TradingView Pine Script v5** indicator featuring automatic support/resistance zone detection, multi-confirmation trading signals, multi-timeframe compatibility, smart alerts, and a built-in performance dashboard.

---

## Features

### 🟢 Smart Zones Detection
- Automatically identifies support and resistance zones using pivot highs/lows
- Color-coded visualization (green = support, red = resistance)
- Zone strength indicator based on the number of price touches
- ATR-based dynamic zone width that adapts to market volatility

### 📊 Trading Signals
- **Buy signals** when price bounces from support zones
- **Sell signals** when price breaks through resistance zones
- **Confidence levels** (High / Medium / Low) based on multi-factor scoring
- Optional volume confirmation filter

### ⏱️ Multi-Timeframe Support
- Compatible with all TradingView timeframes: 1m, 5m, 15m, 30m, 1h, 4h, 1d
- Zone width automatically adapts per timeframe via ATR
- Use higher timeframes for trend direction and lower timeframes for entries

### 🔔 Alert System
- Price approaching zone alerts
- Zone breakout alerts (up & down)
- Signal generation alerts (buy/sell)
- Configurable approach threshold (%)

### 📈 Performance Dashboard
- Win rate calculation
- Risk/Reward ratio display
- Total buy & sell signal counts
- Live RSI state indicator

---

## Files

| File | Description |
|------|-------------|
| `indicator.pine` | TradingView Pine Script v5 indicator (main file) |
| `settings.json` | Default configuration parameters |
| `config.example.json` | Extended configuration example with all options |
| `trading_rules.md` | Trading rules and strategy documentation |
| `backtest.py` | Python backtesting script for historical validation |

---

## Installation

### TradingView (Pine Script)

1. Open [TradingView](https://www.tradingview.com) and open any chart.
2. Click the **Pine Script Editor** tab at the bottom.
3. Delete the default script, then paste the contents of `indicator.pine`.
4. Click **Add to chart**.
5. Configure parameters in the **Settings** panel (gear icon ⚙️).

---

## Configuration

All parameters can be adjusted in the indicator's **Settings** panel or via `settings.json`/`config.example.json`.

### Zone Detection
| Parameter | Default | Description |
|-----------|---------|-------------|
| Zone Lookback Period | 20 | Number of bars used to identify pivot points |
| Min Touches for Strong Zone | 2 | Minimum touches to mark a zone as strong (★) |
| Zone Width (%) | 0.5 | Zone half-width as a percentage of price (ATR-adjusted) |
| Show Zones | true | Enable/disable zone drawing |
| Show Zone Labels | true | Show level labels on zones |
| Extend Zones to Right | true | Extend zone boxes to the latest bar |

### Signal Settings
| Parameter | Default | Description |
|-----------|---------|-------------|
| RSI Period | 14 | RSI calculation period |
| RSI Overbought | 70 | RSI threshold above which buy signals are suppressed |
| RSI Oversold | 30 | RSI threshold for oversold conditions |
| Use Volume Filter | true | Require above-average volume for signals |
| Volume Multiplier | 1.5 | Volume must exceed average × this multiplier |

### Alert Settings
| Parameter | Default | Description |
|-----------|---------|-------------|
| Alert: Price Approaching Zone | true | Fire alert when price nears a zone |
| Alert: Zone Breakout | true | Fire alert on zone breakout |
| Alert: New Signal | true | Fire alert on buy/sell signal |
| Approach Threshold (%) | 0.3 | Distance (% of price) that triggers approach alert |

---

## Python Backtesting

The `backtest.py` script simulates the indicator logic on historical OHLCV data.

### Requirements
```bash
pip install pandas numpy
```

### Quick Start
```bash
# Run on synthetic data (500 bars)
python backtest.py

# Run on your own CSV file (columns: open, high, low, close, volume)
python backtest.py --source csv --csv_file data/BTCUSDT_1h.csv --symbol BTCUSDT

# Use custom configuration
python backtest.py --config config.example.json --output results.json
```

### CSV Format
```
timestamp,open,high,low,close,volume
2024-01-01 00:00:00,42000,42500,41800,42200,1500000
...
```

### Output Example
```
==================================================
  📊  SMART ZONES BACKTEST RESULTS
==================================================
  Total Trades      : 48
  Winning Trades    : 29
  Losing Trades     : 19
  Win Rate          : 60.4%
  Avg Win           : 1.823%
  Avg Loss          : -0.912%
  Risk/Reward Ratio : 1:2.00
  Total Return      : 24.50%
  Max Drawdown      : -8.12%
  Sharpe Ratio      : 1.432
  Final Capital     : $12,450.00
==================================================
```

---

## Trading Rules Summary

See [`trading_rules.md`](trading_rules.md) for the full strategy documentation.

| Signal | Conditions |
|--------|-----------|
| **BUY ▲** | Price bounces from support + EMA9 crossover + RSI not overbought + Volume ✓ |
| **SELL ▼** | Price rejected at resistance + EMA9 crossunder + RSI not oversold + Volume ✓ |
| **Stop Loss** | Zone level ± 1× ATR |
| **Take Profit** | Entry ± 2× ATR |

---

## Disclaimer

This indicator is for **educational and informational purposes only**. It does not constitute financial or investment advice. Past performance does not guarantee future results. Always perform your own due diligence and manage your risk appropriately.
