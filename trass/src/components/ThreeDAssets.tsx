import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  Globe, DollarSign, Euro, PoundSterling, Building2, Landmark, 
  TrendingUp, Gem, Activity, Zap, ShieldCheck, Star, ArrowRight 
} from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Base3DProps {
  color?: string;
  size?: string;
  className?: string;
}

export const Coin3D = ({ 
  icon: Icon, 
  color = "#f97316", 
  size = "w-64 h-64",
  className = ""
}: Base3DProps & { icon: any }) => {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative perspective-2000 group", size, className)}
    >
      <motion.div
        animate={{
          rotateY: 0,
          rotateX: mousePos.y * 20,
          rotateZ: mousePos.x * -10,
          y: [0, -15, 0],
        }}
        transition={{
          rotateX: { type: "spring", stiffness: 50, damping: 15 },
          rotateZ: { type: "spring", stiffness: 50, damping: 15 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full relative will-change-transform"
      >
        <div 
          className="absolute inset-0 rounded-full flex items-center justify-center border-[6px] border-white/30 backdrop-blur-md shadow-[0_0_60px_rgba(249,115,22,0.4)] overflow-hidden"
          style={{ 
            background: `radial-gradient(circle at 30% 30%, ${color}66, ${color})`,
            transform: "translateZ(15px)",
            backfaceVisibility: "hidden"
          }}
        >
          <Icon className="w-1/2 h-1/2 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
          <motion.div 
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent skew-x-12"
          />
        </div>
        <div 
          className="absolute inset-0 rounded-full flex items-center justify-center border-[6px] border-white/30 backdrop-blur-md"
          style={{ 
            background: `radial-gradient(circle at 70% 70%, ${color}, ${color}66)`,
            transform: "rotateY(180deg) translateZ(15px)",
            backfaceVisibility: "hidden"
          }}
        >
          <Icon className="w-1/2 h-1/2 text-white/40" />
        </div>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border border-white/5 pointer-events-none"
            style={{
              transform: `translateZ(${i - 10}px)`,
              background: `radial-gradient(circle, ${color}cc, ${color}33)`,
              opacity: 0.6
            }}
          />
        ))}
      </motion.div>
      <motion.div 
        animate={{
          scale: [1, 0.7, 1],
          opacity: [0.4, 0.15, 0.4],
          x: mousePos.x * -20,
          y: mousePos.y * -10
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-10 bg-black/60 blur-2xl rounded-full"
      />
    </div>
  );
};

export const Globe3D = ({ 
  color = "#f97316", 
  size = "w-64 h-64",
  className = ""
}: Base3DProps) => {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative perspective-2000 group", size, className)}
    >
      <motion.div
        animate={{
          rotateY: 0,
          rotateX: mousePos.y * 20,
          rotateZ: mousePos.x * -10,
          y: [0, -15, 0],
        }}
        transition={{
          rotateX: { type: "spring", stiffness: 50, damping: 15 },
          rotateZ: { type: "spring", stiffness: 50, damping: 15 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full relative will-change-transform"
      >
        <div 
          className="absolute inset-0 rounded-full border-2 border-white/20 backdrop-blur-sm overflow-hidden"
          style={{ 
            background: `radial-gradient(circle at 30% 30%, ${color}44, transparent)`,
            transform: "translateZ(0px)",
          }}
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 border-t border-white/40 top-1/4" />
            <div className="absolute inset-0 border-t border-white/40 top-1/2" />
            <div className="absolute inset-0 border-t border-white/40 top-3/4" />
            <div className="absolute inset-0 border-l border-white/40 left-1/4 h-full" />
            <div className="absolute inset-0 border-l border-white/40 left-1/2 h-full" />
            <div className="absolute inset-0 border-l border-white/40 left-3/4 h-full" />
          </div>
          <div className="absolute inset-8 rounded-full bg-orange-500/20 blur-3xl" />
          <Globe className="absolute inset-0 m-auto w-2/3 h-2/3 text-white/40" />
        </div>
        {[DollarSign, Euro, PoundSterling].map((Icon, i) => (
          <motion.div
            key={i}
            animate={{ rotate: 360 }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 pointer-events-none"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-xl"
              style={{ transform: `rotateY(${i * 120}deg) translateZ(160px)` }}
            >
              <Icon className="w-5 h-5 text-orange-500" />
            </div>
          </motion.div>
        ))}
      </motion.div>
      <motion.div 
        animate={{
          scale: [1, 0.7, 1],
          opacity: [0.4, 0.15, 0.4],
          x: mousePos.x * -20,
          y: mousePos.y * -10
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-10 bg-black/60 blur-2xl rounded-full"
      />
    </div>
  );
};

interface MarketData {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  trend: 'up' | 'down';
  change: string;
}

export const StockCard3D = ({ 
  color = "#f97316", 
  size = "w-64 h-80",
  className = "",
  symbol = "AAPL",
  price = "182.41",
  icon: Icon = Building2,
  onStartTrading
}: Base3DProps & { symbol?: string, price?: string, icon?: any, onStartTrading?: () => void }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [marketType, setMarketType] = useState<'forex' | 'real'>('real');
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Simulating API Headers as requested
      const headers = {
        'Authorization': 'Bearer simulated-jwt-token',
        'X-API-Key': 'simulated-api-key-12345'
      };
      
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockForex: MarketData[] = [
        { symbol: 'EUR/USD', bid: 1.08542, ask: 1.08544, spread: 0.2, trend: 'up', change: '+0.04%' },
        { symbol: 'GBP/USD', bid: 1.26431, ask: 1.26435, spread: 0.4, trend: 'down', change: '-0.12%' }
      ];

      const mockReal: MarketData[] = [
        { symbol: 'AMZN', bid: 178.22, ask: 178.25, spread: 0.03, trend: 'up', change: '+1.42%' },
        { symbol: 'NVDA', bid: 875.33, ask: 875.45, spread: 0.12, trend: 'up', change: '+2.85%' }
      ];

      setData(marketType === 'forex' ? mockForex : mockReal);
      setLoading(false);
    };

    fetchData();
  }, [marketType]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsFlipped(!isFlipped)}
      className={cn("relative perspective-2000 group cursor-pointer", size, className)}
    >
      <motion.div
        animate={{
          rotateY: isFlipped ? 180 : 0,
          rotateX: mousePos.y * 15,
          rotateZ: mousePos.x * -5,
          y: [0, -10, 0],
        }}
        transition={{
          rotateY: { duration: 0.8, ease: "easeInOut" },
          rotateX: { type: "spring", stiffness: 50, damping: 15 },
          rotateZ: { type: "spring", stiffness: 50, damping: 15 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full relative will-change-transform"
      >
        {/* Front Face: Market Segments */}
        <div 
          className="absolute inset-0 rounded-[2.5rem] border-[3px] border-white/20 backdrop-blur-xl overflow-hidden flex flex-col p-10 justify-between shadow-[0_0_100px_rgba(249,115,22,0.15)]"
          style={{ 
            background: `linear-gradient(135deg, ${color}22, rgba(0,0,0,0.9))`,
            transform: "translateZ(25px)",
            backfaceVisibility: "hidden"
          }}
        >
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                <button 
                  onClick={(e) => { e.stopPropagation(); setMarketType('forex'); }}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    marketType === 'forex' ? "bg-orange-500 text-black shadow-lg" : "text-white/40 hover:text-white"
                  )}
                >
                  Forex
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setMarketType('real'); }}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    marketType === 'real' ? "bg-orange-500 text-black shadow-lg" : "text-white/40 hover:text-white"
                  )}
                >
                  Real
                </button>
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors duration-500">
                <Activity className="w-6 h-6 text-orange-500 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Live Terminal Feed</p>
              <h3 className="text-3xl font-black tracking-tighter uppercase">
                {marketType === 'forex' ? 'Global FX' : 'Equity Assets'}
              </h3>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="h-40 w-full bg-white/5 rounded-3xl animate-pulse" />
              ) : (
                data.map((item, i) => (
                  <div key={i} className="p-4 bg-white/2 border border-white/5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm tracking-widest">{item.symbol}</span>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                        item.trend === 'up' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {item.change}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[8px] text-white/20 uppercase font-mono mb-1">Bid</p>
                        <p className="text-[10px] font-mono font-bold">{item.bid}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-white/20 uppercase font-mono mb-1">Ask</p>
                        <p className="text-[10px] font-mono font-bold">{item.ask}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-white/20 uppercase font-mono mb-1">Spread</p>
                        <p className="text-[10px] font-mono font-bold text-orange-500">{item.spread}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-white/20" />
              <p className="text-[8px] font-mono uppercase tracking-widest text-white/20">Secure Data Active</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Back Face: Platform Benefits */}
        <div 
          className="absolute inset-0 rounded-[2.5rem] border-[3px] border-orange-500/30 backdrop-blur-xl flex flex-col p-10 justify-between overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, rgba(0,0,0,1), ${color}22)`,
            transform: "rotateY(180deg) translateZ(25px)",
            backfaceVisibility: "hidden"
          }}
        >
          <div className="space-y-10 relative z-10">
            <div className="space-y-4 text-center">
              <h3 className="text-2xl font-black tracking-tight text-orange-500 leading-tight">
                The World's Most Advanced Trading Simulation Platform
              </h3>
              <div className="w-12 h-1 bg-orange-500/50 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center space-y-2">
                <Zap className="w-5 h-5 text-orange-500 mx-auto" />
                <p className="text-[8px] text-white/40 uppercase font-mono">Speed</p>
                <p className="text-sm font-black">0.001s</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center space-y-2">
                <ShieldCheck className="w-5 h-5 text-green-500 mx-auto" />
                <p className="text-[8px] text-white/40 uppercase font-mono">Regulated</p>
                <p className="text-sm font-black">Tier-1</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center space-y-2">
                <Star className="w-5 h-5 text-yellow-500 mx-auto" />
                <p className="text-[8px] text-white/40 uppercase font-mono">Rating</p>
                <p className="text-sm font-black">4.9/5.0</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center space-y-2">
                <Globe className="w-5 h-5 text-blue-500 mx-auto" />
                <p className="text-[8px] text-white/40 uppercase font-mono">Markets</p>
                <p className="text-sm font-black">100+</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <button 
              onClick={(e) => { e.stopPropagation(); onStartTrading?.(); }}
              className="w-full py-5 bg-orange-500 text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-all duration-500 shadow-xl shadow-orange-500/20"
            >
              Start Trading
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-[8px] text-white/20 text-center uppercase font-mono tracking-widest italic">Global Institutional Access Terminal</p>
          </div>

          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full" />
        </div>

        {/* Thickness Layers */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-[2.5rem] border border-white/5 pointer-events-none"
            style={{
              transform: `translateZ(${i - 10}px)`,
              background: `rgba(255, 255, 255, 0.01)`,
              opacity: 0.05
            }}
          />
        ))}
      </motion.div>
      <motion.div 
        animate={{
          scale: [1, 0.8, 1],
          opacity: [0.3, 0.1, 0.3],
          x: mousePos.x * -30,
          y: mousePos.y * -15
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 h-12 bg-black/80 blur-3xl rounded-full"
      />
    </div>
  );
};

export const GoldBar3D = ({ 
  color = "#f97316", 
  size = "w-64 h-32",
  className = ""
}: Base3DProps) => {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative perspective-2000 group", size, className)}
    >
      <motion.div
        animate={{
          rotateY: 0,
          rotateX: mousePos.y * 20,
          rotateZ: mousePos.x * -10,
          y: [0, -15, 0],
        }}
        transition={{
          rotateX: { type: "spring", stiffness: 50, damping: 15 },
          rotateZ: { type: "spring", stiffness: 50, damping: 15 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full relative will-change-transform"
      >
        <div 
          className="absolute inset-0 border border-white/20 flex items-center justify-center shadow-[0_0_60px_rgba(249,115,22,0.3)]"
          style={{ 
            background: `linear-gradient(135deg, ${color}, ${color}88)`,
            transform: "translateZ(30px)",
            backfaceVisibility: "hidden"
          }}
        >
          <div className="text-center">
            <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/40">Fine Gold</p>
            <p className="text-2xl font-black tracking-tighter text-black/80">999.9</p>
            <p className="text-[10px] font-bold text-black/40 mt-2">NET WT 1000g</p>
          </div>
          <motion.div 
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent skew-x-12"
          />
        </div>
        <div 
          className="absolute inset-0 border border-white/20"
          style={{ 
            background: `linear-gradient(135deg, ${color}88, ${color})`,
            transform: "rotateY(180deg) translateZ(30px)",
            backfaceVisibility: "hidden"
          }}
        />
        <div 
          className="absolute top-0 bottom-0 left-0 w-[60px]"
          style={{ background: `${color}aa`, transform: "rotateY(-90deg) translateZ(30px)", left: "-30px" }}
        />
        <div 
          className="absolute top-0 bottom-0 right-0 w-[60px]"
          style={{ background: `${color}aa`, transform: "rotateY(90deg) translateZ(30px)", right: "-30px" }}
        />
        <div 
          className="absolute left-0 right-0 top-0 h-[60px]"
          style={{ background: `${color}cc`, transform: "rotateX(90deg) translateZ(30px)", top: "-30px" }}
        />
        <div 
          className="absolute left-0 right-0 bottom-0 h-[60px]"
          style={{ background: `${color}cc`, transform: "rotateX(-90deg) translateZ(30px)", bottom: "-30px" }}
        />
      </motion.div>
      <motion.div 
        animate={{
          scale: [1, 0.7, 1],
          opacity: [0.4, 0.15, 0.4],
          x: mousePos.x * -20,
          y: mousePos.y * -10
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-10 bg-black/60 blur-2xl rounded-full"
      />
    </div>
  );
};
