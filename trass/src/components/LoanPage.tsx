import React, { useState } from 'react';
import { ArrowLeft, HandCoins, DollarSign, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface LoanPageProps {
  onBack: () => void;
  balance: number;
}

export default function LoanPage({ onBack, balance }: LoanPageProps) {
  const [loanAmount, setLoanAmount] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(30);

  const loanTerms = [
    { days: 30, interest: '5%' },
    { days: 60, interest: '8%' },
    { days: 90, interest: '12%' },
    { days: 180, interest: '20%' }
  ];

  const maxLoan = balance * 2;

  const calculateInterest = () => {
    const amount = parseFloat(loanAmount) || 0;
    const term = loanTerms.find(t => t.days === selectedTerm);
    if (!term || amount <= 0) return '0.00';
    const rate = parseFloat(term.interest) / 100;
    return (amount * rate).toFixed(2);
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
            <h1 className="text-3xl font-bold tracking-tight">Crypto Loans</h1>
            <p className="text-sm text-white/40 mt-1">Borrow against your assets</p>
          </div>
        </div>

        <div className="bg-[#151619] border border-white/5 rounded-3xl p-6 mb-6">
          <p className="text-sm text-white/40 mb-2">Available Balance (Collateral)</p>
          <p className="text-4xl font-bold font-mono">${balance.toLocaleString()}</p>
          <p className="text-sm text-orange-400 mt-2">Max Loan: ${maxLoan.toLocaleString()}</p>
        </div>

        <div className="bg-[#151619] border border-white/5 rounded-3xl p-6 mb-6">
          <label className="text-sm text-white/40 mb-3 block">Loan Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-white/40">$</span>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="0.00"
              max={maxLoan}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-2xl font-bold font-mono focus:outline-none focus:border-orange-500/50 transition-all"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm text-white/40 mb-3 block">Loan Term</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loanTerms.map((term) => (
              <motion.button
                key={term.days}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTerm(term.days)}
                className={`p-6 rounded-2xl border transition-all text-center ${
                  selectedTerm === term.days
                    ? 'bg-orange-500/10 border-orange-500/50'
                    : 'bg-[#151619] border-white/5 hover:border-white/20'
                }`}
              >
                <p className="text-2xl font-bold">{term.days}</p>
                <p className="text-sm text-white/40">Days</p>
                <p className="text-orange-400 font-bold mt-1">{term.interest}</p>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="bg-[#151619] border border-white/5 rounded-3xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white/40">Interest</span>
            <span className="font-bold font-mono text-lg">${calculateInterest()}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <span className="text-white/40">Total to Repay</span>
            <span className="font-bold font-mono text-2xl text-orange-400">
              ${((parseFloat(loanAmount) || 0) + (parseFloat(calculateInterest()) || 0)).toFixed(2)}
            </span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!loanAmount || parseFloat(loanAmount) <= 0 || parseFloat(loanAmount) > maxLoan}
          className="w-full py-6 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl font-bold text-lg text-black hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply for Loan
        </motion.button>
      </div>
    </div>
  );
}
