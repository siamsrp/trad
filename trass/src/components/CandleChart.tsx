import React, { useEffect, useRef, useMemo } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
} from 'lightweight-charts';

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type Timeframe = '5s' | '1m' | '5m' | '15m' | '30m' | '1h' | '1d';

// Seconds per timeframe
const TF_SECONDS: Record<Timeframe, number> = {
  '5s':  5,
  '1m':  60,
  '5m':  300,
  '15m': 900,
  '30m': 1800,
  '1h':  3600,
  '1d':  86400,
};

function aggregateCandles(raw: CandleData[], periodSec: number): CandleData[] {
  if (periodSec <= 5) return raw; // native 5s candles
  const buckets = new Map<number, CandleData>();
  for (const c of raw) {
    const bucket = Math.floor(c.time / periodSec) * periodSec;
    const existing = buckets.get(bucket);
    if (!existing) {
      buckets.set(bucket, { time: bucket, open: c.open, high: c.high, low: c.low, close: c.close });
    } else {
      existing.high  = Math.max(existing.high, c.high);
      existing.low   = Math.min(existing.low,  c.low);
      existing.close = c.close;
    }
  }
  return Array.from(buckets.values()).sort((a, b) => a.time - b.time);
}

interface CandleChartProps {
  data: CandleData[];
  assetId: string;
  timeframe?: Timeframe;
}

export default function CandleChart({ data, assetId, timeframe = '5s' }: CandleChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const prevKeyRef = useRef<string | null>(null);

  const aggregated = useMemo(
    () => aggregateCandles(data, TF_SECONDS[timeframe]),
    [data, timeframe]
  );

  // Create chart once on mount
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.4)',
        fontFamily: 'monospace',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: {
        borderVisible: false,
        textColor: 'rgba(255, 255, 255, 0.4)',
        autoScale: true,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: true,
        fixLeftEdge: false,
        fixRightEdge: false,
        rightBarStaysOnScroll: true,
        shiftVisibleRangeOnNewBar: true,
        barSpacing: 6,
        minBarSpacing: 2,
      },
      autoSize: true,
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      prevKeyRef.current = null;
    };
  }, []);

  // Reload data when asset or timeframe changes, or update last candle on tick
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || aggregated.length === 0) return;

    const key = `${assetId}-${timeframe}`;
    const isNewKey = prevKeyRef.current !== key;

    if (isNewKey) {
      seriesRef.current.setData(aggregated as any);
      prevKeyRef.current = key;

      setTimeout(() => {
        if (!chartRef.current || aggregated.length === 0) return;
        const ts = chartRef.current.timeScale();
        const last = aggregated[aggregated.length - 1].time;
        const firstVisible = aggregated[Math.max(0, aggregated.length - 80)].time;
        ts.setVisibleRange({ from: firstVisible as any, to: last as any });
      }, 50);
    } else {
      // Real-time: update last candle
      seriesRef.current.update(aggregated[aggregated.length - 1] as any);
    }
  }, [aggregated, assetId, timeframe]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
}
