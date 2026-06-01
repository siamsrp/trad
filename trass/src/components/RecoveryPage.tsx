import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface RecoveryPageProps {
  onBack: () => void;
  balance: number;
}

export default function RecoveryPage({ onBack, balance }: RecoveryPageProps) {
  const [selectedRecovery, setSelectedRecovery] = useState<string | null>(null);

  const recoveryOptions = [
    {
      id: 'password',
      name: 'Password Recovery',
      icon: ShieldCheck,
      description: 'Reset your account password',
      color: 'blue'
    },
    {
      id: '2fa',
      name: '2FA Recovery',
      icon: ShieldCheck,
      description: 'Recover two-factor authentication',
      color: 'green'
    },
    {
      id: 'funds',
      name: 'Funds Recovery',
      icon: RotateCcw,
      description: 'Recover lost or stuck funds',
      color: 'orange'
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
            <h1 className="text-3xl font-bold tracking-tight">Account Recovery</h1>
            <p className="text-sm text-white/40 mt-1">Recover your account or funds</p>
          </div>
        </div>

        <div className="space-y-6">
          {recoveryOptions.map((option) => (
            <motion.div
              key={option.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedRecovery(option.id)}
              className={`p-6 rounded-3xl border transition-all ${
                selectedRecovery === option.id
                  ? 'bg-orange-500/10 border-orange-500/50'
                  : 'bg-[#151619] border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-${option.color}-500/10`}>
                  <option.icon className={`w-8 h-8 text-${option.color}-500`} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">{option.name}</h2>
                  <p className="text-sm text-white/50">{option.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!selectedRecovery}
          className="w-full mt-8 py-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl font-bold text-lg text-black hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Recovery
        </motion.button>
      </div>
    </div>
  );
}
