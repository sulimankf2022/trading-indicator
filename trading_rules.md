# Trading Rules & Strategies

## Overview

This document describes the trading rules and strategies used by the **Smart Zones Trading Indicator**. Follow these guidelines to maximise your trading edge and manage risk effectively.

---

## 1. Core Concepts

### Support Zone
A price level where buying pressure has historically been strong enough to prevent the price from falling further. The indicator identifies these zones using pivot lows and counts how many times price has bounced from each level.

### Resistance Zone
A price level where selling pressure has historically prevented the price from rising further. Identified using pivot highs and touch counts.

### Zone Strength
- **Weak Zone** – fewer touches than the configured minimum (`Min Touches for Strong Zone`).
- **Strong Zone** – at least the minimum number of touches. Marked with ★ in the chart label.

---

## 2. Signal Rules

### Buy Signal (▲)
A buy signal is generated when **all** of the following conditions are met:

| # | Condition | Rationale |
|---|-----------|-----------|
| 1 | Price low touches or enters the support zone | Confirms the zone is being tested |
| 2 | Close is **above** the support zone level | Candle closes above zone = bounce |
| 3 | EMA 9 crossover (close crosses above EMA 9) | Short-term momentum confirmation |
| 4 | RSI < Overbought threshold | Avoids buying into already exhausted rallies |
| 5 | Volume > Average × Volume Multiplier *(if enabled)* | Volume confirms genuine buying interest |

### Sell Signal (▼)
A sell signal is generated when **all** of the following conditions are met:

| # | Condition | Rationale |
|---|-----------|-----------|
| 1 | Price high touches or enters the resistance zone | Confirms the zone is being tested |
| 2 | Close is **below** the resistance zone level | Candle closes below zone = rejection (not a breakout) |
| 3 | EMA 9 crossunder (close crosses below EMA 9) | Short-term momentum turning down |
| 4 | RSI > Oversold threshold | Avoids shorting into already exhausted sell-offs |
| 5 | Volume > Average × Volume Multiplier *(if enabled)* | Volume confirms genuine selling pressure |

---

## 3. Confidence Levels

Each signal is scored based on the quality of the conditions:

| Score | Level  | Description |
|-------|--------|-------------|
| 4+    | High   | All confirmation factors align |
| 3     | Medium | Most factors align; some uncertainty |
| 1–2   | Low    | Minimal confirmation; use with caution |

**Scoring:**
- Zone strength ≥ minimum → +2 points; otherwise +1 point
- RSI favourable (< 50 for buy, > 50 for sell) → +1 point
- MACD favourable direction → +1 point
- Volume confirmation → +1 point

> **Rule**: Only act on High or Medium confidence signals unless you have additional confirmation from your own analysis.

---

## 4. Trade Management

### Entry
- Enter at the **close of the signal candle** (or market open of the next candle on daily charts).
- Apply slippage tolerance of 0.05–0.1% for realistic entries.

### Stop Loss
| Type    | Placement |
|---------|-----------|
| **Long**  | Below the support zone minus 1× ATR |
| **Short** | Above the resistance zone plus 1× ATR |

### Take Profit
| Type    | Placement |
|---------|-----------|
| **Long**  | Entry price + 2× ATR |
| **Short** | Entry price − 2× ATR |

> Default Risk/Reward = **1:2** (configurable in `config.example.json`).

### Position Sizing
- Risk no more than **1–2%** of your capital per trade.
- Formula: `Position Size = (Capital × Risk %) / (Entry − Stop Loss)`

---

## 5. Multi-Timeframe Strategy

### Timeframe Hierarchy
| Priority | Timeframe | Usage |
|----------|-----------|-------|
| 1 (Trend) | Daily (D) / 4H | Identify overall trend direction |
| 2 (Signal) | 1H / 15M | Generate entry signals |
| 3 (Entry) | 5M / 1M | Refine entry timing |

### Rules
1. Only take **buy signals** on the signal timeframe when the **daily/4H trend is up**.
2. Only take **sell signals** when the **daily/4H trend is down**.
3. Strong zones on higher timeframes carry more weight.

---

## 6. Zone Breakout Strategy

### Breakout Up (⚡)
- Price closes above a resistance zone → potential continuation of the move.
- The broken resistance often becomes new support; wait for a retest before entering.
- Confirmation: increasing volume + MACD rising.

### Breakout Down (⚡)
- Price closes below a support zone → potential continuation of the downtrend.
- The broken support often becomes new resistance.
- Confirmation: increasing volume + RSI declining.

### False Breakout Filter
- Wait for a candle **close** beyond the zone (not just a wick).
- Volume should be at least **1.5× the 20-bar average** to confirm.

---

## 7. Alert Usage

| Alert | Action |
|-------|--------|
| Price Approaching Zone | Prepare to monitor the chart; set pending orders |
| Zone Breakout | Confirm with volume; consider entering on breakout or retest |
| New Trading Signal | Review confidence level before executing |

---

## 8. Risk Management Rules

1. **Never risk more than 2% per trade.**
2. **Maximum 3 open positions simultaneously.**
3. **Stop trading if daily drawdown exceeds 5%.**
4. **Do not revenge-trade after a loss.** Wait for the next valid signal.
5. **Adjust zone width** in volatile markets: wider zones reduce false signals.

---

## 9. Best Practices

- **Backtest** the strategy on your preferred symbol and timeframe using `backtest.py` before going live.
- **Review** the performance dashboard (win rate, R/R) regularly to ensure the strategy remains valid.
- **Avoid** trading during major news events (NFP, FOMC, earnings) unless you are experienced.
- **Keep a trading journal**: record every signal, your reasoning, and the outcome.

---

## 10. Quick Reference

```
Buy  Signal: Support bounce + EMA9 crossover + RSI not overbought + Volume ✓
Sell Signal: Resistance rejection + EMA9 crossunder + RSI not oversold + Volume ✓
Stop Loss : Zone level ± 1× ATR
Take Profit: Entry ± 2× ATR  (1:2 R/R)
Position  : 2% capital risk per trade
```

---

*Always trade with a plan. Past performance does not guarantee future results.*
