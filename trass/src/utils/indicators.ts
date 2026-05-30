/**
 * Port of John F. Ehlers' Synthetic Oscillator
 * Based on TASC April 2026 Article: "Avoiding Whipsaw Trades"
 * Pine Script v6 to TypeScript conversion
 */

export interface IndicatorPoint {
  time: string;
  price: number;
  so?: number;
}

// 2nd Order SuperSmoother IIR Filter
function superSmoother(src: number[], period: number): number[] {
  const result = new Array(src.length).fill(0);
  const q = Math.exp(-1.414 * Math.PI / period);
  const c1 = 2.0 * q * Math.cos(1.414 * Math.PI / period);
  const c2 = q * q;
  const a0 = (1.0 - c1 + c2) / 2;

  for (let i = 0; i < src.length; i++) {
    if (i < 4) {
      result[i] = src[i];
    } else {
      result[i] = a0 * (src[i] + src[i - 1]) +
                  c1 * result[i - 1] - c2 * result[i - 2];
    }
  }
  return result;
}

// UltimateSmoother Filter
function ultimateSmoother(src: number[], period: number): number[] {
  const result = new Array(src.length).fill(0);
  const q = Math.exp(-1.414 * Math.PI / period);
  const c1 = 2.0 * q * Math.cos(1.414 * Math.PI / period);
  const c2 = q * q;
  const a0 = (1.0 + c1 + c2) / 4.0;

  for (let i = 0; i < src.length; i++) {
    if (i < 4) {
      result[i] = src[i];
    } else {
      result[i] = (1.0 - a0) * src[i] +
                  (2.0 * a0 - c1) * src[i - 1] +
                  (c2 - a0) * src[i - 2] +
                  c1 * result[i - 1] - c2 * result[i - 2];
    }
  }
  return result;
}

// Root Mean Square
function rms(src: number[], length: number): number[] {
  const result = new Array(src.length).fill(0);
  for (let i = 0; i < src.length; i++) {
    let sum = 0;
    const start = Math.max(0, i - length + 1);
    const count = i - start + 1;
    for (let j = start; j <= i; j++) {
      sum += src[j] * src[j];
    }
    result[i] = sum !== 0 ? Math.sqrt(sum / count) : 0;
  }
  return result;
}

// High Pass Filter
function hpFilter(src: number[], period: number): number[] {
  const result = new Array(src.length).fill(0);
  const Q = Math.exp(-1.414 * Math.PI / period);
  const c1 = 2.0 * Q * Math.cos(1.414 * Math.PI / period);
  const c2 = Q * Q;
  const a0 = (1 + c1 + c2) / 4;

  for (let i = 0; i < src.length; i++) {
    if (i < 4) {
      result[i] = 0;
    } else {
      result[i] = a0 * (src[i] - 2 * src[i - 1] + src[i - 2]) +
                  c1 * result[i - 1] - c2 * result[i - 2];
    }
  }
  return result;
}

// Hann Filter
function hannFilter(src: number[], length: number): number[] {
  const result = new Array(src.length).fill(0);
  for (let i = 0; i < src.length; i++) {
    let filt = 0;
    let coef = 0;
    for (let c = 1; c <= length; c++) {
      const idx = i - (c - 1);
      if (idx >= 0) {
        const p = Math.cos(2 * Math.PI * c / (length + 1));
        filt += (1.0 - p) * src[idx];
        coef += 1.0 - p;
      }
    }
    result[i] = coef !== 0 ? filt / coef : 0;
  }
  return result;
}

// Main Synthetic Oscillator Calculation
export function calculateSO(prices: number[], lb = 15, ub = 25): number[] {
  const n = prices.length;
  if (n < 2) return new Array(n).fill(0);

  const priceHann = hannFilter(prices, 12);
  const hp = hpFilter(priceHann, ub);
  const lp = superSmoother(hp, lb);
  const rmsLp = rms(lp, 100);
  
  const re = lp.map((val, i) => (rmsLp[i] !== 0 ? val / rmsLp[i] : 0));
  const roc = re.map((val, i) => (i > 0 ? val - re[i - 1] : 0));
  const qrms = rms(roc, 100);
  const im = roc.map((val, i) => (qrms[i] !== 0 ? val / qrms[i] : 0));

  const dc = new Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    const denom = roc[i] * im[i] - (im[i] - im[i - 1]) * re[i];
    let val = denom !== 0 ? 6.28 * (re[i] * re[i] + im[i] * im[i]) / denom : 0;
    val = Math.max(lb, Math.min(ub, val));
    dc[i] = val;
  }

  const mid = Math.sqrt(lb * ub);
  const hp2 = hpFilter(prices, mid);
  const bp = ultimateSmoother(hp2, mid);

  const so = new Array(n).fill(0);
  let ph = 0;

  for (let i = 1; i < n; i++) {
    ph += 2 * Math.PI / (dc[i] || mid);
    
    // Crossover/Crossunder logic for phase reset
    const crossedOver = bp[i-1] <= 0 && bp[i] > 0;
    const crossedUnder = bp[i-1] >= 0 && bp[i] < 0;

    if (crossedOver) ph = Math.PI / (dc[i] || mid);
    if (crossedUnder) ph = Math.PI + (Math.PI / (dc[i] || mid));

    let val = Math.sin(ph);

    // Remove reset glitch
    const prevVal = so[i - 1];
    const phMod = ph % (2 * Math.PI);
    
    if (phMod > 0 && phMod < Math.PI / 2 && val < prevVal) {
      val = prevVal;
    } else if (phMod > Math.PI && phMod < 3 * Math.PI / 2 && val > prevVal) {
      val = prevVal;
    }

    so[i] = val;
  }

  return so;
}
