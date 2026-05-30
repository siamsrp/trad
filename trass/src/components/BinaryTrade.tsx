import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrendingUp, TrendingDown, Clock, Zap, CheckCircle, XCircle, DollarSign } from 'lucide-react';
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
  const [duration, setDuration] = useState<30 | 60>(30);
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [results, setResults] = useState<TradeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<any>(null);

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
      onBalanceUpdate(0); // trigger refetch
    });
    return () => { s.close(); };
  }, [user?.email]);

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

      const commission = duration === 30 ? 0.25 : 0.30;
      setActiveTrades(prev => [...prev, {
        assetId: selectedAsset.id,
        assetName: selectedAsset.name,
        direction,
        amount,
        duration,
        entryPrice: data.entryPrice,
        commission,
        startTime: Date.now(),
        timeLeft: duration,
      }]);
      onBalanceUpdate(data.balance);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const commission = duration === 30 ? 25 : 30;
  const potentialProfit = (amount * (commission / 100)).toFixed(2);

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
          {([30, 60] as const).map(d => (
            <button key={d} onClick={() => setDuration(d)}
              className={cn('py-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-0.5',
                duration === d ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'bg-[#0d0d0f] border-white/8 text-white/50 hover:border-white/20')}>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{d}s</span>
              <span className="text-[9px] opacity-70">+{d === 30 ? 25 : 30}% profit</span>
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

      {/* Active trades */}
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
    </div>
  );
}
