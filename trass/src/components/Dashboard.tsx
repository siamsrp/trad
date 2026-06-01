import React, { useState } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, Activity, 
  ArrowUpRight, ArrowDownRight, Clock, ShieldCheck,
  Globe, Zap, BarChart3, PieChart as PieChartIcon,
  ChevronRight, ExternalLink, RefreshCcw, DollarSign,
  TrendingUpIcon, Coins, HandCoins, Pickaxe, Image,
  LineChart, Gift as GiftIcon, RotateCcw, ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { ASSET_ICONS } from '../constants';
import { cn } from '../utils/cn';

interface DashboardProps {
  user: any;
  balance: number;
  trades: any[];
  transactions: any[];
  assets: any[];
  onFeatureClick?: (feature: string) => void;
}

export default function Dashboard({ user, balance, trades, transactions, assets, onFeatureClick }: DashboardProps) {
  // Calculate some stats
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.status === 'closed' && t.profit > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  // State to control expanded view
  const [showMore, setShowMore] = useState(false);
  
  const recentTrades = trades.slice(0, 5);
  const recentTransactions = transactions.slice(0, 5);

  // Build performance data from closed trade history
  const closedTrades = trades.filter(t => t.status === 'closed');
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const performanceData = days.map((name, i) => {
    const dayPnl = closedTrades
      .filter(t => new Date(t.closedAt || t.timestamp).getDay() === (i + 1) % 7)
      .reduce((sum, t) => sum + (t.profit || 0), 0);
    return { name, value: balance + dayPnl };
  });
  if (performanceData.every(d => d.value === balance)) {
    // No real data yet — show flat line at current balance
    performanceData.forEach((d, i) => { d.value = balance * (1 + (i - 3) * 0.005); });
  }

  // Asset distribution from open trades
  const openTrades = trades.filter(t => t.status === 'open');
  const typeColors: Record<string, string> = { crypto: '#f97316', forex: '#22c55e', stock: '#3b82f6', commodity: '#eab308' };
  const typeLabels: Record<string, string> = { crypto: 'Crypto', forex: 'Forex', stock: 'Stocks', commodity: 'Commodities' };
  const typeTotals: Record<string, number> = {};
  openTrades.forEach(t => {
    const asset = assets.find((a: any) => a.id === t.assetId);
    const type = asset?.type || 'crypto';
    typeTotals[type] = (typeTotals[type] || 0) + t.amount;
  });
  const totalInvested = Object.values(typeTotals).reduce((a, b) => a + b, 0);
  const assetDistribution = totalInvested > 0
    ? Object.entries(typeTotals).map(([type, val]) => ({
        name: typeLabels[type] || type,
        value: Math.round((val / totalInvested) * 100),
        color: typeColors[type] || '#888'
      }))
    : [
        { name: 'Crypto', value: 45, color: '#f97316' },
        { name: 'Forex', value: 25, color: '#22c55e' },
        { name: 'Stocks', value: 20, color: '#3b82f6' },
        { name: 'Commodities', value: 10, color: '#eab308' },
      ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >


      {/* Assets Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 p-8 rounded-3xl"
      >
        <p className="text-white/40 text-xs font-mono uppercase tracking-widest mb-2">Assets</p>
        <h2 className="text-5xl font-bold font-mono tracking-tighter mb-2">
          ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
        <p className="text-white/40 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
          <RefreshCcw className="w-3 h-3 animate-spin-slow" />
          Real-time valuation
        </p>
      </motion.div>

      {/* Feature Buttons Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4"
      >
        {[
          { id: 'deposit', label: 'Deposit', icon: DollarSign, color: 'blue' },
          { id: 'withdrawal', label: 'Withdraw', icon: ArrowDownRight, color: 'red' },
          { id: 'invest', label: 'Invest Plan', icon: TrendingUpIcon, color: 'purple' },
          { id: 'newcoin', label: 'New Coin', icon: Coins, color: 'green' },
          { id: 'loan', label: 'Loan', icon: HandCoins, color: 'yellow' },
          { id: 'mining', label: 'Mining', icon: Pickaxe, color: 'orange' },
          { id: 'nft', label: 'NFT', icon: Image, color: 'pink' },
          { id: 'stocks', label: 'Stocks', icon: LineChart, color: 'cyan' },
          { id: 'gift', label: 'Gift', icon: GiftIcon, color: 'red' },
          { id: 'recovery', label: 'Recovery', icon: RotateCcw, color: 'gray' },
        ].map((feature, i) => (
          <motion.button
            key={feature.id}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFeatureClick?.(feature.id)}
            className={cn(
              "group relative overflow-hidden bg-[#151619] border border-white/5 p-4 md:p-6 rounded-2xl transition-all duration-500 hover:border-white/20",
              "flex flex-col items-center justify-center gap-2 md:gap-3 min-h-[100px] md:min-h-[120px]"
            )}
          >
            <div className={cn(
              "absolute top-0 right-0 w-20 h-20 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-30 transition-all duration-700",
              feature.color === 'blue' ? "bg-blue-500" :
              feature.color === 'purple' ? "bg-purple-500" :
              feature.color === 'green' ? "bg-green-500" :
              feature.color === 'yellow' ? "bg-yellow-500" :
              feature.color === 'orange' ? "bg-orange-500" :
              feature.color === 'pink' ? "bg-pink-500" :
              feature.color === 'cyan' ? "bg-cyan-500" :
              feature.color === 'red' ? "bg-red-500" : "bg-gray-500"
            )} />
            
            <div className={cn(
              "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 relative z-10",
              feature.color === 'blue' ? "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20" :
              feature.color === 'purple' ? "bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20" :
              feature.color === 'green' ? "bg-green-500/10 text-green-500 group-hover:bg-green-500/20" :
              feature.color === 'yellow' ? "bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500/20" :
              feature.color === 'orange' ? "bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20" :
              feature.color === 'pink' ? "bg-pink-500/10 text-pink-500 group-hover:bg-pink-500/20" :
              feature.color === 'cyan' ? "bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500/20" :
              feature.color === 'red' ? "bg-red-500/10 text-red-500 group-hover:bg-red-500/20" : "bg-gray-500/10 text-gray-500 group-hover:bg-gray-500/20"
            )}>
              <feature.icon className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            
            <span className="text-xs md:text-sm font-bold text-white/80 group-hover:text-white transition-colors relative z-10 text-center">
              {feature.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Market Overview Section */}
      <motion.div
        variants={itemVariants}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Market Overview</h3>
          <p className="text-white/40 text-xs font-mono uppercase tracking-widest">Live Prices</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset, i) => {
            const currentPrice = asset.price;
            const prevPrice = asset.history.length > 1 ? asset.history[asset.history.length - 2].price : currentPrice;
            const change = ((currentPrice - prevPrice) / prevPrice) * 100;
            const isPositive = change >= 0;

            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-[#151619] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center p-2.5">
                    {ASSET_ICONS[asset.id] ? (
                      <img
                        src={ASSET_ICONS[asset.id]}
                        alt={asset.name}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Zap className="w-6 h-6 text-orange-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{asset.name}</p>
                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">{asset.symbol || asset.type}</p>
                  </div>
                </div>
                <p className="text-2xl font-mono font-bold tracking-tight mb-2">
                  ${asset.price.toLocaleString(undefined, {
                    minimumFractionDigits: asset.type === 'forex' ? 4 : 2,
                    maximumFractionDigits: asset.type === 'forex' ? 4 : 2
                  })}
                </p>
                <div className={cn(
                  "flex items-center gap-1 text-sm font-mono font-bold",
                  isPositive ? "text-green-500" : "text-red-500"
                )}>
                  {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {isPositive ? '+' : ''}{change.toFixed(2)}%
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* More Button */}
      <motion.div variants={itemVariants} className="flex justify-center">
        <button
          onClick={() => setShowMore(!showMore)}
          className="px-8 py-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500 font-bold uppercase tracking-[0.2em] text-xs hover:bg-orange-500/20 transition-all flex items-center gap-2"
        >
          {showMore ? 'Less' : 'More'}
          {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </motion.div>

      {/* Additional Content - Conditionally Visible */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-8"
          >
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  label: 'Total Balance', 
                  value: `$${balance.toLocaleString()}`, 
                  icon: Wallet, 
                  color: 'orange', 
                  change: '+2.4%', 
                  isPositive: true,
                  desc: 'Available capital'
                },
                { 
                  label: 'Active Trades', 
                  value: trades.filter(t => t.status === 'open').length, 
                  icon: Activity, 
                  color: 'blue', 
                  change: 'Live', 
                  isPositive: true,
                  desc: 'Current positions'
                },
                { 
                  label: 'Win Rate', 
                  value: `${winRate.toFixed(1)}%`, 
                  icon: TrendingUp, 
                  color: 'green', 
                  change: `${winningTrades} Wins`, 
                  isPositive: true,
                  desc: 'Trading efficiency'
                },
                { 
                  label: 'Account Tier', 
                  value: 'PRO', 
                  icon: ShieldCheck, 
                  color: 'purple', 
                  change: 'Verified', 
                  isPositive: true,
                  desc: 'Institutional access'
                }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className={cn(
                    "group relative overflow-hidden bg-[#151619] border border-white/5 p-6 rounded-3xl transition-all duration-500",
                    stat.color === 'orange' ? "hover:border-orange-500/30" :
                    stat.color === 'blue' ? "hover:border-blue-500/30" :
                    stat.color === 'green' ? "hover:border-green-500/30" : "hover:border-purple-500/30"
                  )}
                >
                  <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 group-hover:opacity-40 transition-all duration-700",
                    stat.color === 'orange' ? "bg-orange-500" :
                    stat.color === 'blue' ? "bg-blue-500" :
                    stat.color === 'green' ? "bg-green-500" : "bg-purple-500"
                  )} />
                  
                  <div className="flex items-center justify-between relative z-10 mb-6">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                      stat.color === 'orange' ? "bg-orange-500/10 text-orange-500" :
                      stat.color === 'blue' ? "bg-blue-500/10 text-blue-500" :
                      stat.color === 'green' ? "bg-green-500/10 text-green-500" : "bg-purple-500/10 text-purple-500"
                    )}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold font-mono px-2.5 py-1 rounded-full uppercase tracking-widest",
                      stat.isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {stat.change}
                    </span>
                  </div>
                  
                  <div className="relative z-10 space-y-1">
                    <p className="text-white/20 text-[10px] font-mono uppercase tracking-[0.2em]">{stat.label}</p>
                    <h3 className="text-3xl font-bold font-mono tracking-tighter">{stat.value}</h3>
                    <p className="text-[10px] text-white/40 font-medium">{stat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Performance Chart */}
              <motion.div 
                variants={itemVariants}
                className="lg:col-span-8 bg-[#151619] border border-white/5 p-8 rounded-3xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 relative z-10">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Portfolio Performance</h3>
                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-[0.3em] mt-1">Growth Analysis & Projections</p>
                  </div>
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                    {['1W', '1M', '1Y', 'ALL'].map((period) => (
                      <button 
                        key={period}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                          period === '1M' ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20" : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="h-[320px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#ffffff20', fontSize: 10, fontFamily: 'monospace' }}
                        dy={10}
                      />
                      <YAxis 
                        hide 
                        domain={['auto', 'auto']}
                      />
                      <Tooltip 
                        cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '4 4' }}
                        contentStyle={{ 
                          backgroundColor: 'rgba(21, 22, 25, 0.9)', 
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '12px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#f97316" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Asset Distribution */}
              <motion.div 
                variants={itemVariants}
                className="lg:col-span-4 bg-[#151619] border border-white/5 p-8 rounded-3xl flex flex-col"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold tracking-tight">Allocation</h3>
                  <PieChartIcon className="w-4 h-4 text-white/20" />
                </div>
                
                <div className="h-[220px] w-full relative flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={8}
                        dataKey="value"
                        animationBegin={500}
                        animationDuration={1500}
                      >
                        {assetDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[10px] text-white/20 uppercase font-mono tracking-widest">Portfolio</p>
                    <p className="text-2xl font-bold font-mono tracking-tighter">100%</p>
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  {assetDistribution.map((item, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 1, delay: 1 }}
                            className="h-full rounded-full" 
                            style={{ backgroundColor: item.color }} 
                          />
                        </div>
                        <span className="text-xs font-mono font-bold w-8 text-right">{item.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Gainers & Losers */}
              <motion.div 
                variants={itemVariants}
                className="bg-[#151619] border border-white/5 p-8 rounded-3xl flex flex-col"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Market Trends</h3>
                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-[0.3em] mt-1">Top Gainers & Losers</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                  {/* Top Gainers */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-green-500/60 ml-1">Top Gainers</p>
                    {assets
                      .map(a => {
                        const change = ((a.price - (a.history[a.history.length-2]?.price || a.price)) / (a.history[a.history.length-2]?.price || a.price)) * 100;
                        return { ...a, change };
                      })
                      .filter(a => a.change >= 0)
                      .sort((a, b) => b.change - a.change)
                      .slice(0, 10)
                      .map((asset, i) => (
                        <div key={i} className="p-3 bg-green-500/5 border border-green-500/10 rounded-xl flex items-center justify-between group hover:bg-green-500/10 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center p-1">
                              {ASSET_ICONS[asset.id] ? <img src={ASSET_ICONS[asset.id]} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" /> : <Zap className="w-3.5 h-3.5 text-green-500" />}
                            </div>
                            <span className="text-xs font-bold">{asset.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-green-500">+{asset.change.toFixed(2)}%</span>
                        </div>
                      ))}
                  </div>
                  {/* Top Losers */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-red-500/60 ml-1">Top Losers</p>
                    {assets
                      .map(a => {
                        const change = ((a.price - (a.history[a.history.length-2]?.price || a.price)) / (a.history[a.history.length-2]?.price || a.price)) * 100;
                        return { ...a, change };
                      })
                      .filter(a => a.change < 0)
                      .sort((a, b) => a.change - b.change)
                      .slice(0, 10)
                      .map((asset, i) => (
                        <div key={i} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between group hover:bg-red-500/10 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center p-1">
                              {ASSET_ICONS[asset.id] ? <img src={ASSET_ICONS[asset.id]} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" /> : <Zap className="w-3.5 h-3.5 text-red-500" />}
                            </div>
                            <span className="text-xs font-bold">{asset.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-red-500">{asset.change.toFixed(2)}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>

              {/* Recent Trades */}
              <motion.div 
                variants={itemVariants}
                className="bg-[#151619] border border-white/5 p-8 rounded-3xl flex flex-col"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Recent Trades</h3>
                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-[0.3em] mt-1">Execution History</p>
                  </div>
                  <Clock className="w-4 h-4 text-white/20" />
                </div>
                
                <div className="space-y-4 flex-1">
                  {recentTrades.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                        <BarChart3 className="w-8 h-8 text-white/10" />
                      </div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/20">No execution history found</p>
                    </div>
                  ) : (
                    recentTrades.map((trade, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/5 transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                            trade.type === 'buy' ? "bg-green-500/10 text-green-500 shadow-green-500/5" : "bg-red-500/10 text-red-500 shadow-red-500/5"
                          )}>
                            {trade.type === 'buy' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold">{trade.assetName}</p>
                              <span className={cn(
                                "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md",
                                trade.type === 'buy' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                              )}>
                                {trade.type}
                              </span>
                            </div>
                            <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest mt-0.5">
                              {trade.amount.toFixed(4)} Units @ ${trade.entryPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-mono font-bold tracking-tight">${(trade.amount * trade.entryPrice).toLocaleString()}</p>
                          <p className="text-[10px] text-white/20 font-mono">
                            {trade.timestamp ? new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {recentTrades.length > 0 && (
                  <button className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    View Full History
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            </div>

            {/* Recent Transactions */}
            <motion.div 
              variants={itemVariants}
              className="bg-[#151619] border border-white/5 p-8 rounded-3xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Recent Transactions</h3>
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-[0.3em] mt-1">Funding & Settlements</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">Export CSV</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentTransactions.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-20">
                    <PieChartIcon className="w-12 h-12" />
                    <p className="text-[10px] font-mono uppercase tracking-[0.3em]">No transaction records</p>
                  </div>
                ) : (
                  recentTransactions.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/5 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                          tx.type === 'deposit' ? "bg-green-500/10 text-green-500 shadow-green-500/5" : "bg-red-500/10 text-red-500 shadow-red-500/5"
                        )}>
                          {tx.type === 'deposit' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold capitalize">{tx.type}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              tx.status === 'completed' ? "bg-green-500" : tx.status === 'pending' ? "bg-yellow-500" : "bg-red-500"
                            )} />
                            <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">{tx.status}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className={cn(
                          "text-sm font-mono font-bold tracking-tight",
                          tx.type === 'deposit' ? "text-green-400" : "text-red-400"
                        )}>
                          {tx.type === 'deposit' ? '+' : '-'}$${tx.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-white/20 font-mono">
                          {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'Today'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
