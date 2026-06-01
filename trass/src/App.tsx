import React, { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  TrendingUp, TrendingDown, Wallet, History,
  LayoutDashboard, BarChart3, ArrowUpRight, ArrowDownRight,
  LogOut, User as UserIcon, DollarSign, Activity, ShieldAlert, Clock
} from 'lucide-react';
import { ASSET_ICONS } from './constants';
import { cn } from './utils/cn';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import CryptoPage from './components/CryptoPage';
import ForexPage from './components/ForexPage';
import StocksPage from './components/StocksPage';
import CommoditiesPage from './components/CommoditiesPage';
import AdminPanel from './components/AdminPanel';
import MiningPage from './components/MiningPage';
import DepositPage from './components/DepositPage';
import WithdrawalPage from './components/WithdrawalPage';
import InvestPlanPage from './components/InvestPlanPage';
import NewCoinPage from './components/NewCoinPage';
import LoanPage from './components/LoanPage';
import NFTPage from './components/NFTPage';
import GiftPage from './components/GiftPage';
import RecoveryPage from './components/RecoveryPage';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User } from './firebase';
import { AnimatePresence, motion } from 'motion/react';
import LandingPage from './components/LandingPage';
import { calculateSO } from './utils/indicators';
import CandleChart from './components/CandleChart';
import KYCPage from './components/KYCPage';
import BinaryTrade from './components/BinaryTrade';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const ADMIN_EMAIL = 'siam579214@gmail.com';

interface Asset {
  id: string;
  name: string;
  price: number;
  volatility: number;
  type: string;
  history: {
    time: number; price: number;
    open: number; high: number; low: number; close: number;
    volume: number; so?: number;
  }[];
}

function MainApp() {
  const [user, setUser] = useState<User | null>(null);
  const [mongoUser, setMongoUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [balance, setBalance] = useState(10000);
  const [trades, setTrades] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showCrypto, setShowCrypto] = useState(false);
  const [showForex, setShowForex] = useState(false);
  const [showStocks, setShowStocks] = useState(false);
  const [showCommodities, setShowCommodities] = useState(false);
  const [showMining, setShowMining] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [showInvestPlan, setShowInvestPlan] = useState(false);
  const [showNewCoin, setShowNewCoin] = useState(false);
  const [showLoan, setShowLoan] = useState(false);
  const [showNFT, setShowNFT] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trade' | 'wallet' | 'profile' | 'admin' | 'history'>('dashboard');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);
  const [tradeAmount, setTradeAmount] = useState(100);
  const [tradeLots, setTradeLots] = useState(0.01);
  const [tradeMultiplier, setTradeMultiplier] = useState(100);
  const [chartTimeframe, setChartTimeframe] = useState<'5s' | '1m' | '5m' | '15m' | '30m' | '1h' | '1d'>('5s');
  const [marketCategory, setMarketCategory] = useState<string | null>(null);
  const [tradeMode, setTradeMode] = useState<'live' | 'binary'>('live');
  const [slEnabled, setSlEnabled] = useState(false);
  const [tpEnabled, setTpEnabled] = useState(false);
  const [slValue, setSlValue] = useState(0);
  const [tpValue, setTpValue] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [kyc, setKyc] = useState<any>(null);
  const [kycLoaded, setKycLoaded] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUserData = useCallback(async (email: string) => {
    try {
      const [userRes, tradesRes, txRes, kycRes] = await Promise.all([
        fetch(`${API}/api/users/${email}`),
        fetch(`${API}/api/trades/${email}`),
        fetch(`${API}/api/transactions/${email}`),
        fetch(`${API}/api/kyc/${email}`),
      ]);
      const userData = await userRes.json();
      const tradesData = await tradesRes.json();
      const txData = await txRes.json();
      const kycData = await kycRes.json();
      setMongoUser(userData);
      setBalance(userData.balance ?? 10000);
      setTrades(Array.isArray(tradesData) ? tradesData : []);
      setTransactions(Array.isArray(txData) ? txData : []);
      setKyc(kycData);
      setKycLoaded(true);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  }, []);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        try {
          const res = await fetch(`${API}/api/users/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL
            })
          });
          const mu = await res.json();
          setMongoUser(mu);
          setBalance(mu.balance ?? 10000);
          if (currentUser.email) {
            await fetchUserData(currentUser.email);
          }
        } catch (err) {
          console.error('Error syncing with MongoDB:', err);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserData]);

  // Poll trades & transactions every 15s
  useEffect(() => {
    if (!user?.email || !isAuthReady) return;
    const interval = setInterval(() => fetchUserData(user.email!), 15000);
    return () => clearInterval(interval);
  }, [user, isAuthReady, fetchUserData]);

  // Socket & Market Data
  useEffect(() => {
    const newSocket = io(API);
    setSocket(newSocket);

    newSocket.on('initial_prices', (initialAssets: Asset[]) => {
      const now = Math.floor(Date.now() / 1000);
      const CANDLE_PERIOD = 5;
      const HISTORY_LENGTH = 500; // Load 500 historical candles
      
      const assetsWithHistory = initialAssets.map(a => {
        let currentPrice = a.price;
        
        // Generate realistic historical candles
        const history = Array.from({ length: HISTORY_LENGTH }, (_, i) => {
          const snapT = Math.floor((now - (HISTORY_LENGTH - i) * CANDLE_PERIOD) / CANDLE_PERIOD) * CANDLE_PERIOD;

          // Realistic price movement: ±0.03% per candle
          const priceChange = (Math.random() - 0.5) * 0.0006;
          const open = currentPrice;
          const close = Math.max(0.0001, open * (1 + priceChange));
          
          // Realistic wicks: 20-80% of body size
          const bodySize = Math.abs(close - open);
          const wickMultiplier = 0.2 + Math.random() * 0.6; // 20-80%
          
          // Ensure high >= max(open, close) and low <= min(open, close)
          const maxPrice = Math.max(open, close);
          const minPrice = Math.min(open, close);
          const high = maxPrice + (bodySize * wickMultiplier);
          const low = Math.max(0.0001, minPrice - (bodySize * wickMultiplier));

          const volBase = a.type === 'crypto' ? 1000 : 100;
          const volume = volBase * (0.5 + Math.random() * 3);

          currentPrice = close;
          return { time: snapT, price: close, open, high, low, close, volume };
        });

        const prices = history.map(h => h.close);
        const soValues = calculateSO(prices);
        const historyWithSO = history.map((h, i) => ({ ...h, so: soValues[i] }));
        return { ...a, history: historyWithSO };
      });
      
      setAssets(assetsWithHistory);
      setSelectedAsset(assetsWithHistory[0]);
    });

    newSocket.on('price_update', (updatedAssets: Asset[]) => {
      const now = Math.floor(Date.now() / 1000);
      const CANDLE_PERIOD = 5;
      const candleTime = Math.floor(now / CANDLE_PERIOD) * CANDLE_PERIOD;

      setAssets(prev => prev.map(p => {
        const updated = updatedAssets.find(u => u.id === p.id);
        if (!updated) return p;
        
        const lastCandle = p.history[p.history.length - 1];
        let newHistoryRaw: typeof p.history;

        if (lastCandle.time === candleTime) {
          // Update current candle - ensure high/low constraints
          const updatedCandle = {
            ...lastCandle,
            high: Math.max(lastCandle.high, updated.price, lastCandle.open, lastCandle.close),
            low: Math.min(lastCandle.low, updated.price, lastCandle.open, lastCandle.close),
            close: updated.price,
            price: updated.price,
          };
          newHistoryRaw = [...p.history.slice(0, -1), updatedCandle];
        } else {
          // Create new candle
          const open = lastCandle.close;
          const priceChange = (Math.random() - 0.5) * 0.0006;
          const close = Math.max(0.0001, open * (1 + priceChange));
          
          const bodySize = Math.abs(close - open);
          const wickMultiplier = 0.2 + Math.random() * 0.6;
          
          const maxPrice = Math.max(open, close);
          const minPrice = Math.min(open, close);
          const high = maxPrice + (bodySize * wickMultiplier);
          const low = Math.max(0.0001, minPrice - (bodySize * wickMultiplier));
          
          const volBase = updated.type === 'crypto' ? 1000 : 100;
          const volume = volBase * (0.5 + Math.random() * 3);
          
          const newCandle = { time: candleTime, price: close, open, high, low, close, volume };
          
          // Keep last 500 candles
          newHistoryRaw = [...p.history.slice(-499), newCandle];
        }

        const prices = newHistoryRaw.map(h => h.close);
        const soValues = calculateSO(prices);
        const historyWithSO = newHistoryRaw.map((h, i) => ({ ...h, so: soValues[i] }));
        return { ...updated, history: historyWithSO };
      }));
    });

    return () => { newSocket.close(); };
  }, []);

  // Keep selectedAsset in sync with live prices
  useEffect(() => {
    if (selectedAsset && assets.length > 0) {
      const current = assets.find(a => a.id === selectedAsset.id);
      if (current) {
        setSelectedAsset(current);
      }
    }
  }, [assets]);

  // ── Trade execution ──────────────────────────────────────────────────────────
  const handleTrade = async (type: 'buy' | 'sell', amount: number) => {
    if (!user?.email || !selectedAsset) return;
    if (amount <= 0) { showToast('Enter a valid amount', 'error'); return; }
    if (type === 'buy' && balance < amount) { showToast('Insufficient balance', 'error'); return; }

    try {
      const res = await fetch(`${API}/api/trades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          assetId: selectedAsset.id,
          assetName: selectedAsset.name,
          type,
          amount,
          entryPrice: selectedAsset.price
        })
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Trade failed', 'error'); return; }
      setBalance(data.balance);
      setTrades(prev => [data.trade, ...prev]);
      showToast(`${type === 'buy' ? 'Buy' : 'Sell'} order placed — $${amount.toLocaleString()} @ ${selectedAsset.price.toFixed(2)}`);
    } catch {
      showToast('Trade failed. Check connection.', 'error');
    }
  };

  const handleCloseTrade = async (tradeId: string) => {
    if (!user?.email || !selectedAsset) return;
    try {
      const res = await fetch(`${API}/api/trades/${tradeId}/close`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exitPrice: selectedAsset.price, email: user.email })
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed to close trade', 'error'); return; }
      setBalance(data.balance);
      setTrades(prev => prev.map(t => t._id === tradeId ? data.trade : t));
      const profit = data.trade.profit;
      showToast(`Trade closed — P&L: ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`, profit >= 0 ? 'success' : 'error');
    } catch {
      showToast('Failed to close trade.', 'error');
    }
  };

  // ── Wallet ───────────────────────────────────────────────────────────────────
  const handleWalletAction = async (type: 'deposit' | 'withdrawal') => {
    if (!user?.email || !walletAmount) return;
    const amountNum = parseFloat(walletAmount);
    if (isNaN(amountNum) || amountNum <= 0) { showToast('Enter a valid amount', 'error'); return; }
    if (type === 'withdrawal' && amountNum > balance) { showToast('Insufficient balance', 'error'); return; }

    setWalletLoading(true);
    try {
      const res = await fetch(`${API}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, type, amount: amountNum })
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Transaction failed', 'error'); return; }
      setBalance(data.balance);
      setTransactions(prev => [data.transaction, ...prev]);
      setWalletAmount('');
      showToast(`${type === 'deposit' ? 'Deposit' : 'Withdrawal'} of $${amountNum.toLocaleString()} successful`);
    } catch {
      showToast('Transaction failed. Check connection.', 'error');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleFeatureClick = (feature: string) => {
    switch (feature) {
      case 'deposit':
        setShowDeposit(true);
        break;
      case 'withdrawal':
        setShowWithdrawal(true);
        break;
      case 'mining':
        setShowMining(true);
        break;
      case 'invest':
        setShowInvestPlan(true);
        break;
      case 'newcoin':
        setShowNewCoin(true);
        break;
      case 'loan':
        setShowLoan(true);
        break;
      case 'nft':
        setShowNFT(true);
        break;
      case 'gift':
        setShowGift(true);
        break;
      case 'recovery':
        setShowRecovery(true);
        break;
      default:
        break;
    }
  };

  const logout = () => signOut(auth);

  // ── Loading / unauthenticated screens ────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <TrendingUp className="w-12 h-12 text-orange-500 animate-pulse" />
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/40">Initializing Engine...</p>
        </div>
      </div>
    );
  }

  if (!user && !showAuth && !showCrypto && !showForex && !showStocks && !showCommodities) {
    return (
      <LandingPage
        onGetStarted={() => setShowAuth(true)}
        onShowCrypto={() => setShowCrypto(true)}
        onShowForex={() => setShowForex(true)}
        onShowStocks={() => setShowStocks(true)}
        onShowCommodities={() => setShowCommodities(true)}
        assets={assets}
      />
    );
  }
  if (!user && showCrypto) return <CryptoPage onBack={() => setShowCrypto(false)} onStartTrading={() => { setShowCrypto(false); setShowAuth(true); }} />;
  if (!user && showForex) return <ForexPage onBack={() => setShowForex(false)} onStartTrading={() => { setShowForex(false); setShowAuth(true); }} />;
  if (!user && showStocks) return <StocksPage onBack={() => setShowStocks(false)} onStartTrading={() => { setShowStocks(false); setShowAuth(true); }} />;
  if (!user && showCommodities) return <CommoditiesPage onBack={() => setShowCommodities(false)} onStartTrading={() => { setShowCommodities(false); setShowAuth(true); }} />;
  if (!user && showAuth) return <AuthPage onBack={() => setShowAuth(false)} />;
  if (showDeposit) return <DepositPage onBack={() => setShowDeposit(false)} balance={balance} onDeposit={(amount) => { setWalletAmount(String(amount)); handleWalletAction('deposit'); }} />;
  if (showWithdrawal) return <WithdrawalPage onBack={() => setShowWithdrawal(false)} balance={balance} onWithdraw={(amount) => { setWalletAmount(String(amount)); handleWalletAction('withdrawal'); }} />;
  if (showMining) return <MiningPage onBack={() => setShowMining(false)} balance={balance} />;
  if (showInvestPlan) return <InvestPlanPage onBack={() => setShowInvestPlan(false)} balance={balance} />;
  if (showNewCoin) return <NewCoinPage onBack={() => setShowNewCoin(false)} balance={balance} />;
  if (showLoan) return <LoanPage onBack={() => setShowLoan(false)} balance={balance} />;
  if (showNFT) return <NFTPage onBack={() => setShowNFT(false)} balance={balance} />;
  if (showGift) return <GiftPage onBack={() => setShowGift(false)} balance={balance} />;
  if (showRecovery) return <RecoveryPage onBack={() => setShowRecovery(false)} balance={balance} />;

  const openTrades = trades.filter(t => t.status === 'open');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-orange-500/30 flex flex-col">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl text-sm font-bold shadow-xl border',
              toast.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            )}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-14 md:h-16 border-b border-white/10 flex items-center justify-between px-3 md:px-6 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 md:gap-8">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-[#f97316] to-[#facc15] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <TrendingUp className="text-black w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base md:text-xl tracking-tight uppercase">Rubicon</h1>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
            {/* Left tabs */}
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'wallet',    label: 'Wallet',    icon: Wallet },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={cn('flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all',
                  activeTab === tab.id ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white hover:bg-white/5')}>
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}

            {/* Center — Trade highlighted button with dropdown */}
            <div className="relative group mx-1">
              <button
                onClick={() => setActiveTab('trade')}
                className={cn(
                  'relative flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300',
                  activeTab === 'trade'
                    ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/40 scale-105'
                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/40 hover:bg-orange-500 hover:text-black hover:shadow-lg hover:shadow-orange-500/30 hover:scale-105'
                )}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Trade
                {activeTab !== 'trade' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(249,115,22,0.8)]" />
                )}
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 bg-[#151619] border border-white/10 rounded-2xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2 space-y-0.5">
                  {[
                    { id: 'crypto',   label: 'Crypto'   },
                    { id: 'stock',    label: 'Stocks'   },
                    { id: 'metals',   label: 'Metals'   },
                    { id: 'energy',   label: 'Energy'   },
                    { id: 'forex',    label: 'Forex'    },
                  ].map(cat => (
                    <button key={cat.id} onClick={() => { setMarketCategory(cat.id); setActiveTab('trade'); }}
                      className={cn('w-full flex items-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left',
                        marketCategory === cat.id && activeTab === 'trade' ? 'bg-orange-500/20 text-orange-400' : 'text-white/60 hover:bg-white/5 hover:text-white')}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right tabs */}
            {[
              { id: 'profile', label: 'Profile', icon: UserIcon },
              ...(mongoUser?.role === 'admin' || mongoUser?.role === 'owner' || user?.email === ADMIN_EMAIL ? [{ id: 'admin', label: 'Admin', icon: ShieldAlert }] : [])
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={cn('flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all',
                  activeTab === tab.id ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white hover:bg-white/5')}>
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 md:gap-4 pl-2 md:pl-4 border-l border-white/10">
          {user?.photoURL
            ? <img src={user.photoURL} alt="avatar" className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white/10" referrerPolicy="no-referrer" />
            : <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30"><UserIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" /></div>
          }
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold font-mono">{user?.displayName || user?.email?.split('@')[0]}</p>
            <p className="text-[10px] text-white/30 font-mono">${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
          <button onClick={logout} className="p-1.5 md:p-2 hover:bg-white/5 rounded-full transition-colors group">
            <LogOut className="w-4 h-4 text-white/40 group-hover:text-red-400" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4 max-w-[1600px] mx-auto w-full pb-20 md:pb-6">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-6 items-start">
          {/* Left Sidebar — Market Assets */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-[#151619] rounded-3xl border border-white/5 p-4 flex flex-col relative overflow-hidden lg:h-[calc(100vh-140px)]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="flex items-center justify-between mb-4 px-1 relative z-10">
                <div>
                  <h2 className="text-sm font-bold tracking-tight">Market Assets</h2>
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 mt-0.5">Live Prices</p>
                </div>
                <div className="w-8 h-8 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-orange-500" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
                {assets.filter(a => !marketCategory || a.type === marketCategory).map(asset => {
                  const isUp = (asset.history?.length ?? 0) > 1 && asset.history[asset.history.length - 1].price >= asset.history[asset.history.length - 2].price;
                  return (
                    <button
                      key={asset.id}
                      onClick={() => { setSelectedAsset(asset); setActiveTab('trade'); }}
                      className={cn(
                        'w-full px-3 py-3 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 group',
                        selectedAsset?.id === asset.id
                          ? 'bg-orange-500/10 border-orange-500/30 shadow-lg shadow-orange-500/5'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 shrink-0 bg-white/5 rounded-xl flex items-center justify-center p-1.5 border border-white/10">
                          {ASSET_ICONS[asset.id]
                            ? <img src={ASSET_ICONS[asset.id]} alt={asset.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            : <Activity className="w-4 h-4 text-orange-500" />}
                        </div>
                        <div className="text-left min-w-0">
                          <p className="font-bold text-xs text-white truncate group-hover:text-orange-400 transition-colors">{asset.name}</p>
                          <p className="text-[9px] font-mono text-white/30 uppercase">{asset.type}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className={cn('font-mono text-xs font-bold', isUp ? 'text-green-400' : 'text-red-400')}>
                          {asset.price.toLocaleString(undefined, { maximumFractionDigits: asset.type === 'forex' ? 4 : 2 })}
                        </span>
                        <span className={cn('flex items-center gap-0.5 text-[9px] font-mono font-bold', isUp ? 'text-green-500' : 'text-red-500')}>
                          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {isUp ? '+' : ''}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <Dashboard user={user} balance={balance} trades={trades} transactions={transactions} assets={assets} onFeatureClick={handleFeatureClick} />
                </motion.div>
              )}

              {activeTab === 'trade' && (
                <motion.div key="trade" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  {/* Chart + Execution Panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
                  {/* Chart col */}
                  <div className="lg:col-span-9 bg-[#151619] rounded-3xl border border-white/5 p-3 md:p-5 flex flex-col relative overflow-hidden h-[60vh] md:h-[calc(100vh-140px)]" style={{ minHeight: '400px' }}>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="flex items-center justify-between mb-3 md:mb-5 shrink-0 relative z-10">
                      <div className="flex items-center gap-2 md:gap-4">
                        <div className="w-9 h-9 md:w-12 md:h-12 bg-white/5 rounded-2xl flex items-center justify-center p-2 md:p-2.5 border border-white/10">
                          {selectedAsset && ASSET_ICONS[selectedAsset.id]
                            ? <img src={ASSET_ICONS[selectedAsset.id]} alt={selectedAsset.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            : <Activity className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />}
                        </div>
                        <div>
                          <h2 className="text-lg md:text-2xl font-bold tracking-tight">{selectedAsset?.name}</h2>
                          <div className="flex items-center gap-1.5 md:gap-2 mt-0.5">
                            <span className="hidden sm:inline px-2 py-0.5 bg-white/5 rounded-lg text-[10px] font-mono text-white/40 uppercase border border-white/5">{selectedAsset?.id}/USD</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                            <span className="text-[10px] text-green-500/80 font-mono uppercase tracking-widest">Live</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl md:text-3xl font-mono font-bold tracking-tighter text-white">
                          {selectedAsset?.price.toLocaleString(undefined, { maximumFractionDigits: selectedAsset?.type === 'forex' ? 4 : 2 })}
                        </p>
                        <p className="text-[10px] text-white/30 font-mono uppercase tracking-[0.2em] mt-0.5 hidden sm:block">Market Price</p>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="flex-1 min-h-0 flex flex-col w-full bg-[#0d0d0f] rounded-2xl border border-white/5 p-4 overflow-hidden relative z-10">
                      <div className="flex items-center justify-between mb-3 shrink-0">
                        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 hidden sm:block">Market Chart</h3>
                        <div className="flex overflow-x-auto bg-white/5 p-1 rounded-xl border border-white/5 gap-0.5 scrollbar-hide [&::-webkit-scrollbar]:hidden w-full sm:w-auto">
                          {(['5s', '1m', '5m', '15m', '30m', '1h', '1d'] as const).map(tf => (
                            <button
                              key={tf}
                              onClick={() => setChartTimeframe(tf)}
                              className={cn(
                                'shrink-0 px-2 md:px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all',
                                chartTimeframe === tf
                                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                                  : 'text-white/30 hover:text-white hover:bg-white/5'
                              )}
                            >
                              {tf}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 min-h-0 w-full">
                        {selectedAsset?.history && selectedAsset.history.length > 0 ? (
                          <React.Fragment key={selectedAsset.id}>
                            <CandleChart
                              data={selectedAsset.history}
                              assetId={selectedAsset.id}
                              timeframe={chartTimeframe}
                            />
                          </React.Fragment>
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-white/20 font-mono text-xs uppercase tracking-widest">
                            Loading Market Data...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar — Execution Panel */}
                  <div className="lg:col-span-3 flex flex-col overflow-hidden lg:h-[calc(100vh-140px)]">
                    <div className="bg-[#151619] rounded-3xl border border-white/5 p-4 flex flex-col h-full overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                      {selectedAsset && (
                        <div className="mb-3 pb-3 border-b border-white/5 shrink-0 relative z-10">
                          <p className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">{selectedAsset.name}</p>
                          <p className="text-2xl font-mono font-bold text-orange-400 tracking-tight leading-tight">{selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: selectedAsset.type === 'forex' ? 5 : 2 })}</p>
                        </div>
                      )}
                      {/* Trade Mode Toggle */}
                      <div className="grid grid-cols-2 gap-1.5 mb-3 shrink-0 relative z-10">
                        <button
                          onClick={() => setTradeMode('binary')}
                          className={cn(
                            'py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border',
                            tradeMode === 'binary'
                              ? 'bg-orange-500 text-black border-orange-500 shadow-lg shadow-orange-500/30'
                              : 'bg-white/[0.03] text-white/40 border-white/5 hover:text-white hover:bg-white/[0.07] hover:border-white/10'
                          )}
                        >
                          Binary Trade
                        </button>
                        <button
                          onClick={() => setTradeMode('live')}
                          className={cn(
                            'py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border',
                            tradeMode === 'live'
                              ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/30'
                              : 'bg-white/[0.03] text-white/40 border-white/5 hover:text-white hover:bg-white/[0.07] hover:border-white/10'
                          )}
                        >
                          Live Trade
                        </button>
                      </div>
                      <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
                        {tradeMode === 'binary' ? (
                          <BinaryTrade
                            user={user}
                            selectedAsset={selectedAsset}
                            balance={balance}
                            onBalanceUpdate={(b) => { if (b > 0) setBalance(b); else if (user?.email) fetchUserData(user.email); }}
                          />
                        ) : (<>
                        <div className="shrink-0">
                          <label className="text-[9px] text-white/30 uppercase font-mono mb-1.5 block tracking-[0.15em]">Multiplier</label>
                          <select value={tradeMultiplier} onChange={e => setTradeMultiplier(Number(e.target.value))} className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2.5 font-mono text-xs text-white/80 focus:outline-none focus:border-orange-500/40 appearance-none cursor-pointer transition-colors">
                            {[1, 10, 25, 50, 100, 200, 500].map(m => <option key={m} value={m} className="bg-[#151619]">{m}x</option>)}
                          </select>
                        </div>
                        <div className="shrink-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[9px] text-white/30 uppercase font-mono tracking-[0.15em]">Stop Loss</label>
                            <button onClick={() => setSlEnabled(v => !v)} className={cn('relative rounded-full transition-all duration-300 shrink-0', slEnabled ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'bg-white/10')} style={{ height: '18px', width: '32px' }}>
                              <span className={cn('absolute top-[2px] w-3.5 h-3.5 bg-white rounded-full shadow transition-all duration-300', slEnabled ? 'left-[16px]' : 'left-[2px]')} />
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setSlValue(v => Math.max(0, +(v - 1).toFixed(2)))} className="w-8 h-8 bg-white/[0.03] border border-white/8 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.07] transition-all flex items-center justify-center text-base shrink-0">-</button>
                            <input type="number" value={slValue} onChange={e => setSlValue(Number(e.target.value))} disabled={!slEnabled} className="flex-1 bg-white/[0.03] border border-white/8 rounded-xl px-2 py-1.5 font-mono text-xs text-center text-white/70 focus:outline-none focus:border-orange-500/40 disabled:opacity-25 transition-colors" />
                            <button onClick={() => setSlValue(v => +(v + 1).toFixed(2))} className="w-8 h-8 bg-white/[0.03] border border-white/8 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.07] transition-all flex items-center justify-center text-base shrink-0">+</button>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[9px] text-white/30 uppercase font-mono tracking-[0.15em]">Take Profit</label>
                            <button onClick={() => setTpEnabled(v => !v)} className={cn('relative rounded-full transition-all duration-300 shrink-0', tpEnabled ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'bg-white/10')} style={{ height: '18px', width: '32px' }}>
                              <span className={cn('absolute top-[2px] w-3.5 h-3.5 bg-white rounded-full shadow transition-all duration-300', tpEnabled ? 'left-[16px]' : 'left-[2px]')} />
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setTpValue(v => Math.max(0, +(v - 1).toFixed(2)))} className="w-8 h-8 bg-white/[0.03] border border-white/8 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.07] transition-all flex items-center justify-center text-base shrink-0">-</button>
                            <input type="number" value={tpValue} onChange={e => setTpValue(Number(e.target.value))} disabled={!tpEnabled} className="flex-1 bg-white/[0.03] border border-white/8 rounded-xl px-2 py-1.5 font-mono text-xs text-center text-white/70 focus:outline-none focus:border-orange-500/40 disabled:opacity-25 transition-colors" />
                            <button onClick={() => setTpValue(v => +(v + 1).toFixed(2))} className="w-8 h-8 bg-white/[0.03] border border-white/8 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.07] transition-all flex items-center justify-center text-base shrink-0">+</button>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <label className="text-[9px] text-white/30 uppercase font-mono tracking-[0.15em] block mb-1.5">Lots (Step 0.01)</label>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setTradeLots(v => Math.max(0.01, +(v - 0.01).toFixed(2)))} className="w-8 h-8 bg-white/[0.03] border border-white/8 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.07] transition-all flex items-center justify-center text-base shrink-0">-</button>
                            <input type="number" value={tradeLots} onChange={e => setTradeLots(Math.max(0.01, Number(e.target.value)))} min={0.01} step={0.01} className="flex-1 bg-white/[0.03] border border-white/8 rounded-xl px-2 py-1.5 font-mono text-xs text-center text-white/80 focus:outline-none focus:border-orange-500/40 transition-colors" />
                            <button onClick={() => setTradeLots(v => +(v + 0.01).toFixed(2))} className="w-8 h-8 bg-white/[0.03] border border-white/8 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.07] transition-all flex items-center justify-center text-base shrink-0">+</button>
                          </div>
                        </div>
                        {selectedAsset && (
                          <div className="rounded-2xl border border-white/8 overflow-hidden text-[9px] font-mono shrink-0 bg-white/[0.02]">
                            {[
                              { label: 'Each lot', value: `1 lot = ${tradeMultiplier} ${selectedAsset.name}`, cls: 'text-white/50' },
                              { label: 'Est. fee', value: (tradeLots * tradeMultiplier * selectedAsset.price * 0.0001).toFixed(4), cls: 'text-white/50' },
                              { label: 'Est. margin', value: `$${(tradeLots * tradeMultiplier * selectedAsset.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, cls: 'text-orange-400 font-bold' },
                            ].map((row, i) => (
                              <div key={i} className={cn('flex justify-between px-3 py-2 text-white/30', i < 2 ? 'border-b border-white/5' : '')}>
                                <span>{row.label}</span><span className={row.cls}>{row.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2 mt-auto shrink-0">
                          <button onClick={() => handleTrade('buy', tradeAmount)} className="py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30">Buy</button>
                          <button onClick={() => handleTrade('sell', tradeAmount)} className="py-3.5 bg-red-500 hover:bg-red-400 active:scale-95 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-red-500/20 hover:shadow-red-400/30">Sell</button>
                        </div>
                        <div className="px-3 py-2.5 bg-white/[0.02] rounded-2xl border border-white/8 shrink-0">
                          <div className="flex justify-between text-[9px] font-mono text-white/30 mb-1.5">
                            <span>Available Balance</span>
                            <span className="text-white/50 font-bold">${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="w-full bg-white/8 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full shadow-[0_0_6px_rgba(249,115,22,0.5)]" style={{ width: `${Math.min(100, (tradeAmount / balance) * 100)}%` }} />
                          </div>
                        </div>
                        </>)}
                      </div>
                    </div>
                  </div>
                  </div>

                  {/* Horizontal Scrollable Market Assets (Visible on Mobile & Desktop) */}
                  <div className="bg-[#151619] rounded-3xl border border-white/5 p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="flex items-center justify-between mb-4 px-1 relative z-10">
                      <div>
                        <h2 className="text-sm font-bold tracking-tight">Market Assets</h2>
                        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 mt-0.5">Live Prices</p>
                      </div>
                    </div>
                    <div className="flex overflow-x-auto space-x-3 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
                      {assets.filter(a => !marketCategory || a.type === marketCategory).map(asset => {
                        const isUp = (asset.history?.length ?? 0) > 1 && asset.history[asset.history.length - 1].price >= asset.history[asset.history.length - 2].price;
                        return (
                          <button
                            key={asset.id}
                            onClick={() => { setSelectedAsset(asset); setActiveTab('trade'); }}
                            className={cn(
                              'shrink-0 px-4 py-3 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 group',
                              selectedAsset?.id === asset.id
                                ? 'bg-orange-500/10 border-orange-500/30 shadow-lg shadow-orange-500/5'
                                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                            )}
                          >
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center p-2 border border-white/10">
                              {ASSET_ICONS[asset.id]
                                ? <img src={ASSET_ICONS[asset.id]} alt={asset.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                : <Activity className="w-5 h-5 text-orange-500" />}
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-xs text-white truncate group-hover:text-orange-400 transition-colors">{asset.name}</p>
                              <p className="text-[9px] font-mono text-white/30 uppercase">{asset.type}</p>
                            </div>
                            <span className={cn('font-mono text-xs font-bold', isUp ? 'text-green-400' : 'text-red-400')}>
                              {asset.price.toLocaleString(undefined, { maximumFractionDigits: asset.type === 'forex' ? 4 : 2 })}
                            </span>
                            <span className={cn('flex items-center gap-0.5 text-[9px] font-mono font-bold', isUp ? 'text-green-500' : 'text-red-500')}>
                              {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {isUp ? '+' : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Open Positions — full width below chart */}
                  <div className="bg-[#151619] rounded-3xl border border-white/5 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="flex items-center justify-between mb-5 relative z-10">
                      <div>
                        <h3 className="text-sm font-bold tracking-tight">Open Positions</h3>
                        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 mt-0.5">{openTrades.length} active positions</p>
                      </div>
                      <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center">
                        <Activity className="w-4 h-4 text-blue-400" />
                      </div>
                    </div>
                    <div className="space-y-2 max-h-[320px] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
                      {openTrades.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                          <BarChart3 className="w-8 h-8 text-white/10" />
                          <p className="text-[10px] font-mono uppercase tracking-widest text-white/20">No open positions</p>
                        </div>
                      ) : openTrades.map(trade => {
                        const currentAsset = assets.find(a => a.id === trade.assetId);
                        const currentPrice = currentAsset?.price ?? trade.entryPrice;
                        const lots = trade.lots ?? 1;
                        const multiplier = trade.multiplier ?? 1;
                        const pnl = trade.type === 'buy'
                          ? (currentPrice - trade.entryPrice) * lots * multiplier
                          : (trade.entryPrice - currentPrice) * lots * multiplier;
                        return (
                          <div key={trade._id} className="flex items-center justify-between p-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl border border-white/5 transition-all">
                            <div className="flex items-center gap-3">
                              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', trade.type === 'buy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}>
                                {trade.type === 'buy' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={cn('text-[8px] font-bold px-1.5 py-0.5 rounded uppercase', trade.type === 'buy' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500')}>{trade.type}</span>
                                  <span className="text-sm font-bold">{trade.assetName}</span>
                                </div>
                                <p className="text-[10px] text-white/40 font-mono mt-0.5">@ ${trade.entryPrice.toFixed(2)} · {lots}L × {multiplier}</p>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                              <span className={cn('text-sm font-mono font-bold', pnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                                {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                              </span>
                              <button
                                onClick={() => handleCloseTrade(trade._id)}
                                className="text-[9px] font-bold uppercase px-3 py-1 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors border border-white/5"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'wallet' && (
                <motion.div key="wallet" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 pb-12">

                  {/* Top Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {[
                      { label: 'Available Balance', value: `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Wallet, color: 'orange', sub: 'Simulation account' },
                      { label: 'Total Deposited', value: `$${transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0).toLocaleString()}`, icon: ArrowUpRight, color: 'green', sub: `${transactions.filter(t => t.type === 'deposit').length} deposits` },
                      { label: 'Total Withdrawn', value: `$${transactions.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0).toLocaleString()}`, icon: ArrowDownRight, color: 'red', sub: `${transactions.filter(t => t.type === 'withdrawal').length} withdrawals` },
                      { label: 'Transactions', value: transactions.length, icon: Activity, color: 'blue', sub: 'All time' },
                    ].map((stat, i) => (
                      <motion.div key={i} whileHover={{ y: -4 }}
                        className={cn('group relative overflow-hidden bg-[#151619] border border-white/5 p-6 rounded-3xl transition-all duration-500',
                          stat.color === 'orange' ? 'hover:border-orange-500/30' :
                          stat.color === 'green'  ? 'hover:border-green-500/30' :
                          stat.color === 'red'    ? 'hover:border-red-500/30' : 'hover:border-blue-500/30'
                        )}>
                        <div className={cn('absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 group-hover:opacity-40 transition-all duration-700',
                          stat.color === 'orange' ? 'bg-orange-500' : stat.color === 'green' ? 'bg-green-500' : stat.color === 'red' ? 'bg-red-500' : 'bg-blue-500'
                        )} />
                        <div className="flex items-center justify-between mb-5 relative z-10">
                          <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center',
                            stat.color === 'orange' ? 'bg-orange-500/10 text-orange-500' :
                            stat.color === 'green'  ? 'bg-green-500/10 text-green-500' :
                            stat.color === 'red'    ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-400'
                          )}>
                            <stat.icon className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="relative z-10">
                          <p className="text-white/20 text-[9px] font-mono uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                          <p className="text-2xl font-bold font-mono tracking-tighter">{stat.value}</p>
                          <p className="text-[10px] text-white/30 mt-1">{stat.sub}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Balance Card + Fund Panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 bg-[#151619] rounded-3xl border border-white/5 p-8 relative overflow-hidden flex flex-col justify-between min-h-[260px]">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/8 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                          <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/30">Live Balance</p>
                        </div>
                        <h2 className="text-5xl font-bold font-mono tracking-tighter text-white leading-none">
                          $<span className="text-orange-500">{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </h2>
                        <p className="text-xs text-white/20 mt-3 font-mono">{user?.email}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-6 relative z-10">
                        {[
                          { label: 'Deposits', value: `$${transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0).toLocaleString()}`, color: 'text-green-400' },
                          { label: 'Withdrawn', value: `$${transactions.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0).toLocaleString()}`, color: 'text-red-400' },
                          { label: 'Txns', value: transactions.length, color: 'text-blue-400' },
                        ].map((s, i) => (
                          <div key={i} className="p-3 bg-white/[0.03] rounded-2xl border border-white/8">
                            <p className="text-[9px] font-mono uppercase tracking-widest text-white/25 mb-1.5">{s.label}</p>
                            <p className={cn('text-sm font-bold font-mono', s.color)}>{s.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="lg:col-span-7 bg-[#151619] rounded-3xl border border-white/5 p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                      <div className="relative z-10 space-y-5">
                        <div>
                          <h3 className="text-base font-bold tracking-tight">Fund Account</h3>
                          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 mt-0.5">Deposit or withdraw funds</p>
                        </div>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-mono text-xl font-bold">$</span>
                          <input type="number" value={walletAmount} onChange={e => setWalletAmount(e.target.value)} placeholder="0.00"
                            className="w-full bg-white/[0.03] border border-white/8 rounded-2xl pl-9 pr-4 py-4 font-mono text-2xl focus:outline-none focus:border-orange-500/40 transition-colors placeholder:text-white/10" />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[500, 1000, 5000, 10000].map(amt => (
                            <button key={amt} onClick={() => setWalletAmount(String(amt))}
                              className={cn('py-2.5 rounded-2xl text-xs font-bold font-mono border transition-all duration-300',
                                walletAmount === String(amt)
                                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 shadow-lg shadow-orange-500/10'
                                  : 'bg-white/[0.03] border-white/8 text-white/40 hover:bg-white/[0.07] hover:text-white hover:border-white/15'
                              )}>
                              +${amt >= 1000 ? `${amt/1000}k` : amt}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => handleWalletAction('deposit')} disabled={walletLoading}
                            className="py-4 bg-green-500/10 border border-green-500/20 hover:bg-green-500 hover:text-black hover:border-green-500 rounded-2xl text-sm font-bold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group shadow-lg shadow-green-500/5 hover:shadow-green-500/20">
                            <ArrowUpRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            {walletLoading ? 'Processing...' : 'Deposit'}
                          </button>
                          <button onClick={() => handleWalletAction('withdrawal')} disabled={walletLoading}
                            className="py-4 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-black hover:border-red-500 rounded-2xl text-sm font-bold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group shadow-lg shadow-red-500/5 hover:shadow-red-500/20">
                            <ArrowDownRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            {walletLoading ? 'Processing...' : 'Withdraw'}
                          </button>
                        </div>
                        <div className="flex items-center justify-between px-1">
                          <p className="text-[10px] text-white/20 font-mono">Withdrawable balance</p>
                          <p className="text-[10px] text-white/50 font-mono font-bold">${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction History */}
                  <div className="bg-[#151619] rounded-3xl border border-white/5 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                      <div>
                        <h3 className="text-xl font-bold tracking-tight">Transaction History</h3>
                        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 mt-1">{transactions.length} total records</p>
                      </div>
                      <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 gap-0.5">
                        {['All', 'Deposits', 'Withdrawals'].map(f => (
                          <button key={f} className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white hover:bg-white/5 transition-all">{f}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 relative z-10">
                      {transactions.length === 0 ? (
                        <div className="flex flex-col items-center py-20 text-center space-y-4">
                          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                            <Wallet className="w-8 h-8 text-white/10" />
                          </div>
                          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/20">No transactions yet</p>
                        </div>
                      ) : transactions.map((tx, i) => (
                        <motion.div key={i} whileHover={{ x: 4 }}
                          className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 group">
                          <div className="flex items-center gap-4">
                            <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg',
                              tx.type === 'deposit' ? 'bg-green-500/10 text-green-500 shadow-green-500/5' : 'bg-red-500/10 text-red-500 shadow-red-500/5'
                            )}>
                              {tx.type === 'deposit' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold capitalize group-hover:text-orange-400 transition-colors">{tx.type}</p>
                                <span className={cn('text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md',
                                  tx.status === 'completed' ? 'bg-green-500/15 text-green-500' : 'bg-yellow-500/15 text-yellow-500'
                                )}>{tx.status || 'completed'}</span>
                              </div>
                              <p className="text-[10px] text-white/25 font-mono mt-0.5">{new Date(tx.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                          <p className={cn('font-mono font-bold text-xl tracking-tight', tx.type === 'deposit' ? 'text-green-400' : 'text-red-400')}>
                            {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 pb-12">
                  {/* Header */}
                  <div className="bg-[#151619] rounded-3xl border border-white/5 p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight">Trade History</h2>
                        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 mt-1">{trades.length} total trades</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-500" />
                      </div>
                    </div>
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 mt-6 relative z-10">
                      {[
                        { label: 'Total', value: trades.length, color: 'text-white' },
                        { label: 'Won', value: trades.filter(t => t.status === 'closed' && (t.profit ?? 0) > 0).length, color: 'text-green-400' },
                        { label: 'Lost', value: trades.filter(t => t.status === 'closed' && (t.profit ?? 0) <= 0).length, color: 'text-red-400' },
                      ].map((s, i) => (
                        <div key={i} className="p-3 bg-white/[0.03] rounded-2xl border border-white/8 text-center">
                          <p className="text-[9px] font-mono uppercase tracking-widest text-white/25 mb-1">{s.label}</p>
                          <p className={cn('text-xl font-bold font-mono', s.color)}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trade list */}
                  <div className="bg-[#151619] rounded-3xl border border-white/5 p-4 md:p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="flex items-center justify-between mb-5 relative z-10">
                      <h3 className="text-sm font-bold tracking-tight">All Trades</h3>
                      <div className="flex gap-1.5">
                        {['All', 'Open', 'Closed'].map(f => (
                          <button key={f} className="px-3 py-1 bg-white/5 border border-white/8 rounded-xl text-[10px] font-bold text-white/40 hover:text-white hover:bg-white/10 transition-all">{f}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 relative z-10">
                      {trades.length === 0 ? (
                        <div className="flex flex-col items-center py-20 text-center space-y-4">
                          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                            <Clock className="w-8 h-8 text-white/10" />
                          </div>
                          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/20">No trade history yet</p>
                        </div>
                      ) : trades.map((trade, i) => {
                        const pnl = trade.profit ?? 0;
                        const isOpen = trade.status === 'open';
                        const currentAsset = assets.find(a => a.id === trade.assetId);
                        const currentPrice = currentAsset?.price ?? trade.entryPrice;
                        const livePnl = isOpen
                          ? (trade.type === 'buy'
                              ? (currentPrice - trade.entryPrice) * (trade.lots ?? 1) * (trade.multiplier ?? 1)
                              : (trade.entryPrice - currentPrice) * (trade.lots ?? 1) * (trade.multiplier ?? 1))
                          : pnl;
                        return (
                          <motion.div key={i} whileHover={{ x: 3 }}
                            className="flex items-center justify-between p-3 md:p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 group">
                            <div className="flex items-center gap-3">
                              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                                trade.type === 'buy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}>
                                {trade.type === 'buy' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-bold group-hover:text-orange-400 transition-colors">{trade.assetName}</p>
                                  <span className={cn('text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md',
                                    trade.type === 'buy' ? 'bg-green-500/15 text-green-500' : 'bg-red-500/15 text-red-500')}>{trade.type}</span>
                                  <span className={cn('text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md',
                                    isOpen ? 'bg-blue-500/15 text-blue-400' : 'bg-white/10 text-white/40')}>{isOpen ? 'Open' : 'Closed'}</span>
                                </div>
                                <p className="text-[10px] text-white/25 font-mono mt-0.5">
                                  @ ${trade.entryPrice?.toFixed(2)} · {trade.lots ?? 1}L × {trade.multiplier ?? 1}x
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={cn('font-mono font-bold text-base tracking-tight',
                                livePnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                                {livePnl >= 0 ? '+' : ''}${livePnl.toFixed(2)}
                              </p>
                              <p className="text-[9px] text-white/20 font-mono mt-0.5">
                                {trade.timestamp ? new Date(trade.timestamp).toLocaleDateString() : '—'}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 pb-12">

                  {/* Profile Hero Card */}
                  <div className="bg-[#151619] rounded-3xl border border-white/5 relative overflow-hidden">
                    {/* Background glows */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.18),transparent_65%)] pointer-events-none" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-orange-500/10 blur-[40px] rounded-full pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center text-center px-5 pt-8 pb-6">
                      {/* Avatar */}
                      <div className="relative mb-4">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-black/40">
                          {user?.photoURL
                            ? <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            : <div className="w-full h-full bg-gradient-to-br from-orange-500/40 to-orange-900/40 flex items-center justify-center">
                                <UserIcon className="w-9 h-9 text-orange-400" />
                              </div>
                          }
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#151619] shadow-lg shadow-green-500/40 flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                        </div>
                      </div>

                      {/* Name & email */}
                      <h2 className="text-2xl font-bold tracking-tight text-white">{user?.displayName || 'Trader'}</h2>
                      <p className="text-white/35 text-xs font-mono mt-1 tracking-wider">{user?.email}</p>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                        <span className="px-3 py-1 bg-orange-500/15 text-orange-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-orange-500/25">
                          {user?.email === ADMIN_EMAIL ? 'Admin' : 'Trader'}
                        </span>
                        <span className="px-3 py-1 bg-green-500/15 text-green-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-green-500/25 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                          Active
                        </span>
                        {kyc?.status === 'approved' && (
                          <span className="px-3 py-1 bg-blue-500/15 text-blue-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-blue-500/25">✓ KYC Verified</span>
                        )}
                        {kyc?.status === 'pending' && (
                          <span className="px-3 py-1 bg-yellow-500/15 text-yellow-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-yellow-500/25">⏳ KYC Pending</span>
                        )}
                        {(!kyc || kyc?.status === 'rejected') && (
                          <span className="px-3 py-1 bg-red-500/15 text-red-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-red-500/25">⚠ Unverified</span>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-5" />

                      {/* Balance */}
                      <div className="w-full bg-white/[0.03] border border-white/8 rounded-2xl px-5 py-4">
                        <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/30 mb-1">Available Balance</p>
                        <p className="text-3xl font-bold font-mono text-orange-400 tracking-tight">
                          ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <div className="flex items-center justify-center gap-1.5 mt-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-[9px] font-mono text-green-500/70 uppercase tracking-widest">Simulation Account</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Total Trades', value: trades.length, color: 'blue', icon: BarChart3 },
                      { label: 'Open', value: trades.filter(t => t.status === 'open').length, color: 'orange', icon: Activity },
                      { label: 'Closed', value: trades.filter(t => t.status === 'closed').length, color: 'green', icon: ArrowDownRight },
                      { label: 'Total P&L', value: `$${trades.filter(t => t.status === 'closed').reduce((s, t) => s + (t.profit ?? 0), 0).toFixed(2)}`, color: trades.filter(t => t.status === 'closed').reduce((s, t) => s + (t.profit ?? 0), 0) >= 0 ? 'green' : 'red', icon: TrendingUp },
                    ].map((stat, i) => (
                      <div key={i} className="bg-[#151619] rounded-2xl border border-white/5 p-4 relative overflow-hidden hover:border-white/10 transition-all">
                        <div className={cn('absolute top-0 right-0 w-16 h-16 blur-[30px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-20',
                          stat.color === 'orange' ? 'bg-orange-500' : stat.color === 'blue' ? 'bg-blue-500' : stat.color === 'green' ? 'bg-green-500' : 'bg-red-500'
                        )} />
                        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center mb-3',
                          stat.color === 'orange' ? 'bg-orange-500/10 text-orange-400' : stat.color === 'blue' ? 'bg-blue-500/10 text-blue-400' : stat.color === 'green' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        )}>
                          <stat.icon className="w-4 h-4" />
                        </div>
                        <p className="text-white/25 text-[9px] font-mono uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className={cn('text-xl font-bold font-mono tracking-tight',
                          stat.color === 'orange' ? 'text-orange-400' : stat.color === 'blue' ? 'text-blue-400' : stat.color === 'green' ? 'text-green-400' : 'text-red-400'
                        )}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* KYC Section */}
                  <KYCPage user={user} kyc={kyc} onSubmit={(data) => { setKyc(data); }} />

                  {/* Account Info */}
                  <div className="bg-[#151619] rounded-3xl border border-white/5 p-4 md:p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <h3 className="text-sm font-bold tracking-tight">Account Info</h3>
                      <div className="w-7 h-7 bg-white/5 rounded-xl flex items-center justify-center">
                        <UserIcon className="w-3.5 h-3.5 text-white/40" />
                      </div>
                    </div>
                    <div className="space-y-2 relative z-10">
                      {[
                        { label: 'Email', value: user?.email || '�' },
                        { label: 'Name', value: user?.displayName || '�' },
                        { label: 'Account Type', value: user?.email === ADMIN_EMAIL ? 'Administrator' : 'Standard Trader' },
                        { label: 'Member Since', value: mongoUser?.createdAt ? new Date(mongoUser.createdAt).toLocaleDateString() : '�' },
                        { label: 'Deposits', value: `$${transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0).toLocaleString()}` },
                        { label: 'Withdrawals', value: `$${transactions.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0).toLocaleString()}` },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/5 transition-all">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-white/30 shrink-0">{item.label}</span>
                          <span className="text-xs font-mono text-white/70 text-right truncate ml-4 max-w-[55%]">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Trades */}
                  <div className="bg-[#151619] rounded-3xl border border-white/5 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold tracking-tight">Recent Trades</h3>
                      <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest">{trades.length} total</span>
                    </div>
                    <div className="space-y-2 max-h-[320px] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden">
                      {trades.length === 0 ? (
                        <div className="flex flex-col items-center py-12 text-center space-y-3 opacity-20">
                          <BarChart3 className="w-8 h-8" />
                          <p className="text-[10px] font-mono uppercase tracking-widest">No trades yet</p>
                        </div>
                      ) : trades.slice(0, 10).map((trade, i) => {
                        const pnl = trade.profit ?? 0;
                        return (
                          <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/5 transition-all">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                                trade.type === 'buy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}>
                                {trade.type === 'buy' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="text-xs font-bold truncate">{trade.assetName}</p>
                                  <span className={cn('text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase shrink-0',
                                    trade.status === 'open' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/40')}>{trade.status}</span>
                                </div>
                                <p className="text-[9px] text-white/25 font-mono mt-0.5">@ ${trade.entryPrice?.toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              {trade.status === 'closed' && (
                                <p className={cn('text-sm font-mono font-bold', pnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                                  {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                                </p>
                              )}
                              <p className="text-[9px] text-white/20 font-mono">{new Date(trade.timestamp).toLocaleDateString()}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {(activeTab === 'admin' && (mongoUser?.role === 'admin' || mongoUser?.role === 'owner' || user?.email === ADMIN_EMAIL)) && (
                <motion.div key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <AdminPanel user={user} mongoUser={mongoUser} onUserUpdate={() => { if (user?.email) fetchUserData(user.email); }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 flex items-end justify-around px-2 pb-3 pt-2">
        {/* Dashboard */}
        <button onClick={() => setActiveTab('dashboard')}
          className={cn('flex flex-col items-center gap-1 px-2 py-1.5 rounded-2xl transition-all duration-200 min-w-[44px]',
            activeTab === 'dashboard' ? 'text-orange-400' : 'text-white/30')}>
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
        </button>

        {/* Wallet */}
        <button onClick={() => setActiveTab('wallet')}
          className={cn('flex flex-col items-center gap-1 px-2 py-1.5 rounded-2xl transition-all duration-200 min-w-[44px]',
            activeTab === 'wallet' ? 'text-orange-400' : 'text-white/30')}>
          <Wallet className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Wallet</span>
        </button>

        {/* Trade — center highlighted */}
        <button onClick={() => setActiveTab('trade')}
          className="relative flex flex-col items-center gap-1 -mt-5">
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300',
            activeTab === 'trade'
              ? 'bg-orange-500 shadow-orange-500/50 scale-110'
              : 'bg-orange-500 shadow-orange-500/30 hover:scale-105'
          )}>
            <BarChart3 className="w-6 h-6 text-black" />
            {activeTab !== 'trade' && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0a0a0a] animate-pulse" />
            )}
          </div>
          <span className={cn('text-[9px] font-bold uppercase tracking-widest mt-0.5',
            activeTab === 'trade' ? 'text-orange-400' : 'text-white/50')}>Trade</span>
        </button>

        {/* Profile */}
        <button onClick={() => setActiveTab('profile')}
          className={cn('flex flex-col items-center gap-1 px-2 py-1.5 rounded-2xl transition-all duration-200 min-w-[44px]',
            activeTab === 'profile' ? 'text-orange-400' : 'text-white/30')}>
          <UserIcon className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Profile</span>
        </button>

        {/* History */}
        <button onClick={() => setActiveTab('history')}
          className={cn('flex flex-col items-center gap-1 px-2 py-1.5 rounded-2xl transition-all duration-200 min-w-[44px]',
            activeTab === 'history' ? 'text-orange-400' : 'text-white/30')}>
          <Clock className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">History</span>
        </button>

        {/* Admin (conditional) */}
        {(mongoUser?.role === 'admin' || mongoUser?.role === 'owner' || user?.email === ADMIN_EMAIL) && (
          <button onClick={() => setActiveTab('admin')}
            className={cn('flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-200 min-w-[52px]',
              activeTab === 'admin' ? 'text-orange-400' : 'text-white/30')}>
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Admin</span>
          </button>
        )}
      </nav>
    </div>
  );
}

export default function App() {
  return <MainApp />;
}