import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, ShieldCheck, Clock, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface InvestPlanPageProps {
  onBack: () => void;
  balance: number;
}

export default function InvestPlanPage({ onBack, balance }: InvestPlanPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const investmentPlans = [
    {
      id: 'conservative',
      name: 'Conservative',
      icon: ShieldCheck,
      description: 'Low risk, steady returns',
      minDeposit: 1000,
      apy: '5%',
      duration: 180,
      color: 'blue',
      features: ['Capital protection', 'Fixed returns', 'No lock-in']
    },
    {
      id: 'balanced',
      name: 'Balanced',
      icon: TrendingUp,
      description: 'Moderate risk, balanced returns',
      minDeposit: 5000,
      apy: '12%',
      duration: 365,
      color: 'green',
      features: ['Diversified portfolio', 'Monthly compounding', 'Risk management']
    },
    {
      id: 'aggressive',
      name: 'Aggressive',
      icon: TrendingUp,
      description: 'High risk, high returns',
      minDeposit: 10000,
      apy: '25%',
      duration: 365,
      color: 'orange',
      features: ['Maximize gains', 'Leveraged positions', 'Advanced strategies']
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
            <h1 className="text-3xl font-bold tracking-tight">Investment Plans</h1>
            <p className="text-sm text-white/40 mt-1">Choose a plan to grow your wealth</p>
          </div>
        </div>

        <div className="bg-[#151619] border border-white/5 rounded-3xl p-6 mb-6">
          <p className="text-sm text-white/40 mb-2">Available Balance</p>
          <p className="text-4xl font-bold font-mono">${balance.toLocaleString()}</p>
        </div>

        <div className="space-y-6">
          {investmentPlans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedPlan(plan.id)}
            className={`p-6 rounded-3xl border transition-all ${
              selectedPlan === plan.id
                ? 'bg-orange-500/10 border-orange-500/50'
                : 'bg-[#151619] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl bg-${plan.color}-500/10`}>
                  <plan.icon className={`w-8 h-8 text-${plan.color}-500`} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{plan.name}</h2>
                  <p className="text-white/50">{plan.description}</p>
                  <div className="flex gap-4 text-sm text-white/40">
                    <span>Min. Deposit: <span className="text-white/80 font-bold">${plan.minDeposit}</span></span>
                    <span>APY: <span className="text-orange-400 font-bold">{plan.apy}</span></span>
                    <span>Duration: <span className="text-white/80 font-bold">{plan.duration} days</span></span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="w-6 h-6 border-2 border-orange-500 rounded-full flex items-center justify-center">
                  {selectedPlan === plan.id && (
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold text-white/40 mb-2">Features</h3>
              <div className="flex flex-wrap gap-2">
                {plan.features.map((feature, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!selectedPlan}
          className="w-full mt-8 py-6 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl font-bold text-lg text-black hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Investing
        </motion.button>
      </div>
    </div>
  );
}
