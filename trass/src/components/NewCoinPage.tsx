import React, { useState } from 'react';
import { ArrowLeft, Coins, Zap, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface NewCoinPageProps {
  onBack: () => void;
  balance: number;
}

export default function NewCoinPage({ onBack, balance }: NewCoinPageProps) {
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

  const newCoins = [
    {
      id: 'newtoken',
      name: 'NewToken',
      symbol: 'NTK',
      icon: Coins,
      price: 0.15,
      change: 125,
      description: 'Next-gen DeFi protocol',
      color: 'purple'
    },
    {
      id: 'metacoin',
      name: 'MetaCoin',
      symbol: 'MTC',
      icon: Zap,
      price: 0.08,
      change: 89,
      description: 'Metaverse ecosystem token',
      color: 'blue'
    },
    {
      id: 'greenchain',
      name: 'GreenChain',
      symbol: 'GNC',
      icon: TrendingUp,
      price: 0.25,
      change: 45,
      description: 'Eco-friendly blockchain',
      color: 'green'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Coins</h1>
            <p className="text-sm text-white/40 mt-1">Discover promising new tokens</p>
          </div>
        </div>

        <div className="bg-[#151619] border border-white/5 rounded-3xl p-6 mb-6">
          <p className="text-sm text-white/40 mb-2">Available Balance</p>
          <p className="text-4xl font-bold font-mono">${balance.toLocaleString()}</p>
        </div>

        <div className="space-y-6">
          {newCoins.map((coin) => (
            <motion.div
              key={coin.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedCoin(coin.id)}
              className={`p-6 rounded-3xl border transition-all ${
                selectedCoin === coin.id
                  ? 'bg-orange-500/10 border-orange-500/50'
                  : 'bg-[#151619] border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl bg-${coin.color}-500/10`}>
                    <coin.icon className={`w-8 h-8 text-${coin.color}-500`} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">{coin.name}</h2>
                      <span className="text-sm text-white/40 font-mono">{coin.symbol}</span>
                    </div>
                    <p className="text-sm text-white/50">{coin.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-2xl font-bold font-mono">${coin.price.toFixed(4)}</p>
                  <p className="text-green-400 font-bold">+{coin.change}%</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!selectedCoin}
          className="w-full mt-8 py-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-lg text-black hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Buy Selected Coin
        </motion.button>
      </div>
    </div>
  );
}
