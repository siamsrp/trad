import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Clock, Zap, CheckCircle, XCircle, DollarSign, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface BinaryTradeProps {
  user: any;
  selectedAsset: any;
  balance: number;
  onBalanceUpdate: (b: number) => void;
}

interface TradeResult {
  assetId: string;
  assetName: string;
  direction: 'up' | 'down';
  amount: number;
  duration: number;
  entryPrice: number;
  exitPrice: number;
  won: boolean;
  profit: number;
  payout: number;
  commission: number;
}

interface ActiveTrade {
  assetId: string;
  assetName: string;
  direction: 'up' | 'down';
  amount: number;
  duration: number;
  entryPrice: number;
  commission: number;
  startTime: number;
  timeLeft: number;
}

export default function BinaryTrade({ user, selectedAsset, balance, onBalanceUpdate }: BinaryTradeProps) {
  const [amount, setAmount] = useState(10);
  const [duration, setDuration] = useState<number>(30);
  const [options, setOptions] = useState<any[]>([]);
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [results, setResults] = useState<TradeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolvedResult, setResolvedResult] = useState<TradeResult | null>(null);
  const socketRef = useRef<any>(null);

  // Fetch binary options
  useEffect(() => {
    fetch(`${API}/api/binary/options`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setOptions(data);
          setDuration(data[0].duration);
        }
      })
      .catch(err => console.error('Error fetching binary options:', err));
  }, []);

  // Socket for binary results
  useEffect(() => {
    if (!user?.email) return;
    const s = io(API);
    socketRef.current = s;
    s.on(`binary_result_${user.email}`, (result: TradeResult) => {
      setResults(prev => [result, ...prev].slice(0, 20));
      setActiveTrades(prev => prev.filter(t =>
        !(t.assetId === result.assetId && t.direction === result.direction && t.amount === result.amount)
      ));
      setResolvedResult(result);
      onBalanceUpdate(0); // trigger refetch
    });
    return () => { s.close(); };
  }, [user?.email, onBalanceUpdate]);

  // Cleanup resolved result popup
  useEffect(() => {
    if (resolvedResult) {
      const t = setTimeout(() => setResolvedResult(null), 5000);
      return () => clearTimeout(t);
    }
  }, [resolvedResult]);

  // Countdown timer
  useEffect(() => {
    if (activeTrades.length === 0) return;
    const interval = setInterval(() => {
      setActiveTrades(prev => prev.map(t => ({
        ...t,
        timeLeft: Math.max(0, t.duration - Math.floor((Date.now() - t.startTime) / 1000))
      })));
    }, 200);
    return () => clearInterval(interval);
  }, [activeTrades.length]);

  const placeTrade = async (direction: 'up' | 'down') => {
    if (!user?.email || !selectedAsset || amount <= 0 || balance < amount) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/binary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          assetId: selectedAsset.id,
          assetName: selectedAsset.name,
          direction,
          amount,
          duration,
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }

      const selectedOpt = options.find(o => o.duration === duration) || { commission: duration === 30 ? 25 : 30 };
      const commPercentage = selectedOpt.commission / 100;

      setActiveTrades(prev => [...prev, {
        assetId: selectedAsset.id,
        assetName: selectedAsset.name,
        direction,
        amount,
        duration,
        entryPrice: data.entryPrice,
        commission: commPercentage,
        startTime: Date.now(),
        timeLeft: duration,
      }]);
      onBalanceUpdate(data.balance);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const selectedOpt = options.find(o => o.duration === duration) || { commission: duration === 30 ? 25 : 30 };
  const commission = selectedOpt.commission;
  const potentialProfit = (amount * (commission / 100)).toFixed(2);

  // Big overlay for current trade
  const currentTrade = activeTrades[0];
  const livePrice = selectedAsset?.id === currentTrade?.assetId ? selectedAsset.price : currentTrade?.entryPrice;
  const isWinning = currentTrade ? (
    currentTrade.direction === 'up' ? livePrice > currentTrade.entryPrice : livePrice < currentTrade.entryPrice
  ) : false;
  const progressPercent = currentTrade ? (currentTrade.timeLeft / currentTrade.duration) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Mode header */}
      <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
        <Zap className="w-4 h-4 text-orange-500 shrink-0" />
        <div>
          <p className="text-xs font-bold text-orange-400">Binary Trade</p>
          <p className="text-[9px] text-white/40 font-mono">Predict direction within time limit</p>
        </div>
      </div>

      {/* Duration selector */}
      <div>
        <label className="text-[8px] text-white/30 uppercase font-mono tracking-widest block mb-1.5">Duration</label>
        <div className="grid grid-cols-2 gap-2">
          {options.map(opt => (
            <button key={opt.duration} onClick={() => setDuration(opt.duration)}
              className={cn('py-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-0.5',
                duration === opt.duration ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'bg-[#0d0d0f] border-white/8 text-white/50 hover:border-white/20')}>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{opt.label}</span>
              <span className="text-[9px] opacity-70">+{opt.commission}% profit</span>
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="text-[8px] text-white/30 uppercase font-mono tracking-widest block mb-1.5">Amount ($)</label>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setAmount(v => Math.max(1, v - 10))} className="w-8 h-8 bg-[#0d0d0f] border border-white/8 rounded-lg text-white/50 hover:text-white transition-all flex items-center justify-center shrink-0">−</button>
          <input type="number" value={amount} onChange={e => setAmount(Math.max(1, Number(e.target.value)))} min={1}
            className="flex-1 bg-[#0d0d0f] border border-white/8 rounded-lg px-2 py-1.5 font-mono text-sm text-center text-white/80 focus:outline-none" />
          <button onClick={() => setAmount(v => v + 10)} className="w-8 h-8 bg-[#0d0d0f] border border-white/8 rounded-lg text-white/50 hover:text-white transition-all flex items-center justify-center shrink-0">+</button>
        </div>
        {/* Quick amounts */}
        <div className="grid grid-cols-4 gap-1 mt-1.5">
          {[10, 25, 50, 100].map(a => (
            <button key={a} onClick={() => setAmount(a)}
              className={cn('py-1 rounded-lg text-[9px] font-mono font-bold transition-all',
                amount === a ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-white/30 hover:bg-white/10')}>
              ${a}
            </button>
          ))}
        </div>
      </div>

      {/* Profit preview */}
      <div className="p-2.5 bg-[#0d0d0f] rounded-xl border border-white/8 text-[9px] font-mono space-y-1">
        <div className="flex justify-between text-white/40"><span>Investment</span><span>${amount}</span></div>
        <div className="flex justify-between text-white/40"><span>Commission</span><span className="text-orange-400">+{commission}%</span></div>
        <div className="flex justify-between font-bold"><span className="text-white/60">If Win</span><span className="text-green-400">+${potentialProfit}</span></div>
        <div className="flex justify-between"><span className="text-white/40">If Loss</span><span className="text-red-400">-${amount}</span></div>
      </div>

      {/* UP / DOWN buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => placeTrade('up')} disabled={loading || balance < amount}
          className="py-4 bg-green-600 hover:bg-green-500 active:scale-95 disabled:opacity-40 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2">
          <TrendingUp className="w-4 h-4" /> UP
        </button>
        <button onClick={() => placeTrade('down')} disabled={loading || balance < amount}
          className="py-4 bg-red-600 hover:bg-red-500 active:scale-95 disabled:opacity-40 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2">
          <TrendingDown className="w-4 h-4" /> DOWN
        </button>
      </div>

      {/* Active trades side list */}
      {activeTrades.length > 0 && (
        <div className="space-y-2">
          <p className="text-[8px] font-mono uppercase tracking-widest text-white/30">Active ({activeTrades.length})</p>
          {activeTrades.map((t, i) => {
            const pct = (t.timeLeft / t.duration) * 100;
            return (
              <div key={i} className="p-3 bg-[#0d0d0f] rounded-xl border border-white/8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded uppercase', t.direction === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
                      {t.direction === 'up' ? '↑' : '↓'} {t.direction.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold">{t.assetName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-orange-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs font-mono font-bold">{t.timeLeft}s</span>
                  </div>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-white/40 mb-1.5">
                  <span>Entry: ${t.entryPrice.toFixed(2)}</span>
                  <span>${t.amount} → +${(t.amount * t.commission).toFixed(2)}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all duration-200', t.direction === 'up' ? 'bg-green-500' : 'bg-red-500')}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[8px] font-mono uppercase tracking-widest text-white/30">Recent Results</p>
          {results.slice(0, 5).map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              className={cn('flex items-center justify-between p-2.5 rounded-xl border text-[10px]',
                r.won ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20')}>
              <div className="flex items-center gap-2">
                {r.won ? <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                <div>
                  <span className="font-bold">{r.assetName}</span>
                  <span className="text-white/30 ml-1">{r.direction === 'up' ? '↑' : '↓'} {r.duration}s</span>
                </div>
              </div>
              <span className={cn('font-mono font-bold', r.won ? 'text-green-400' : 'text-red-400')}>
                {r.won ? '+' : '-'}${Math.abs(r.profit).toFixed(2)}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── LIVE BINARY TRADE OVERLAY MODAL ── */}
      <AnimatePresence>
        {currentTrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#151619]/90 border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl relative text-center overflow-hidden"
            >
              {/* Background ambient glowing */}
              <div className={cn(
                "absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 blur-[80px] rounded-full opacity-20 pointer-events-none transition-all duration-500",
                isWinning ? "bg-green-500" : "bg-red-500"
              )} />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6" /> {/* Placeholder for alignment */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">Active Binary Trade</p>
                    <h3 className="text-xl font-bold mt-1 text-white">{currentTrade.assetName}</h3>
                  </div>
                  <button onClick={() => setActiveTrades(prev => prev.filter((_, idx) => idx !== 0))} className="p-1 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Big Countdown Timer */}
                <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke={isWinning ? "#22c55e" : "#ef4444"}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 54}
                      strokeDashoffset={2 * Math.PI * 54 * (1 - progressPercent / 100)}
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold font-mono text-white">{currentTrade.timeLeft}</span>
                    <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider">seconds</span>
                  </div>
                </div>

                {/* Price Display comparison */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-mono uppercase text-white/30 tracking-wider">Entry Price</p>
                    <p className="text-base font-bold font-mono text-white/70 mt-0.5">${currentTrade.entryPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase text-white/30 tracking-wider">Current Price</p>
                    <p className={cn("text-base font-bold font-mono mt-0.5 animate-pulse", isWinning ? "text-green-400" : "text-red-400")}>
                      ${livePrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Live indicators */}
                <div className="flex items-center justify-center gap-2">
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold font-mono tracking-widest uppercase flex items-center gap-2 border",
                    isWinning 
                      ? "bg-green-500/10 border-green-500/20 text-green-400 animate-bounce" 
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  )}>
                    <span className={cn("w-2 h-2 rounded-full", isWinning ? "bg-green-400 animate-ping" : "bg-red-400")} />
                    {isWinning ? 'Winning' : 'Losing'}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-white/30 pt-2 border-t border-white/5">
                  <span>Investment: ${currentTrade.amount}</span>
                  <span>Payout: +{(currentTrade.commission * 100).toFixed(0)}%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── VICTORY / DEFEAT RESULT SPLASH SCREEN ── */}
      <AnimatePresence>
        {resolvedResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, rotate: 3 }}
              className={cn(
                "border rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center relative overflow-hidden",
                resolvedResult.won ? "bg-[#0b1f13] border-green-500/30" : "bg-[#1f0b0b] border-red-500/30"
              )}
            >
              {/* Confetti particles / ambient glow */}
              <div className={cn(
                "absolute -inset-10 blur-[100px] rounded-full opacity-35 pointer-events-none animate-pulse",
                resolvedResult.won ? "bg-green-500" : "bg-red-500"
              )} />

              <div className="relative z-10 space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-700 bg-white/5">
                  {resolvedResult.won ? (
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  ) : (
                    <XCircle className="w-10 h-10 text-red-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <h2 className={cn(
                    "text-4xl font-extrabold uppercase tracking-tighter font-mono",
                    resolvedResult.won ? "text-green-400 drop-shadow-[0_0_12px_rgba(74,222,128,0.4)]" : "text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.4)]"
                  )}>
                    {resolvedResult.won ? 'Victory!' : 'Defeat'}
                  </h2>
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
                    {resolvedResult.assetName} · {resolvedResult.duration}s Trade
                  </p>
                </div>

                <div className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-2 text-left">
                  <div className="flex justify-between text-xs font-mono text-white/50">
                    <span>Investment</span>
                    <span>${resolvedResult.amount}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-white/50">
                    <span>Entry Price</span>
                    <span>${resolvedResult.entryPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-white/50">
                    <span>Exit Price</span>
                    <span>${resolvedResult.exitPrice.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-px bg-white/5 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-white/50">Return</span>
                    <span className={cn(
                      "text-xl font-bold font-mono",
                      resolvedResult.won ? "text-green-400" : "text-red-400"
                    )}>
                      {resolvedResult.won ? `+$${resolvedResult.profit.toFixed(2)}` : `-$${resolvedResult.amount}`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setResolvedResult(null)}
                  className={cn(
                    "w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg",
                    resolvedResult.won 
                      ? "bg-green-500 hover:bg-green-400 text-black shadow-green-500/20" 
                      : "bg-red-500 hover:bg-red-400 text-white shadow-red-500/20"
                  )}
                >
                  Continue Trading
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
