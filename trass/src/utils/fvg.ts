/**
 * Port of Institutional FVG + iFVG Indicator
 * Based on the Pine Script by LliterH
 * Features: ATR displacement, Liquidity Sweep, Volume filter, Inversion logic
 */

export interface FVGZone {
  id: string;
  top: number;
  bottom: number;
  mid: number;
  type: 'bull' | 'bear';
  isSpent: boolean;
  isIFVG: boolean;
  barIndex: number; // The index in the history where it was formed
}

function calculateATR(data: { high: number; low: number; close: number }[], length: number): number[] {
  const atr = new Array(data.length).fill(0);
  const tr = data.map((d, i) => {
    if (i === 0) return d.high - d.low;
    const hl = d.high - d.low;
    const hpc = Math.abs(d.high - data[i - 1].close);
    const lpc = Math.abs(d.low - data[i - 1].close);
    return Math.max(hl, hpc, lpc);
  });

  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += tr[i];
    if (i >= length) {
      sum -= tr[i - length];
      atr[i] = sum / length;
    } else {
      atr[i] = sum / (i + 1);
    }
  }
  return atr;
}

function getHighest(values: number[], length: number): number[] {
  const result = new Array(values.length).fill(0);
  for (let i = 0; i < values.length; i++) {
    let max = -Infinity;
    const start = Math.max(0, i - length + 1);
    for (let j = start; j <= i; j++) {
      if (values[j] > max) max = values[j];
    }
    result[i] = max;
  }
  return result;
}

function getLowest(values: number[], length: number): number[] {
  const result = new Array(values.length).fill(0);
  for (let i = 0; i < values.length; i++) {
    let min = Infinity;
    const start = Math.max(0, i - length + 1);
    for (let j = start; j <= i; j++) {
      if (values[j] < min) min = values[j];
    }
    result[i] = min;
  }
  return result;
}

function getPercentile(values: number[], length: number, p: number): number[] {
  const result = new Array(values.length).fill(0);
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - length + 1);
    const window = values.slice(start, i + 1).sort((a, b) => a - b);
    const idx = Math.floor((p / 100) * (window.length - 1));
    result[i] = window[idx];
  }
  return result;
}

export function detectFVGs(
  history: { open: number; high: number; low: number; close: number; volume?: number }[],
  maxZones = 5,
  atrMult = 2.0,
  volLookback = 50
): FVGZone[] {
  const n = history.length;
  if (n < 5) return [];

  const highs = history.map(h => h.high);
  const lows = history.map(h => h.low);
  const volumes = history.map(h => h.volume || 0);
  const atrs = calculateATR(history, 14);
  const volP80 = getPercentile(volumes, volLookback, 80);
  
  const lowestLows = getLowest(lows, 20);
  const highestHighs = getHighest(highs, 20);

  const zones: FVGZone[] = [];

  for (let i = 2; i < n; i++) {
    const atr = atrs[i - 1];
    const volLimit = volP80[i - 1];
    
    // Filter 1 - Displacement
    const displacement = (highs[i - 1] - lows[i - 1]) > atrMult * atr;
    
    // Filter 2 - Sweep
    const bullSweep = i >= 3 && lows[i - 2] < (i >= 23 ? lowestLows[i - 3] : Math.min(...lows.slice(0, i - 2)));
    const bearSweep = i >= 3 && highs[i - 2] > (i >= 23 ? highestHighs[i - 3] : Math.max(...highs.slice(0, i - 2)));

    // Filter 3 - Volume
    const volumeHigh = volumes[i - 1] > volLimit;

    // FVG Detection (3-candle gap)
    const bullRaw = highs[i - 2] < lows[i]; // Gap between bar[i-2] high and bar[i] low
    const bearRaw = lows[i - 2] > highs[i]; // Gap between bar[i-2] low and bar[i] high

    if (bullRaw && displacement && bullSweep && volumeHigh) {
      zones.push({
        id: `bull-${i}`,
        top: lows[i],
        bottom: highs[i - 2],
        mid: (lows[i] + highs[i - 2]) / 2,
        type: 'bull',
        isSpent: false,
        isIFVG: false,
        barIndex: i
      });
    }

    if (bearRaw && displacement && bearSweep && volumeHigh) {
      zones.push({
        id: `bear-${i}`,
        top: lows[i - 2],
        bottom: highs[i],
        mid: (lows[i - 2] + highs[i]) / 2,
        type: 'bear',
        isSpent: false,
        isIFVG: false,
        barIndex: i
      });
    }
  }

  // State Management - Update zones with current price action
  const activeZones: FVGZone[] = [];
  const bullActive: FVGZone[] = [];
  const bearActive: FVGZone[] = [];

  // Iterate from the moment each zone was formed to the current bar
  for (const zone of zones) {
    let currentSpent = false;
    let currentIFVG = false;
    
    for (let j = zone.barIndex + 1; j < n; j++) {
      const price = history[j].close;
      if (zone.type === 'bull') {
        if (price < zone.bottom) {
          currentIFVG = true;
          break; // Stop updating once it becomes iFVG (it's permanently inverted)
        } else if (price < zone.mid) {
          currentSpent = true;
        }
      } else {
        if (price > zone.top) {
          currentIFVG = true;
          break;
        } else if (price > zone.mid) {
          currentSpent = true;
        }
      }
    }

    const updatedZone = { ...zone, isSpent: currentSpent, isIFVG: currentIFVG };
    
    if (updatedZone.type === 'bull') bullActive.push(updatedZone);
    else bearActive.push(updatedZone);
  }

  // Keep only max_zones per side (latest ones)
  const resultBull = bullActive.slice(-maxZones);
  const resultBear = bearActive.slice(-maxZones);

  return [...resultBull, ...resultBear];
}
