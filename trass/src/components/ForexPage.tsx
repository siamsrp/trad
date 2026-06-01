import React from 'react';
import { 
  Activity, ArrowUpRight, ArrowDownRight, Globe, 
  Zap, ShieldCheck, Scale, TrendingUp, 
  Coins, Cpu, Smartphone, BarChart4, ChevronRight,
  Layers, Lock, ZapOff, MousePointer2, DollarSign, Euro, PoundSterling
} from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import Footer from './Footer';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ForexPageProps {
  onBack: () => void;
  onStartTrading: () => void;
}

import { Globe3D } from './ThreeDAssets';

export default function ForexPage({ onBack, onStartTrading }: ForexPageProps) {
  const [activeAsset, setActiveAsset] = React.useState(0);
  const assets = [
    { 
      name: "EUR / USD", 
      ticker: "EURUSD", 
      icon: Euro,
      desc: "The world's most traded currency pair. Experience the ultimate liquidity and tight spreads.",
      color: "#f97316"
    },
    { 
      name: "GBP / USD", 
      ticker: "GBPUSD", 
      icon: PoundSterling,
      desc: "The 'Cable'. Trade the historic relationship between the British Pound and the US Dollar.",
      color: "#627EEA"
    },
    { 
      name: "USD / JPY", 
      ticker: "USDJPY", 
      icon: DollarSign,
      desc: "The 'Ninja'. Navigate the safe-haven flows between the Dollar and the Japanese Yen.",
      color: "#14F195"
    },
    { 
      name: "AUD / USD", 
      ticker: "AUDUSD", 
      icon: Globe,
      desc: "The 'Aussie'. Trade the commodity-linked currency of Australia against the Greenback.",
      color: "#0033AD"
    }
  ];

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-x-hidden selection:bg-orange-500 selection:text-black">
      {/* Grid Background */}
      <motion.div 
        style={{ y: backgroundY }}
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505] to-[#050505]" />
      </motion.div>

      {/* Navigation Overlay */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/60 backdrop-blur-2xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
              <Activity className="text-black w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tighter uppercase">Rubicon <span className="text-orange-500">Liberty</span></span>
          </button>
          <div className="flex items-center gap-4">
            <button 
              onClick={onStartTrading}
              className="px-8 py-2.5 bg-orange-500 text-black rounded-full text-sm font-black uppercase tracking-widest hover:bg-white transition-all duration-300 shadow-xl shadow-orange-500/20"
            >
              Join the Elite
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/60 text-[10px] font-black uppercase tracking-[0.4em]">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
                  Global Liquidity Access
                </div>
                <h1 className="text-7xl md:text-[120px] font-black tracking-tighter leading-[0.85] uppercase">
                  Global <br />
                  <span className="text-orange-500">Forex.</span>
                </h1>
                <p className="text-2xl text-white/40 max-w-xl leading-snug font-medium italic serif">
                  "Trade the pulse of nations. Access the $6.6 trillion-a-day market with institutional precision and zero-latency execution."
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-6"
              >
                <button 
                  onClick={onStartTrading}
                  className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-orange-500 transition-all duration-500 flex items-center gap-4 group"
                >
                  Start Trading
                  <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </motion.div>
            </div>

            <div className="lg:col-span-5 flex justify-center items-center relative">
              <Globe3D color={assets[0].color} />
              
              {/* Floating Data Cards */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-20"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{assets[0].ticker}</p>
                <p className="text-2xl font-mono font-bold text-green-400">1.08421</p>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-[10px] font-mono text-green-400">+0.12%</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Showcase Section */}
      <section className="py-32 px-6 bg-[#050505] relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-orange-500 mb-6">Market Universe</h2>
            <h3 className="text-6xl md:text-8xl font-black tracking-tighter uppercase">Major <br /> <span className="text-orange-500">Pairs.</span></h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-6">
              {assets.map((coin, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveAsset(i)}
                  className={cn(
                    "flex items-start gap-8 p-8 rounded-3xl transition-all duration-500 cursor-pointer border group",
                    activeAsset === i 
                      ? "bg-white/5 border-white/10 shadow-2xl" 
                      : "bg-transparent border-transparent hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "text-4xl font-black italic transition-colors duration-500",
                    activeAsset === i ? "text-orange-500" : "text-white/10 group-hover:text-white/20"
                  )}>
                    0{i+1}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <h4 className="text-3xl font-black uppercase tracking-tighter">{coin.name}</h4>
                    </div>
                    <p className="text-white/40 leading-relaxed">
                      {coin.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="relative aspect-square flex items-center justify-center">
              <div className="absolute inset-0 bg-orange-500/5 blur-[120px] rounded-full" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeAsset}
                  initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                  className="relative z-10"
                >
                  <Globe3D 
                    color={assets[activeAsset].color} 
                    size="w-80 h-80" 
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Live Terminal Section */}
      <section className="py-32 px-6 bg-[#080808] border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-8">
              <h2 className="text-xs font-black uppercase tracking-[0.5em] text-orange-500">Real-time Feed</h2>
              <h3 className="text-5xl font-black tracking-tighter uppercase">Forex <br /> <span className="text-white/20">Pulse.</span></h3>
              <p className="text-white/40 leading-relaxed italic serif">
                "Direct connection to the global interbank market. Every pip, every spread, delivered with zero-compromise speed."
              </p>
            </div>
            
            <div className="lg:col-span-8">
              <div className="bg-black rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">ForexX_Terminal_v4.0.1</div>
                </div>
                <div className="p-8 font-mono text-xs space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
                  {[
                    { time: "14:29:01", type: "INFO", msg: "Initializing interbank connection..." },
                    { time: "14:29:02", type: "SUCCESS", msg: "Connection established. Latency: 0.12ms" },
                    { time: "14:29:05", type: "TRADE", msg: "EUR/USD: Institutional buy order detected at 1.0842 (50M EUR)" },
                    { time: "14:29:08", type: "INFO", msg: "Updating liquidity for GBP/USD..." },
                    { time: "14:29:12", type: "ALERT", msg: "Central bank announcement detected. Volatility increasing." },
                    { time: "14:29:15", type: "TRADE", msg: "USD/JPY: Sell order filled at 151.45 (25M USD)" },
                    { time: "14:29:20", type: "INFO", msg: "Syncing global currency pools..." },
                    { time: "14:29:25", type: "SUCCESS", msg: "Spread optimized. Current EUR/USD spread: 0.2 pips" },
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
              <div className="h-[500px] w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl relative group">
                <div className="absolute top-8 left-8 z-20">
                  <div className="flex items-center gap-4">
                    <h4 className="text-2xl font-black uppercase tracking-tighter">Market Momentum</h4>
                    <span className="px-3 py-1 bg-green-500/20 text-green-500 text-[10px] font-black rounded-full uppercase tracking-widest">Bullish Trend</span>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { time: '00:00', value: 1.0810 },
                    { time: '04:00', value: 1.0825 },
                    { time: '08:00', value: 1.0815 },
                    { time: '12:00', value: 1.0840 },
                    { time: '16:00', value: 1.0855 },
                    { time: '20:00', value: 1.0845 },
                    { time: '24:00', value: 1.0860 },
                  ]}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#ffffff20" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      hide 
                      domain={['dataMin - 0.0010', 'dataMax + 0.0010']} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111214', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#f97316' }}
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
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .perspective-2000 {
          perspective: 2000px;
        }
        .serif {
          font-family: 'Georgia', serif;
        }
      `}</style>
    </div>
  );
}
