import React, { useState } from 'react';
import { ArrowLeft, Gift as GiftIcon, User, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface GiftPageProps {
  onBack: () => void;
  balance: number;
}

export default function GiftPage({ onBack, balance }: GiftPageProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [giftAmount, setGiftAmount] = useState('');
  const [giftMessage, setGiftMessage] = useState('');

  const quickAmounts = [50, 100, 250, 500, 1000];

  const handleSendGift = () => {
    // Handle gift sending logic
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Send Gift</h1>
            <p className="text-sm text-white/40 mt-1">Gift funds to your friends</p>
          </div>
        </div>

        <div className="bg-[#151619] border border-white/5 rounded-3xl p-6 mb-6">
          <p className="text-sm text-white/40 mb-2">Available Balance</p>
          <p className="text-4xl font-bold font-mono">${balance.toLocaleString()}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-[#151619] border border-white/5 rounded-3xl p-6">
            <label className="text-sm text-white/40 mb-3 block">Recipient Email</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="friend@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-lg focus:outline-none focus:border-pink-500/50 transition-all"
              />
            </div>
          </div>

          <div className="bg-[#151619] border border-white/5 rounded-3xl p-6">
            <label className="text-sm text-white/40 mb-3 block">Gift Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-6 h-6" />
              <input
                type="number"
                value={giftAmount}
                onChange={(e) => setGiftAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-2xl font-bold font-mono focus:outline-none focus:border-pink-500/50 transition-all"
              />
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setGiftAmount(amt.toString())}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
                >
                  ${amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#151619] border border-white/5 rounded-3xl p-6">
            <label className="text-sm text-white/40 mb-3 block">Personal Message (Optional)</label>
            <textarea
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              placeholder="Write a message..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-pink-500/50 transition-all resize-none"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!recipientEmail || !giftAmount || parseFloat(giftAmount) <= 0 || parseFloat(giftAmount) > balance}
          onClick={handleSendGift}
          className="w-full mt-8 py-6 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl font-bold text-lg text-black hover:shadow-lg hover:shadow-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send Gift
        </motion.button>
      </div>
    </div>
  );
}
