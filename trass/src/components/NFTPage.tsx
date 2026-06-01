import React, { useState } from 'react';
import { ArrowLeft, Image, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface NFTPageProps {
  onBack: () => void;
  balance: number;
}

export default function NFTPage({ onBack, balance }: NFTPageProps) {
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);

  const nfts = [
    {
      id: 'nft1',
      name: 'Digital Art #1',
      price: 500,
      rarity: 'Rare',
      color: 'purple',
      icon: Image
    },
    {
      id: 'nft2',
      name: 'Metaverse Pass',
      price: 1200,
      rarity: 'Legendary',
      color: 'orange',
      icon: Zap
    },
    {
      id: 'nft3',
      name: 'Virtual Land',
      price: 3000,
      rarity: 'Epic',
      color: 'blue',
      icon: TrendingUp
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
            <h1 className="text-3xl font-bold tracking-tight">NFT Marketplace</h1>
            <p className="text-sm text-white/40 mt-1">Discover and collect unique NFTs</p>
          </div>
        </div>

        <div className="bg-[#151619] border border-white/5 rounded-3xl p-6 mb-6">
          <p className="text-sm text-white/40 mb-2">Available Balance</p>
          <p className="text-4xl font-bold font-mono">${balance.toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <motion.div
              key={nft.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedNFT(nft.id)}
              className={`p-6 rounded-3xl border transition-all ${
                selectedNFT === nft.id
                  ? 'bg-orange-500/10 border-orange-500/50'
                  : 'bg-[#151619] border-white/5 hover:border-white/20'
              }`}
            >
              <div className={`w-full aspect-square rounded-2xl bg-${nft.color}-500/10 flex items-center justify-center mb-4`}>
                <nft.icon className={`w-24 h-24 text-${nft.color}-500`} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">{nft.name}</h2>
                <p className="text-sm text-white/40">{nft.rarity}</p>
                <p className="text-2xl font-bold font-mono text-orange-400">${nft.price.toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!selectedNFT}
          className="w-full mt-8 py-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-lg text-black hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Buy Selected NFT
        </motion.button>
      </div>
    </div>
  );
}
