import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Lock, User as UserIcon, ArrowRight, 
  Github, Chrome, ShieldCheck, Activity,
  ChevronLeft, AlertCircle, DollarSign, Globe
} from 'lucide-react';
import Footer from './Footer';
import { 
  auth, googleProvider, githubProvider, signInWithPopup, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  updateProfile 
} from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AuthPageProps {
  onBack: () => void;
}

export default function AuthPage({ onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Sync with MongoDB backend
        await fetch(`${API}/api/users/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            displayName: name,
            photoURL: null
          })
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log('Starting Google login...');
    setLoading(true);
    setError(null);
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google login success:', result.user.email);
      
      // Sync with MongoDB backend
      await fetch(`${API}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: result.user.email,
          displayName: result.user.displayName || 'Trader',
          photoURL: result.user.photoURL
        })
      });
      
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return;
      console.error('Google login error:', err);
      setError(err.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    console.log('Starting GitHub login...');
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      console.log('GitHub login success:', result.user.email);
      
      // Sync with MongoDB backend
      await fetch(`${API}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: result.user.email,
          displayName: result.user.displayName || 'Trader',
          photoURL: result.user.photoURL
        })
      });
      
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return;
      console.error('GitHub login error:', err);
      setError(err.message || 'GitHub login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative">
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Back Button */}
      <motion.button 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="absolute top-10 right-10 z-[100] flex items-center gap-4 group"
      >
        <div className="flex flex-col items-end text-right">
          <span className="text-[8px] font-mono uppercase tracking-[0.5em] text-white/20 group-hover:text-white transition-colors">Navigation</span>
          <span className="text-[11px] font-bold tracking-tight text-white/40 group-hover:text-orange-500 transition-colors">Return to Home</span>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-orange-500/50 group-hover:bg-orange-500/10 transition-all duration-500 shadow-2xl backdrop-blur-xl">
          <ChevronLeft className="w-5 h-5 text-white/30 group-hover:text-orange-500 transition-colors rotate-180" />
        </div>
      </motion.button>

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-500/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-orange-600/5 blur-[180px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent opacity-50" />
        
        {/* Floating Particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-1 h-1 bg-orange-500 rounded-full"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 20}%`,
            }}
          />
        ))}
      </div>

      {/* Left Side - Visual/Info */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 border-r border-white/5 bg-[#080808] overflow-hidden">
        {/* Abstract Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-24">
            <motion.div 
              whileHover={{ rotate: 90 }}
              className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-2xl shadow-orange-500/20"
            >
              <Activity className="text-black w-6 h-6" />
            </motion.div>
            <div>
              <h1 className="font-bold text-2xl tracking-tighter">Rubicon <span className="text-orange-500">Liberty</span></h1>
              <p className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-mono">Terminal v1.0.4</p>
            </div>
          </div>

          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[9px] font-mono uppercase tracking-widest mb-8">
                <ShieldCheck className="w-3 h-3" />
                Institutional Grade Security
              </div>
              
              <h2 className="text-[120px] font-bold tracking-tighter leading-[0.8] mb-10">
                TRADING <br />
                <span className="text-orange-500">IS HERE.</span>
              </h2>
              
              <p className="text-xl text-white/40 max-w-lg leading-relaxed font-medium">
                Master the global markets with our high-frequency simulation engine. Zero risk, infinite potential, absolute precision.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-6 max-w-md">
              {[
                { label: 'Latency', value: '0.4ms' },
                { label: 'Liquidity', value: 'Infinite' },
                { label: 'Uptime', value: '99.99%' },
                { label: 'Support', value: '24/7' }
              ].map((stat, i) => (
                <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-2">
                  <p className="text-3xl font-bold font-mono tracking-tighter text-white">{stat.value}</p>
                  <p className="text-[11px] text-white/20 uppercase tracking-[0.3em] font-mono">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            System Operational
          </div>
        </div>

        {/* Animated Glow */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-start pt-16 pb-16 px-8 md:px-20 bg-[#0a0a0a] relative overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(249,115,22,0.02)_0%,transparent_70%)]" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-10 relative z-10"
        >
          <div className="text-center lg:text-left space-y-4">
            <div className="lg:hidden flex justify-center mb-8">
               <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20">
                <Activity className="text-black w-6 h-6" />
              </div>
            </div>
            
            <div className="space-y-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login-header' : 'signup-header'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-4xl font-bold tracking-tighter">
                    {isLogin ? 'Welcome Back' : 'Join Rubicon'}
                  </h3>
                  <p className="text-white/40 font-light text-base">
                    {isLogin ? 'Access your trading terminal' : 'Create your free simulation account'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 relative z-[100]">
                <button 
                  type="button"
                  disabled={loading}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('GOOGLE LOGIN ATTEMPT');
                    handleGoogleLogin();
                  }}
                  className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-3.5 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto cursor-pointer"
                >
                  <Chrome className="w-4 h-4 text-orange-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Google</span>
                </button>
                <button 
                  type="button"
                  disabled={loading}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('GITHUB LOGIN ATTEMPT');
                    handleGithubLogin();
                  }}
                  className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-3.5 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto cursor-pointer"
                >
                  <Github className="w-4 h-4 text-white" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">GitHub</span>
                </button>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[8px] uppercase tracking-[0.3em]">
                  <span className="bg-[#121212] px-4 text-white/20 font-mono">Or continue with email</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-2"
                  >
                    <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 ml-1">Full Name</label>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-orange-500 transition-colors" />
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-11 py-4 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all placeholder:text-white/10 text-sm"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div layout className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-orange-500 transition-colors" />
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-11 py-5 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all placeholder:text-white/10 text-sm font-mono"
                  />
                </div>
              </motion.div>

              <motion.div layout className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-orange-500 transition-colors" />
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-11 py-5 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all placeholder:text-white/10 text-sm font-mono"
                  />
                </div>
              </motion.div>

              {isLogin && (
                <motion.div layout className="flex justify-end">
                  <button type="button" className="text-[9px] text-orange-500 hover:text-orange-400 transition-colors font-mono uppercase tracking-widest">
                    Forgot Password?
                  </button>
                </motion.div>
              )}

              <motion.button
                layout
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-5 rounded-xl transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/10"
              >
                <span className="uppercase tracking-widest text-xs">
                  {loading ? 'PROCESSING...' : (isLogin ? 'SIGN IN' : 'CREATE ACCOUNT')}
                </span>
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </motion.button>
            </form>

            {/* Social logins removed from here and moved up */}

            <div className="text-center mt-10 relative z-20">
              <button
                type="button"
                onClick={() => {
                  console.log('Toggling auth mode');
                  setIsLogin(!isLogin);
                }}
                className="text-white/40 hover:text-white transition-colors text-xs group py-2 px-4 max-w-[150px] mx-auto"
              >
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <span className="text-orange-500 font-bold block mt-1 group-hover:text-orange-400 transition-colors">
                  {isLogin ? 'Sign Up Now' : 'Sign In Instead'}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>

      {/* Back Button for Mobile */}
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={onBack}
        className="lg:hidden absolute top-6 left-6 z-[100] w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md"
      >
        <ChevronLeft className="w-5 h-5 text-white/40" />
      </motion.button>

      <Footer />
    </div>
  );
}
