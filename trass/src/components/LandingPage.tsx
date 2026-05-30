import React from 'react';
import { 
  Activity, ArrowRight, BarChart4, Cpu, Globe, 
  ShieldCheck, Smartphone, Zap, TrendingUp, 
  ChevronRight, PlayCircle, Star, ArrowUpRight, ArrowDownRight,
  Bitcoin, Coins, Layers, Lock, MousePointer2
} from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Footer from './Footer';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ASSET_ICONS } from '../constants';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { Coin3D, StockCard3D } from './ThreeDAssets';

interface Asset {
  id: string;
  name: string;
  price: number;
  volatility: number;
  type: string;
  history: { time: string; price: number }[];
}

interface LandingPageProps {
  onGetStarted: () => void;
  onShowCrypto: () => void;
  onShowForex: () => void;
  onShowStocks: () => void;
  onShowCommodities: () => void;
  assets: Asset[];
}

export default function LandingPage({ 
  onGetStarted, 
  onShowCrypto, 
  onShowForex,
  onShowStocks,
  onShowCommodities,
  assets 
}: LandingPageProps) {
  const [scrolled, setScrolled] = React.useState(false);
  
  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-orange-500 selection:text-black overflow-x-hidden flex flex-col">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 w-full z-100 transition-all duration-500 px-6 py-6 flex items-center justify-between",
        scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent"
      )}>
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-2xl shadow-orange-500/20 group-hover:rotate-12 transition-transform duration-500">
              <Activity className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tighter uppercase italic">TradeX <span className="text-orange-500">Pro</span></h1>
              <p className="text-[8px] uppercase tracking-[0.4em] text-white/40 font-black">Simulation Engine</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Crypto', onClick: onShowCrypto },
              { label: 'Forex', onClick: onShowForex },
              { label: 'Stocks', onClick: onShowStocks },
              { label: 'Commodities', onClick: onShowCommodities }
            ].map((link) => (
              <button 
                key={link.label}
                onClick={link.onClick}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-orange-500 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={onGetStarted}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={onGetStarted}
            className="px-6 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-orange-500 hover:text-white transition-all duration-300"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#f9731615,transparent_70%)]" />
        
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-[10px] font-bold uppercase tracking-widest">
                <Zap className="w-3 h-3" />
                Next-Gen Trading Engine
              </div>
              
              <h1 className="text-7xl md:text-[120px] font-bold tracking-tighter leading-[0.8] uppercase">
                TRADING <br />
                <span className="text-orange-500">IS HERE.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/40 max-w-xl leading-relaxed font-medium">
                Master the global markets with our high-frequency simulation engine. Zero risk, infinite potential, absolute precision.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <button 
                  onClick={onGetStarted}
                  className="w-full sm:w-auto px-10 py-4 bg-orange-500 text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-all duration-300 shadow-xl shadow-orange-500/20 group"
                >
                  Start Trading Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full sm:w-auto px-10 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all duration-300">
                  <PlayCircle className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/5">
                {[
                  { label: 'Latency', value: '0.4ms' },
                  { label: 'Liquidity', value: 'Infinite' },
                  { label: 'Uptime', value: '99.99%' },
                  { label: 'Support', value: '24/7' },
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-2xl font-bold font-mono tracking-tighter text-white">{stat.value}</p>
                    <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-mono">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="hidden lg:flex justify-center items-center relative"
            >
              <div className="absolute inset-0 bg-orange-500/20 blur-[120px] rounded-full animate-pulse" />
              <StockCard3D 
                symbol="AMZN" 
                price="178.22" 
                size="w-[450px] h-[550px]" 
                color="#f97316" 
                onStartTrading={onGetStarted}
              />
              
              {/* Floating Elements */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="text-green-500 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Market Sentiment</p>
                    <p className="text-xl font-black text-green-500">BULLISH</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -left-10 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Zap className="text-orange-500 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Execution Speed</p>
                    <p className="text-xl font-black text-white">0.001s</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Market Terminal Section */}
      <section className="py-32 px-6 bg-[#080808] border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-8">
              <h2 className="text-xs font-black uppercase tracking-[0.5em] text-orange-500">Market Pulse</h2>
              <h3 className="text-5xl font-black tracking-tighter uppercase">Global <br /> <span className="text-white/20">Terminal.</span></h3>
              <p className="text-white/40 leading-relaxed italic serif">
                "Direct connection to global liquidity providers. Every trade, every quote, delivered with zero-compromise speed."
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest mb-2">Active Traders</p>
                  <p className="text-2xl font-black">124.5K</p>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest mb-2">24h Volume</p>
                  <p className="text-2xl font-black text-orange-500">$8.2B</p>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-8">
              <div className="bg-black rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">TradeX_Terminal_v4.0.1</div>
                </div>
                <div className="p-8 font-mono text-xs space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
                  {[
                    { time: "14:29:01", type: "INFO", msg: "Initializing global market feed..." },
                    { time: "14:29:02", type: "SUCCESS", msg: "Connection established. Latency: 0.24ms" },
                    { time: "14:29:05", type: "TRADE", msg: "BTC/USD: Large buy order detected at $64,210.50 (14.2 BTC)" },
                    { time: "14:29:08", type: "INFO", msg: "Updating order book for EUR/USD..." },
                    { time: "14:29:12", type: "ALERT", msg: "Volatility spike detected in NVDA. Liquidity adjusting." },
                    { time: "14:29:15", type: "TRADE", msg: "GOLD: Sell order filled at $2,150.10 (500oz)" },
                    { time: "14:29:20", type: "INFO", msg: "Syncing global liquidity pools..." },
                    { time: "14:29:25", type: "SUCCESS", msg: "Portfolio rebalanced. Current exposure: 42% Crypto, 28% Forex" },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-4 group">
                      <span className="text-white/20">[{log.time}]</span>
                      <span className={cn(
                        "font-bold",
                        log.type === "SUCCESS" ? "text-green-500" :
                        log.type === "ALERT" ? "text-red-500" :
                        log.type === "TRADE" ? "text-orange-500" : "text-blue-400"
                      )}>{log.type}</span>
                      <span className="text-white/60 group-hover:text-white transition-colors">{log.msg}</span>
                    </div>
                  ))}
                  <div className="flex gap-4 animate-pulse">
                    <span className="text-white/20">[14:29:39]</span>
                    <span className="text-white/40">_</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Analysis Section */}
      <section className="py-32 px-6 bg-[#050505] relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-4 space-y-8">
              <h2 className="text-xs font-black uppercase tracking-[0.5em] text-orange-500">Market Intelligence</h2>
              <h3 className="text-5xl font-black tracking-tighter uppercase">Advanced <br /> <span className="text-white/20">Analytics.</span></h3>
              <p className="text-white/40 leading-relaxed italic serif">
                "Our predictive algorithms analyze historical patterns and real-time sentiment to provide institutional-grade signals."
              </p>
              
              <div className="space-y-4">
                {[
                  { label: "Predictive Accuracy", value: "94.2%" },
                  { label: "Data Points / Sec", value: "12.5M" },
                  { label: "Signal Latency", value: "< 10ms" }
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{stat.label}</span>
                    <span className="text-sm font-bold font-mono text-orange-500">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="h-[550px] w-full bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="flex items-center justify-between mb-12 relative z-20">
                  <div className="space-y-1">
                    <div className="flex items-center gap-4">
                      <h4 className="text-3xl font-black uppercase tracking-tighter italic">Market <span className="text-orange-500">Momentum</span></h4>
                      <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-black rounded-full uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Bullish Trend
                      </div>
                    </div>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">HFT Analysis Engine • Node 0x42.B</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black font-mono tracking-tighter">$55,240.12</p>
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">+12.4% (24H)</p>
                  </div>
                </div>
                
                <div className="h-[350px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { time: '00:00', value: 42000 },
                      { time: '02:00', value: 43500 },
                      { time: '04:00', value: 45000 },
                      { time: '06:00', value: 44200 },
                      { time: '08:00', value: 43500 },
                      { time: '10:00', value: 46000 },
                      { time: '12:00', value: 48000 },
                      { time: '14:00', value: 50500 },
                      { time: '16:00', value: 52000 },
                      { time: '18:00', value: 51200 },
                      { time: '20:00', value: 51000 },
                      { time: '22:00', value: 53500 },
                      { time: '24:00', value: 55000 },
                    ]}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity={0.2}/>
                          <stop offset="100%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                        <filter id="shadow" height="200%">
                          <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur" />
                          <feOffset dx="0" dy="10" result="offsetBlur" />
                          <feFlood floodColor="#f97316" floodOpacity="0.3" result="offsetColor" />
                          <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="offsetBlur" />
                          <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                      <XAxis 
                        dataKey="time" 
                        stroke="#ffffff10" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false}
                        dy={15}
                        fontFamily="monospace"
                      />
                      <YAxis 
                        hide 
                        domain={['dataMin - 2000', 'dataMax + 2000']} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0a0a0a', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '16px',
                          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                          backdropFilter: 'blur(10px)'
                        }}
                        itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                        labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginBottom: '4px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#f97316" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        animationDuration={2500}
                        filter="url(#shadow)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-8 flex items-center justify-between pt-8 border-t border-white/5">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-1">Vol (24h)</p>
                      <p className="text-xs font-bold font-mono text-white/60">1.2M BTC</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-1">Market Cap</p>
                      <p className="text-xs font-bold font-mono text-white/60">$1.2T</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-orange-500 uppercase tracking-widest font-black">Live Market Feed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Prices Ticker */}
      <section className="py-16 border-y border-white/5 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[11px] font-mono uppercase tracking-[0.5em] text-white/40 font-bold">Live Market Prices</h2>
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x">
            {assets.map((asset) => {
              const currentPrice = asset.price;
              const prevPrice = asset.history.length > 1 ? asset.history[asset.history.length - 2].price : currentPrice;
              const change = ((currentPrice - prevPrice) / prevPrice) * 100;
              const isPositive = change >= 0;

              return (
                <motion.div 
                  key={asset.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="min-w-[200px] md:min-w-[240px] p-6 bg-[#111214] border border-white/5 rounded-xl hover:bg-[#151619] hover:border-white/10 transition-all duration-300 snap-start"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center p-1.5">
                      {ASSET_ICONS[asset.id] ? (
                        <img 
                          src={ASSET_ICONS[asset.id]} 
                          alt={asset.name} 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Activity className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{asset.name}</p>
                  </div>
                  <p className="text-xl font-bold font-mono tracking-tight mb-3">
                    ${asset.price.toLocaleString(undefined, { 
                      minimumFractionDigits: asset.type === 'forex' ? 4 : 2,
                      maximumFractionDigits: asset.type === 'forex' ? 4 : 2 
                    })}
                  </p>
                  <div className={cn(
                    "text-[10px] font-mono font-bold",
                    isPositive ? "text-green-500" : "text-red-500"
                  )}>
                    {isPositive ? '+' : ''}{change.toFixed(2)}%
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-orange-500">Core Capabilities</h2>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight">BUILT FOR PRECISION.</h3>
            </div>
            <p className="text-white/40 max-w-md text-sm leading-relaxed">
              Our simulation engine mirrors real market conditions, providing you with the most accurate training environment possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Cpu className="w-8 h-8" />,
                title: "Real-time Engine",
                desc: "Proprietary price engine delivering sub-second updates across all asset classes."
              },
              {
                icon: <BarChart4 className="w-8 h-8" />,
                title: "Advanced Analytics",
                desc: "Professional charting tools with technical indicators and historical data analysis."
              },
              {
                icon: <ShieldCheck className="w-8 h-8" />,
                title: "Zero Risk",
                desc: "Practice complex strategies with virtual capital before entering the real market."
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Global Markets",
                desc: "Access Crypto, Forex, Indices, and Stocks from a single unified interface."
              },
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "Mobile Ready",
                desc: "Fully responsive design optimized for seamless trading on any device."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Instant Execution",
                desc: "Experience the speed of institutional-grade order execution in a sandbox."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-[#151619] border border-white/5 rounded-3xl hover:border-orange-500/30 transition-all duration-300 group">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-orange-500 group-hover:bg-orange-500 group-hover:text-black transition-all duration-300">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Overview Table */}
      <section className="py-24 bg-[#0d0d0d] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-orange-500">Market Overview</h2>
            <h3 className="text-4xl font-bold tracking-tight">REAL-TIME INSTRUMENTS</h3>
          </div>

          <div className="bg-[#151619] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2">
                    <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-widest text-white/40">Instrument</th>
                    <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-widest text-white/40">Bid</th>
                    <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-widest text-white/40">Ask</th>
                    <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-widest text-white/40">Spread</th>
                    <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-widest text-white/40">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => {
                    const currentPrice = asset.price;
                    const prevPrice = asset.history.length > 1 ? asset.history[asset.history.length - 2].price : currentPrice;
                    const change = ((currentPrice - prevPrice) / prevPrice) * 100;
                    const isPositive = change >= 0;
                    
                    // Simulated Bid/Ask/Spread
                    const spreadVal = asset.type === 'forex' ? 0.0001 : (asset.price * 0.0002);
                    const bid = currentPrice - (spreadVal / 2);
                    const ask = currentPrice + (spreadVal / 2);
                    const spreadDisplay = asset.type === 'forex' ? (spreadVal * 10000).toFixed(1) : (spreadVal / currentPrice * 1000).toFixed(1);

                    return (
                      <tr key={asset.id} className="border-b border-white/5 hover:bg-white/2 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center p-2 group-hover:bg-white/10 transition-all">
                              {ASSET_ICONS[asset.id] ? (
                                <img 
                                  src={ASSET_ICONS[asset.id]} 
                                  alt={asset.name} 
                                  className="w-full h-full object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <Activity className="w-5 h-5 text-orange-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{asset.name}</p>
                              <p className="text-[10px] text-white/20 uppercase tracking-widest font-mono">{asset.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-mono text-sm">
                          {bid.toLocaleString(undefined, { 
                            minimumFractionDigits: asset.type === 'forex' ? 5 : 2,
                            maximumFractionDigits: asset.type === 'forex' ? 5 : 2 
                          })}
                        </td>
                        <td className="px-8 py-6 font-mono text-sm">
                          {ask.toLocaleString(undefined, { 
                            minimumFractionDigits: asset.type === 'forex' ? 5 : 2,
                            maximumFractionDigits: asset.type === 'forex' ? 5 : 2 
                          })}
                        </td>
                        <td className="px-8 py-6 font-mono text-sm text-white/40">
                          {spreadDisplay}
                        </td>
                        <td className="px-8 py-6">
                          <div className={cn(
                            "flex items-center gap-1 font-mono text-sm font-bold",
                            isPositive ? "text-green-400" : "text-red-400"
                          )}>
                            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            {isPositive ? '+' : ''}{change.toFixed(2)}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-orange-500">User Stories</h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight">TRUSTED BY THOUSANDS.</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Rivera",
                role: "Day Trader",
                text: "The most realistic simulation I've ever used. It helped me refine my strategy before I went live with real capital."
              },
              {
                name: "Sarah Chen",
                role: "Finance Student",
                text: "TradeX Pro is an essential tool for anyone learning the markets. The interface is intuitive and professional."
              },
              {
                name: "Marcus Thorne",
                role: "Crypto Enthusiast",
                text: "I love the real-time engine. It feels exactly like a real exchange. The zero-risk environment is a game changer."
              }
            ].map((testimonial, i) => (
              <div key={i} className="p-8 bg-[#151619] border border-white/5 rounded-3xl text-left space-y-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />)}
                </div>
                <p className="text-white/60 italic leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="w-10 h-10 bg-white/10 rounded-full" />
                  <div>
                    <p className="font-bold text-sm">{testimonial.name}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex-1" />
      <Footer />
    </div>
  );
}
