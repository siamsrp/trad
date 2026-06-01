import React, { useState } from 'react';
import { ArrowLeft, DollarSign, CreditCard, Building2, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../utils/cn';

interface DepositPageProps {
  onBack: () => void;
  balance: number;
  onDeposit?: (amount: number, method: string) => void;
}

export default function DepositPage({ onBack, balance, onDeposit }: DepositPageProps) {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const depositMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, fee: '2.5%', color: 'blue' },
    { id: 'bank', name: 'Bank Transfer', icon: Building2, fee: '0%', color: 'green' },
    { id: 'crypto', name: 'Cryptocurrency', icon: DollarSign, fee: '1%', color: 'orange' },
    { id: 'mobile', name: 'Mobile Money', icon: Smartphone, fee: '1.5%', color: 'purple' },
  ];

  const quickAmounts = [100, 500, 1000, 5000, 10000];

  const handleDeposit = () => {
    const amountNum = parseFloat(amount);
    if (amountNum > 0 && selectedMethod && onDeposit) {
      onDeposit(amountNum, selectedMethod);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
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
              <DollarSign className="w-8 h-8 text-green-500" />
              Deposit Funds
            </h1>
            <p className="text-sm text-white/40 mt-1">Add funds to your trading account</p>
          </div>
        </div>

        {/* Current Balance */}
        <div className="bg-[#151619] border border-white/5 rounded-3xl p-6 mb-6">
          <p className="text-sm text-white/40 mb-2">Current Balance</p>
          <p className="text-4xl font-bold font-mono">${balance.toLocaleString()}</p>
        </div>

        {/* Amount Input */}
        <div className="bg-[#151619] border border-white/5 rounded-3xl p-6 mb-6">
          <label className="text-sm text-white/40 mb-3 block">Deposit Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-white/40">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-2xl font-bold font-mono focus:outline-none focus:border-green-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt.toString())}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
              >
                ${amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {depositMethods.map((method) => (
              <motion.button
                key={method.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMethod(method.id)}
                className={cn(
                  "p-6 rounded-2xl border transition-all text-left",
                  selectedMethod === method.id
                    ? "bg-green-500/10 border-green-500/50"
                    : "bg-[#151619] border-white/5 hover:border-white/20"
                )}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    `bg-${method.color}-500/10`
                  )}>
                    <method.icon className={cn("w-6 h-6", `text-${method.color}-500`)} />
                  </div>
                  <div>
                    <p className="font-bold">{method.name}</p>
                    <p className="text-sm text-white/40">Fee: {method.fee}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Deposit Button */}
        <button
          onClick={handleDeposit}
          disabled={!amount || !selectedMethod || parseFloat(amount) <= 0}
          className="w-full py-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl font-bold text-lg text-black hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Deposit ${amount || '0'}
        </button>
      </div>
    </div>
  );
}
