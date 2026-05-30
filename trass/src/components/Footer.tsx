import React from 'react';
import { Activity, ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 pt-16 pb-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Activity className="text-black w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">TradeX</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Professional demo trading platform for Crypto, Forex, Commodities, and Stocks. Master the markets without the risk.
            </p>
          </div>

          {/* Markets Section */}
          <div>
            <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-widest">Markets</h4>
            <div className="w-1 h-1 bg-orange-500 rounded-full mb-6" />
            <ul className="space-y-4 text-sm text-white/40">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Cryptocurrency</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Forex</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Commodities</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Stocks</a></li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-widest">Company</h4>
            <div className="w-1 h-1 bg-orange-500 rounded-full mb-6" />
            <ul className="space-y-4 text-sm text-white/40">
              <li><a href="#" className="hover:text-orange-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-widest">Legal</h4>
            <div className="w-1 h-1 bg-orange-500 rounded-full mb-6" />
            <ul className="space-y-4 text-sm text-white/40">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Risk Disclosure</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-white/20 uppercase tracking-widest font-mono">
            © 2026 TRADEX. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-mono">
            <ShieldAlert className="w-3 h-3 text-orange-500" />
            <span>DEMO TRADING ONLY. NO REAL MONEY INVOLVED. PAST PERFORMANCE DOES NOT GUARANTEE FUTURE RESULTS.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
