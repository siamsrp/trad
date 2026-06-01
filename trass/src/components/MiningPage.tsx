import React, { useState } from 'react';
import { ArrowLeft, Pickaxe, Clock, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../utils/cn';

interface MiningPageProps {
  onBack: () => void;
  balance: number;
  onStartMining?: (coin: string, duration: number) => void;
}

export default function MiningPage({ onBack, balance, onStartMining }: MiningPageProps) {
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);

  const miningOptions = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', difficulty: 'Hard', reward: 0.0001, fee: 50, color: 'orange' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', difficulty: 'Medium', reward: 0.002, fee: 30, color: 'blue' },
    { id: 'solana', name: 'Solana', symbol: 'SOL', difficulty: 'Easy', reward: 0.5, fee: 10, color: 'purple' },
    { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', difficulty: 'Medium', reward: 0.01, fee: 20, color: 'gray' },
    { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', difficulty: 'Easy', reward: 10, fee: 5, color: 'yellow' },
  ];

  const durations = [
    { value: 30, label: '30 Min', multiplier: 1 },
    { value: 60, label: '1 Hour', multiplier: 1.5 },
    { value: 120, label: '2 Hours', multiplier: 2 },
    { value: 240, label: '4 Hours', multiplier: 3 },
  ];

  const handleStartMining = () => {
    if (selectedCoin && onStartMining) {
      onStartMining(selectedCoin, selectedDuration);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Pickaxe className="w-8 h-8 text-orange-500" />
              Crypto Mining
            </h1>
            <p className="text-sm text-white/40 mt-1">Mine cryptocurrencies and earn rewards</p>
          </div>
        </div>

        {/* Balance Display */}
        <div className="bg-[#151619] border border-white/5 rounded-3xl p-6 mb-6">
          <p className="text-sm text-white/40 mb-2">Available Balance</p>
          <p className="text-4xl font-bold font-mono">${balance.toLocaleString()}</p>
        </div>

        {/* Mining Options */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Select Cryptocurrency</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {miningOptions.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCoin(option.id)}
                className={cn(
                  "p-6 rounded-2xl border transition-all text-left",
                  selectedCoin === option.id
                    ? "bg-orange-500/10 border-orange-500/50"
                    : "bg-[#151619] border-white/5 hover:border-white/20"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      `bg-${option.color}-500/10`
                    )}>
                      <Pickaxe className={cn("w-6 h-6", `text-${option.color}-500`)} />
                    </div>
                    <div>
                      <p className="font-bold">{option.name}</p>
                      <p className="text-sm text-white/40">{option.symbol}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold",
                    option.difficulty === 'Easy' ? "bg-green-500/10 text-green-500" :
                    option.difficulty === 'Medium' ? "bg-yellow-500/10 text-yellow-500" :
                    "bg-red-500/10 text-red-500"
                  )}>
                    {option.difficulty}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Mining Fee</span>
                    <span className="font-mono font-bold">${option.fee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Est. Reward</span>
                    <span className="font-mono font-bold text-green-400">{option.reward} {option.symbol}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Duration Selection */}
        {selectedCoin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold mb-4">Select Duration</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {durations.map((duration) => (
                <button
                  key={duration.value}
                  onClick={() => setSelectedDuration(duration.value)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all",
                    selectedDuration === duration.value
                      ? "bg-orange-500/10 border-orange-500/50"
                      : "bg-[#151619] border-white/5 hover:border-white/20"
                  )}
                >
                  <Clock className="w-6 h-6 mb-2 mx-auto text-orange-500" />
                  <p className="font-bold text-center">{duration.label}</p>
                  <p className="text-xs text-white/40 text-center mt-1">{duration.multiplier}x Reward</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Start Mining Button */}
        {selectedCoin && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleStartMining}
            disabled={balance < (miningOptions.find(o => o.id === selectedCoin)?.fee || 0)}
            className="w-full py-6 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl font-bold text-lg text-black hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <Zap className="w-6 h-6" />
            Start Mining
          </motion.button>
        )}
      </div>
    </div>
  );
}
