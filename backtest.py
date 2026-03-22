#!/usr/bin/env python3
"""
Smart Zones Trading Indicator - Backtesting Script
===================================================
Simulates the Smart Zones indicator logic on historical OHLCV data
and produces performance statistics.

Requirements:
    pip install pandas numpy requests

Usage:
    python backtest.py --symbol BTCUSDT --timeframe 1h --start 2024-01-01 --end 2024-12-31
    python backtest.py --symbol AAPL --source csv --csv_file data/AAPL.csv
    python backtest.py --config config.example.json
"""

import argparse
import json
import math
import os
import sys
from datetime import datetime, timedelta
from typing import Optional

try:
    import pandas as pd
    import numpy as np
except ImportError:
    print("ERROR: pandas and numpy are required. Install with:  pip install pandas numpy")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DEFAULT_CONFIG = {
    "zone_detection": {
        "lookback_period": 20,
        "min_touches_strong": 2,
        "zone_width_pct": 0.5,
    },
    "signals": {
        "rsi_period": 14,
        "rsi_overbought": 70,
        "rsi_oversold": 30,
        "use_volume_filter": True,
        "volume_multiplier": 1.5,
    },
    "backtesting": {
        "initial_capital": 10000.0,
        "position_size_pct": 2.0,
        "stop_loss_atr_mult": 1.5,
        "take_profit_atr_mult": 3.0,
        "commission_pct": 0.1,
        "slippage_pct": 0.05,
    },
}


def load_config(path: Optional[str]) -> dict:
    """Load configuration from a JSON file, falling back to defaults."""
    if path and os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            user_cfg = json.load(f)
        # Deep merge with defaults
        cfg = DEFAULT_CONFIG.copy()
        for section, values in user_cfg.items():
            if section in cfg and isinstance(cfg[section], dict):
                cfg[section].update(values)
            else:
                cfg[section] = values
        return cfg
    return DEFAULT_CONFIG


# ---------------------------------------------------------------------------
# Technical Indicators
# ---------------------------------------------------------------------------

def compute_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """Average True Range."""
    high, low, close = df["high"], df["low"], df["close"]
    prev_close = close.shift(1)
    tr = pd.concat(
        [high - low, (high - prev_close).abs(), (low - prev_close).abs()], axis=1
    ).max(axis=1)
    return tr.ewm(alpha=1 / period, adjust=False).mean()


def compute_rsi(close: pd.Series, period: int = 14) -> pd.Series:
    """Relative Strength Index."""
    delta = close.diff()
    gain = delta.clip(lower=0).ewm(alpha=1 / period, adjust=False).mean()
    loss = (-delta.clip(upper=0)).ewm(alpha=1 / period, adjust=False).mean()
    rs = gain / loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def compute_ema(series: pd.Series, period: int) -> pd.Series:
    """Exponential Moving Average."""
    return series.ewm(span=period, adjust=False).mean()


def compute_pivot_highs(high: pd.Series, lookback: int) -> pd.Series:
    """Return pivot high values (NaN where not a pivot)."""
    pivots = pd.Series(np.nan, index=high.index)
    for i in range(lookback, len(high) - lookback):
        window = high.iloc[i - lookback : i + lookback + 1]
        if high.iloc[i] == window.max():
            pivots.iloc[i] = high.iloc[i]
    return pivots


def compute_pivot_lows(low: pd.Series, lookback: int) -> pd.Series:
    """Return pivot low values (NaN where not a pivot)."""
    pivots = pd.Series(np.nan, index=low.index)
    for i in range(lookback, len(low) - lookback):
        window = low.iloc[i - lookback : i + lookback + 1]
        if low.iloc[i] == window.min():
            pivots.iloc[i] = low.iloc[i]
    return pivots


# ---------------------------------------------------------------------------
# Zone Management
# ---------------------------------------------------------------------------

class Zone:
    def __init__(self, level: float, is_support: bool, bar_index: int):
        self.level = level
        self.is_support = is_support
        self.touches = 1
        self.created_bar = bar_index
        self.active = True


def half_width(close_price: float, atr: float, zone_width_pct: float) -> float:
    return max(atr * 0.5, close_price * zone_width_pct / 100)


def find_nearest_zones(zones: list[Zone], close_price: float, atr: float, zone_width_pct: float):
    nearest_sup = None
    nearest_res = None
    sup_dist = float("inf")
    res_dist = float("inf")

    for z in zones:
        if not z.active:
            continue
        dist = abs(close_price - z.level)
        if z.is_support and close_price >= z.level and dist < sup_dist:
            sup_dist = dist
            nearest_sup = z
        if not z.is_support and close_price <= z.level and dist < res_dist:
            res_dist = dist
            nearest_res = z

    return nearest_sup, nearest_res


# ---------------------------------------------------------------------------
# Signal Generation
# ---------------------------------------------------------------------------

def signal_confidence(touches: int, min_touches: int, rsi_ok: bool, macd_ok: bool, vol_ok: bool) -> str:
    score = (2 if touches >= min_touches else 1) + int(rsi_ok) + int(macd_ok) + int(vol_ok)
    if score >= 4:
        return "High"
    if score >= 3:
        return "Medium"
    return "Low"


def generate_signals(df: pd.DataFrame, cfg: dict) -> pd.DataFrame:
    """
    Run the Smart Zones logic on the dataframe and add signal columns.
    Returns the dataframe with added columns: signal, confidence, stop_loss, take_profit.
    """
    zd_cfg  = cfg["zone_detection"]
    sig_cfg = cfg["signals"]

    lookback     = zd_cfg["lookback_period"]
    min_touches  = zd_cfg["min_touches_strong"]
    zone_w_pct   = zd_cfg["zone_width_pct"]
    rsi_period   = sig_cfg["rsi_period"]
    rsi_ob       = sig_cfg["rsi_overbought"]
    rsi_os       = sig_cfg["rsi_oversold"]
    use_vol      = sig_cfg["use_volume_filter"]
    vol_mult     = sig_cfg["volume_multiplier"]

    df = df.copy()
    df["atr"]         = compute_atr(df, 14)
    df["rsi"]         = compute_rsi(df["close"], rsi_period)
    df["ema_fast"]    = compute_ema(df["close"], 9)
    df["ema_slow"]    = compute_ema(df["close"], 21)
    df["macd_line"]   = compute_ema(df["close"], 12) - compute_ema(df["close"], 26)
    df["macd_signal"] = compute_ema(df["macd_line"], 9)
    df["vol_avg"]     = df["volume"].rolling(20).mean() if "volume" in df.columns else pd.Series(1, index=df.index)

    pivot_h = compute_pivot_highs(df["high"], lookback)
    pivot_l = compute_pivot_lows(df["low"],   lookback)

    df["signal"]      = 0   # 1=buy, -1=sell
    df["confidence"]  = ""
    df["stop_loss"]   = np.nan
    df["take_profit"] = np.nan

    zones: list[Zone] = []
    MAX_ZONES = 30

    for i in range(lookback * 2, len(df)):
        row    = df.iloc[i]
        close  = row["close"]
        atr    = row["atr"]
        hw     = half_width(close, atr, zone_w_pct)

        # Register new pivot zones
        if not math.isnan(pivot_h.iloc[i]):
            lvl = pivot_h.iloc[i]
            existing = next((z for z in zones if abs(z.level - lvl) < hw * 2), None)
            if existing:
                existing.touches += 1
            else:
                if len(zones) >= MAX_ZONES:
                    zones.pop(0)
                zones.append(Zone(lvl, False, i))

        if not math.isnan(pivot_l.iloc[i]):
            lvl = pivot_l.iloc[i]
            existing = next((z for z in zones if abs(z.level - lvl) < hw * 2), None)
            if existing:
                existing.touches += 1
            else:
                if len(zones) >= MAX_ZONES:
                    zones.pop(0)
                zones.append(Zone(lvl, True, i))

        # Count touches
        for z in zones:
            if abs(close - z.level) < hw:
                z.touches += 1

        nearest_sup, nearest_res = find_nearest_zones(zones, close, atr, zone_w_pct)

        # Volume filter
        vol_ok = True
        if use_vol and "volume" in df.columns:
            vol_avg = row["vol_avg"]
            if not math.isnan(vol_avg) and vol_avg > 0:
                vol_ok = row["volume"] > vol_avg * vol_mult

        # BUY signal: price bounces from support
        if nearest_sup is not None:
            prev_row = df.iloc[i - 1]
            # Bounce: this bar tests support zone and closes above it, with upward momentum
            in_zone      = row["low"] <= nearest_sup.level + hw
            close_above  = close > nearest_sup.level
            bullish_close = close > prev_row["close"]   # close higher than previous bar
            rsi_not_ob   = row["rsi"] < rsi_ob
            bounce = in_zone and close_above and bullish_close and rsi_not_ob and vol_ok
            if bounce:
                conf = signal_confidence(
                    nearest_sup.touches, min_touches,
                    row["rsi"] < 50,
                    row["macd_line"] > row["macd_signal"],
                    vol_ok
                )
                df.at[df.index[i], "signal"]      = 1
                df.at[df.index[i], "confidence"]  = conf
                df.at[df.index[i], "stop_loss"]   = nearest_sup.level - atr
                df.at[df.index[i], "take_profit"] = close + atr * 2

        # SELL signal: price tests resistance and reverses (sell at resistance)
        if nearest_res is not None:
            prev_row = df.iloc[i - 1]
            # Price reaches resistance zone but closes below it (rejection / reversal)
            tested_res    = row["high"] >= nearest_res.level - hw
            close_below   = close < nearest_res.level
            bearish_close = close < prev_row["close"]   # close lower than previous bar
            rsi_not_os    = row["rsi"] > rsi_os
            breakout = tested_res and close_below and bearish_close and rsi_not_os and vol_ok
            if breakout:
                conf = signal_confidence(
                    nearest_res.touches, min_touches,
                    row["rsi"] > 50,
                    row["macd_line"] < row["macd_signal"],
                    vol_ok
                )
                df.at[df.index[i], "signal"]      = -1
                df.at[df.index[i], "confidence"]  = conf
                df.at[df.index[i], "stop_loss"]   = nearest_res.level + atr
                df.at[df.index[i], "take_profit"] = close - atr * 2

    return df


# ---------------------------------------------------------------------------
# Backtesting Engine
# ---------------------------------------------------------------------------

class Trade:
    def __init__(self, direction: int, entry_price: float, stop_loss: float,
                 take_profit: float, confidence: str, bar_index: int, timestamp):
        self.direction    = direction      # 1=long, -1=short
        self.entry_price  = entry_price
        self.stop_loss    = stop_loss
        self.take_profit  = take_profit
        self.confidence   = confidence
        self.entry_bar    = bar_index
        self.entry_time   = timestamp
        self.exit_price   = None
        self.exit_bar     = None
        self.exit_time    = None
        self.exit_reason  = None
        self.pnl_pct      = None
        self.result       = None           # "win" | "loss"


def run_backtest(df: pd.DataFrame, cfg: dict) -> tuple[list[Trade], pd.Series]:
    """Execute trades based on signals and return trade list + equity curve."""
    bt_cfg     = cfg["backtesting"]
    capital    = bt_cfg["initial_capital"]
    pos_size   = bt_cfg["position_size_pct"] / 100
    commission = bt_cfg["commission_pct"] / 100
    slippage   = bt_cfg["slippage_pct"] / 100

    equity     = pd.Series(capital, index=df.index, dtype=float)
    trades: list[Trade] = []
    open_trade: Optional[Trade] = None

    for i in range(len(df)):
        row = df.iloc[i]

        if open_trade is not None:
            price = row["close"]
            # Adjust for slippage on close
            eff_price = price * (1 - slippage) if open_trade.direction == 1 else price * (1 + slippage)

            hit_sl = (open_trade.direction ==  1 and row["low"]  <= open_trade.stop_loss) or \
                     (open_trade.direction == -1 and row["high"] >= open_trade.stop_loss)
            hit_tp = (open_trade.direction ==  1 and row["high"] >= open_trade.take_profit) or \
                     (open_trade.direction == -1 and row["low"]  <= open_trade.take_profit)

            if hit_tp or hit_sl:
                exit_p = open_trade.take_profit if hit_tp else open_trade.stop_loss
                raw_pnl = (exit_p - open_trade.entry_price) * open_trade.direction
                pnl_pct = raw_pnl / open_trade.entry_price - 2 * commission  # entry + exit commission
                open_trade.exit_price  = exit_p
                open_trade.exit_bar    = i
                open_trade.exit_time   = df.index[i]
                open_trade.exit_reason = "TP" if hit_tp else "SL"
                open_trade.pnl_pct     = pnl_pct
                open_trade.result      = "win" if pnl_pct > 0 else "loss"
                capital                *= (1 + pnl_pct * pos_size)
                trades.append(open_trade)
                open_trade = None

        # Enter new trade
        if open_trade is None and row["signal"] != 0:
            entry_p = row["close"] * (1 + slippage) if row["signal"] == 1 else row["close"] * (1 - slippage)
            if not math.isnan(row["stop_loss"]) and not math.isnan(row["take_profit"]):
                open_trade = Trade(
                    direction    = int(row["signal"]),
                    entry_price  = entry_p,
                    stop_loss    = row["stop_loss"],
                    take_profit  = row["take_profit"],
                    confidence   = row["confidence"],
                    bar_index    = i,
                    timestamp    = df.index[i],
                )

        equity.iloc[i] = capital

    return trades, equity


# ---------------------------------------------------------------------------
# Performance Statistics
# ---------------------------------------------------------------------------

def compute_stats(trades: list[Trade], equity: pd.Series, initial_capital: float) -> dict:
    """Compute performance metrics."""
    if not trades:
        return {"error": "No trades executed."}

    wins   = [t for t in trades if t.result == "win"]
    losses = [t for t in trades if t.result == "loss"]
    pnls   = [t.pnl_pct for t in trades if t.pnl_pct is not None]

    win_rate    = len(wins) / len(trades) * 100 if trades else 0
    avg_win     = np.mean([t.pnl_pct for t in wins])   if wins   else 0
    avg_loss    = np.mean([t.pnl_pct for t in losses]) if losses else 0
    rr_ratio    = abs(avg_win / avg_loss) if avg_loss != 0 else float("inf")
    total_return = (equity.iloc[-1] - initial_capital) / initial_capital * 100

    # Max drawdown
    roll_max = equity.cummax()
    drawdown = (equity - roll_max) / roll_max * 100
    max_dd   = drawdown.min()

    # Sharpe (daily approximation)
    eq_returns = equity.pct_change().dropna()
    sharpe = (eq_returns.mean() / eq_returns.std() * math.sqrt(252)) if eq_returns.std() > 0 else 0

    # By confidence
    conf_breakdown = {}
    for conf in ["High", "Medium", "Low"]:
        ct = [t for t in trades if t.confidence == conf]
        cw = [t for t in ct     if t.result == "win"]
        conf_breakdown[conf] = {
            "total" : len(ct),
            "wins"  : len(cw),
            "win_rate": round(len(cw) / len(ct) * 100, 1) if ct else 0,
        }

    return {
        "total_trades"  : len(trades),
        "winning_trades": len(wins),
        "losing_trades" : len(losses),
        "win_rate_pct"  : round(win_rate, 2),
        "avg_win_pct"   : round(avg_win * 100, 3),
        "avg_loss_pct"  : round(avg_loss * 100, 3),
        "risk_reward"   : round(rr_ratio, 2),
        "total_return_pct": round(total_return, 2),
        "max_drawdown_pct": round(max_dd, 2),
        "sharpe_ratio"  : round(sharpe, 3),
        "final_capital" : round(equity.iloc[-1], 2),
        "confidence_breakdown": conf_breakdown,
    }


def print_stats(stats: dict) -> None:
    """Pretty-print performance statistics."""
    if "error" in stats:
        print(f"\n⚠  {stats['error']}")
        return

    sep = "=" * 50
    print(f"\n{sep}")
    print("  📊  SMART ZONES BACKTEST RESULTS")
    print(sep)
    print(f"  Total Trades      : {stats['total_trades']}")
    print(f"  Winning Trades    : {stats['winning_trades']}")
    print(f"  Losing Trades     : {stats['losing_trades']}")
    print(f"  Win Rate          : {stats['win_rate_pct']:.1f}%")
    print(f"  Avg Win           : {stats['avg_win_pct']:.3f}%")
    print(f"  Avg Loss          : {stats['avg_loss_pct']:.3f}%")
    print(f"  Risk/Reward Ratio : 1:{stats['risk_reward']:.2f}")
    print(f"  Total Return      : {stats['total_return_pct']:.2f}%")
    print(f"  Max Drawdown      : {stats['max_drawdown_pct']:.2f}%")
    print(f"  Sharpe Ratio      : {stats['sharpe_ratio']:.3f}")
    print(f"  Final Capital     : ${stats['final_capital']:,.2f}")
    print(sep)
    print("  Confidence Breakdown:")
    for conf, data in stats["confidence_breakdown"].items():
        print(f"    {conf:6s} : {data['total']:3d} trades | Win Rate: {data['win_rate']:.1f}%")
    print(sep + "\n")


# ---------------------------------------------------------------------------
# Data Loading
# ---------------------------------------------------------------------------

def load_csv(path: str) -> pd.DataFrame:
    """Load OHLCV data from a CSV file."""
    df = pd.read_csv(path, parse_dates=True, index_col=0)
    df.columns = [c.lower() for c in df.columns]
    required = {"open", "high", "low", "close"}
    missing  = required - set(df.columns)
    if missing:
        raise ValueError(f"CSV is missing columns: {missing}")
    if "volume" not in df.columns:
        df["volume"] = 1.0
    return df.sort_index()


def generate_sample_data(n: int = 500, seed: int = 42) -> pd.DataFrame:
    """Generate synthetic OHLCV data for testing purposes."""
    rng = np.random.default_rng(seed)
    dates = pd.date_range(end=datetime.now(), periods=n, freq="1h")
    price = 100.0
    rows  = []
    for _ in range(n):
        ret   = rng.normal(0, 0.01)
        op    = price
        cl    = price * (1 + ret)
        hi    = max(op, cl) * (1 + abs(rng.normal(0, 0.003)))
        lo    = min(op, cl) * (1 - abs(rng.normal(0, 0.003)))
        vol   = abs(rng.normal(1_000_000, 200_000))
        rows.append({"open": op, "high": hi, "low": lo, "close": cl, "volume": vol})
        price = cl
    return pd.DataFrame(rows, index=dates)


# ---------------------------------------------------------------------------
# CLI Entry Point
# ---------------------------------------------------------------------------

def parse_args():
    parser = argparse.ArgumentParser(
        description="Smart Zones Trading Indicator Backtester"
    )
    parser.add_argument("--symbol",    default="SAMPLE", help="Symbol name (informational)")
    parser.add_argument("--timeframe", default="1h",     help="Timeframe (informational)")
    parser.add_argument("--source",    default="sample", choices=["sample", "csv"],
                        help="Data source: 'sample' generates synthetic data, 'csv' reads a file")
    parser.add_argument("--csv_file",  default="",  help="Path to CSV file (required if --source csv)")
    parser.add_argument("--config",    default="",  help="Path to config JSON file")
    parser.add_argument("--output",    default="",  help="Save results to JSON file")
    parser.add_argument("--bars",      type=int, default=500, help="Number of synthetic bars to generate")
    return parser.parse_args()


def main():
    args = parse_args()
    cfg  = load_config(args.config if args.config else None)

    print(f"\n🔍  Loading data for {args.symbol} [{args.timeframe}] ...")

    if args.source == "csv":
        if not args.csv_file:
            print("ERROR: --csv_file is required when --source csv")
            sys.exit(1)
        df = load_csv(args.csv_file)
    else:
        df = generate_sample_data(n=args.bars)

    print(f"✅  Loaded {len(df)} bars  ({df.index[0]} → {df.index[-1]})")
    print("⚙️   Generating signals ...")
    df = generate_signals(df, cfg)

    buy_count  = (df["signal"] ==  1).sum()
    sell_count = (df["signal"] == -1).sum()
    print(f"📈  Buy signals: {buy_count}  |  📉 Sell signals: {sell_count}")

    print("🏃  Running backtest ...")
    trades, equity = run_backtest(df, cfg)
    stats = compute_stats(trades, equity, cfg["backtesting"]["initial_capital"])
    print_stats(stats)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(stats, f, indent=2)
        print(f"💾  Results saved to: {args.output}")


if __name__ == "__main__":
    main()
