const CRYPTO_BASE = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color';
const FLAGS = 'https://flagcdn.com/48x36';
const FAVICON = 'https://www.google.com/s2/favicons?sz=128&domain';

// Colored circle SVG icons for metals & energy
const metalIcon = (color: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><radialGradient id="g" cx="35%" cy="35%"><stop offset="0%" stop-color="${color}dd"/><stop offset="100%" stop-color="${color}66"/></radialGradient></defs><circle cx="32" cy="32" r="30" fill="url(#g)" stroke="${color}88" stroke-width="2"/><text x="32" y="40" font-size="22" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial">${letter}</text></svg>`)}`;

export const ASSET_ICONS: Record<string, string> = {
  // ── Crypto ──────────────────────────────────────────────────────────────────
  btc:   `${CRYPTO_BASE}/btc.png`,
  eth:   `${CRYPTO_BASE}/eth.png`,
  sol:   `${CRYPTO_BASE}/sol.png`,
  xrp:   `${CRYPTO_BASE}/xrp.png`,
  bnb:   `${CRYPTO_BASE}/bnb.png`,
  ada:   `${CRYPTO_BASE}/ada.png`,
  dot:   `${CRYPTO_BASE}/dot.png`,
  link:  `${CRYPTO_BASE}/link.png`,
  ltc:   `${CRYPTO_BASE}/ltc.png`,
  doge:  `${CRYPTO_BASE}/doge.png`,
  usdc:  `${CRYPTO_BASE}/usdc.png`,
  shib:  'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
  pepe:  'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg',
  avax:  'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
  matic: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
  trump: 'https://assets.coingecko.com/coins/images/35018/large/TRUMP.jpg',

  // ── Stocks ──────────────────────────────────────────────────────────────────
  aapl:  'https://s3-symbol-logo.tradingview.com/apple--big.svg',
  tsla:  'https://s3-symbol-logo.tradingview.com/tesla--big.svg',
  googl: 'https://s3-symbol-logo.tradingview.com/alphabet--big.svg',
  amzn:  'https://s3-symbol-logo.tradingview.com/amazon--big.svg',
  nvda:  'https://s3-symbol-logo.tradingview.com/nvidia--big.svg',
  msft:  'https://s3-symbol-logo.tradingview.com/microsoft--big.svg',
  meta:  'https://s3-symbol-logo.tradingview.com/meta-platforms--big.svg',
  nflx:  'https://s3-symbol-logo.tradingview.com/netflix--big.svg',
  baba:  'https://s3-symbol-logo.tradingview.com/alibaba--big.svg',
  bac:   'https://s3-symbol-logo.tradingview.com/bank-of-america--big.svg',
  ma:    'https://s3-symbol-logo.tradingview.com/mastercard--big.svg',

  // ── Metals ───────────────────────────────────────────────────────────────────
  gold:      'https://s3-symbol-logo.tradingview.com/metal/gold--big.svg',
  silver:    'https://s3-symbol-logo.tradingview.com/metal/silver--big.svg',
  copper:    'https://s3-symbol-logo.tradingview.com/metal/copper--big.svg',
  platinum:  'https://s3-symbol-logo.tradingview.com/metal/platinum--big.svg',
  palladium: 'https://s3-symbol-logo.tradingview.com/metal/palladium--big.svg',

  // ── Energy ───────────────────────────────────────────────────────────────────
  oil:    'https://s3-symbol-logo.tradingview.com/crude-oil--big.svg',
  natgas: 'https://s3-symbol-logo.tradingview.com/natural-gas--big.svg',
  brent:  'https://s3-symbol-logo.tradingview.com/crude-oil--big.svg',

  // ── Forex ────────────────────────────────────────────────────────────────────
  eurusd: 'https://s3-symbol-logo.tradingview.com/country/EU--big.svg',
  gbpusd: 'https://s3-symbol-logo.tradingview.com/country/GB--big.svg',
  usdjpy: 'https://s3-symbol-logo.tradingview.com/country/JP--big.svg',
  audusd: 'https://s3-symbol-logo.tradingview.com/country/AU--big.svg',
  usdcad: 'https://s3-symbol-logo.tradingview.com/country/CA--big.svg',
  usdchf: 'https://s3-symbol-logo.tradingview.com/country/CH--big.svg',
  nzdusd: 'https://s3-symbol-logo.tradingview.com/country/NZ--big.svg',
  eurjpy: 'https://s3-symbol-logo.tradingview.com/country/EU--big.svg',
  gbpjpy: 'https://s3-symbol-logo.tradingview.com/country/GB--big.svg',
  eurgbp: 'https://s3-symbol-logo.tradingview.com/country/EU--big.svg',
};
