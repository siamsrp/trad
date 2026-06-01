import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, BarChart3, ArrowUpRight, ArrowDownRight, Search,
  Edit2, Save, X, TrendingUp, TrendingDown, DollarSign,
  RefreshCcw, Shield, Trash2, Plus, Eye, XCircle,
  Activity, Settings, ChevronUp, ChevronDown, Zap,
  PieChart as PieChartIcon, Wallet, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CandleChart from './CandleChart';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
type Tab = 'overview' | 'users' | 'transactions' | 'trades' | 'kyc' | 'market' | 'settings';

interface AdminPanelProps {
  user: any;
  mongoUser: any;
  onUserUpdate: () => void;
}

export default function AdminPanel({ user, mongoUser, onUserUpdate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [marketAssets, setMarketAssets] = useState<any[]>([]);
  const [kycList, setKycList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState(0);
  const [fundModal, setFundModal] = useState<any>(null);
  const [fundType, setFundType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [fundAmount, setFundAmount] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userTrades, setUserTrades] = useState<any[]>([]);
  const [userTxs, setUserTxs] = useState<any[]>([]);
  const [tradeFilter, setTradeFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [txFilter, setTxFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [selectedMarketAsset, setSelectedMarketAsset] = useState<any>(null);
  const [priceInput, setPriceInput] = useState('');
  const [volInput, setVolInput] = useState('');

  // Add custom coin states
  const [showAddCoin, setShowAddCoin] = useState(false);
  const [coinSymbol, setCoinSymbol] = useState('');
  const [coinName, setCoinName] = useState('');
  const [coinPrice, setCoinPrice] = useState('');
  const [coinVolatility, setCoinVolatility] = useState('');
  const [coinType, setCoinType] = useState('crypto');
  const [coinManipDir, setCoinManipDir] = useState('none');
  const [coinManipDur, setCoinManipDur] = useState('');
  const [coinManipUnit, setCoinManipUnit] = useState('minutes');

  // Trend manipulation states
  const [manipDir, setManipDir] = useState('up');
  const [manipDur, setManipDur] = useState('');
  const [manipUnit, setManipUnit] = useState('minutes');

  // Create user states
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createUserEmail, setCreateUserEmail] = useState('');
  const [createUserPassword, setCreateUserPassword] = useState('');
  const [createUserDisplayName, setCreateUserDisplayName] = useState('');
  const [createUserRole, setCreateUserRole] = useState<'user' | 'admin' | 'owner'>('user');
  const [createUserBalance, setCreateUserBalance] = useState('10000');
  const [createUserPermissions, setCreateUserPermissions] = useState<string[]>([]);

  // Permissions modal states
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedPermUser, setSelectedPermUser] = useState<any>(null);
  const [selectedPermRole, setSelectedPermRole] = useState<'user' | 'admin' | 'owner'>('admin');
  const [selectedPermList, setSelectedPermList] = useState<string[]>([]);

  // Binary Options states
  const [binaryOptions, setBinaryOptions] = useState<any[]>([]);
  const [newBinaryDuration, setNewBinaryDuration] = useState('');
  const [newBinaryLabel, setNewBinaryLabel] = useState('');
  const [newBinaryCommission, setNewBinaryCommission] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { 'x-user-email': user?.email || '' };
      const [u, t, tr, m, bo] = await Promise.all([
        fetch(`${API}/api/admin/users`, { headers }).then(r => r.json()),
        fetch(`${API}/api/admin/transactions`, { headers }).then(r => r.json()),
        fetch(`${API}/api/admin/trades`, { headers }).then(r => r.json()),
        fetch(`${API}/api/admin/market`, { headers }).then(r => r.json()),
        fetch(`${API}/api/binary/options`).then(r => r.json()),
      ]);
      if (Array.isArray(u)) setUsers(u);
      if (Array.isArray(t)) setTransactions(t);
      if (Array.isArray(tr)) setTrades(tr);
      if (Array.isArray(m)) {
        setMarketAssets(m);
        if (m.length) {
          setSelectedMarketAsset((prev: any) => {
            const found = prev ? m.find((a: any) => a.id === prev.id) : null;
            return found || m[0];
          });
        }
      }
      if (Array.isArray(bo)) setBinaryOptions(bo);
      const kycRes = await fetch(`${API}/api/admin/kyc`, { headers }).then(r => r.json());
      if (Array.isArray(kycRes)) setKycList(kycRes);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); const i = setInterval(fetchAll, 10000); return () => clearInterval(i); }, [fetchAll]);

  const updateBalance = async (id: string) => {
    await fetch(`${API}/api/users/${id}/balance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-email': user?.email || '' },
      body: JSON.stringify({ balance: newBalance })
    });
    setEditingUser(null); fetchAll();
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user and all their data?')) return;
    await fetch(`${API}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-email': user?.email || '' }
    });
    fetchAll();
  };

  const fundUser = async () => {
    const amt = parseFloat(fundAmount);
    if (!amt || amt <= 0) return;
    await fetch(`${API}/api/admin/users/${fundModal._id}/fund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-email': user?.email || '' },
      body: JSON.stringify({ type: fundType, amount: amt })
    });
    setFundModal(null); setFundAmount(''); fetchAll();
  };

  const forceCloseTrade = async (trade: any) => {
    const ep = parseFloat(prompt(`Exit price for ${trade.assetName}?`) || '0');
    if (!ep) return;
    await fetch(`${API}/api/admin/trades/${trade._id}/close`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-email': user?.email || '' },
      body: JSON.stringify({ exitPrice: ep })
    });
    fetchAll();
  };

  const reviewKyc = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    await fetch(`${API}/api/admin/kyc/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-email': user?.email || '' },
      body: JSON.stringify({ status, rejectionReason: reason || '' })
    });
    fetchAll();
  };

  const openUserDetail = async (userObj: any) => {
    setSelectedUser(userObj);
    const headers = { 'x-user-email': user?.email || '' };
    const [tr, tx] = await Promise.all([
      fetch(`${API}/api/admin/users/${userObj._id}/trades`, { headers }).then(r => r.json()),
      fetch(`${API}/api/admin/users/${userObj._id}/transactions`, { headers }).then(r => r.json()),
    ]);
    if (Array.isArray(tr)) setUserTrades(tr);
    if (Array.isArray(tx)) setUserTxs(tx);
  };

  const controlMarket = async (id: string, body: any) => {
    const res = await fetch(`${API}/api/admin/market/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-email': user?.email || '' },
      body: JSON.stringify(body)
    });
    const updated = await res.json();
    setMarketAssets(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
    setSelectedMarketAsset((prev: any) => prev?.id === id ? { ...prev, ...updated } : prev);
  };

  const handleAddCoin = async () => {
    if (!coinSymbol || !coinName || !coinPrice || !coinVolatility) {
      alert('Please fill in all listing fields.');
      return;
    }
    try {
      const res = await fetch(`${API}/api/admin/market/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-email': user?.email || '' },
        body: JSON.stringify({
          id: coinSymbol,
          name: coinName,
          price: parseFloat(coinPrice),
          volatility: parseFloat(coinVolatility),
          type: coinType,
          manipulationDirection: coinManipDir,
          manipulationDuration: parseFloat(coinManipDur) || 0,
          manipulationUnit: coinManipUnit
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Custom coin added successfully!');
        setShowAddCoin(false);
        setCoinSymbol('');
        setCoinName('');
        setCoinPrice('');
        setCoinVolatility('');
        setCoinType('crypto');
        setCoinManipDir('none');
        setCoinManipDur('');
        fetchAll();
      } else {
        alert(data.error || 'Failed to add coin');
      }
    } catch (err) {
      console.error(err);
      alert('Network error adding coin listing.');
    }
  };

  const applyManipulation = async (assetId: string) => {
    try {
      const res = await fetch(`${API}/api/admin/market/manipulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-email': user?.email || '' },
        body: JSON.stringify({
          assetId,
          direction: manipDir,
          duration: parseFloat(manipDur) || 0,
          durationUnit: manipUnit
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Manipulation update applied successfully.');
        setManipDur('');
        fetchAll();
      } else {
        alert(data.error || 'Failed to apply manipulation.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error applying trend manipulation.');
    }
  };

  const handleCreateUser = async () => {
    if (!createUserEmail || !createUserPassword || !createUserDisplayName) {
      alert('Please fill in Name, Email, and Password');
      return;
    }
    try {
      const res = await fetch(`${API}/api/admin/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          email: createUserEmail,
          password: createUserPassword,
          displayName: createUserDisplayName,
          role: createUserRole,
          permissions: createUserRole === 'admin' ? createUserPermissions : createUserRole === 'owner' ? ['manage_users', 'manage_trades', 'manage_transactions', 'manage_kyc', 'market_control', 'manage_admins'] : [],
          balance: parseFloat(createUserBalance) || 10000
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Account created successfully!');
        setShowCreateUser(false);
        setCreateUserEmail('');
        setCreateUserPassword('');
        setCreateUserDisplayName('');
        setCreateUserRole('user');
        setCreateUserPermissions([]);
        setCreateUserBalance('10000');
        fetchAll();
      } else {
        alert(data.error || 'Failed to create account');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating account');
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedPermUser) return;
    try {
      const res = await fetch(`${API}/api/admin/users/${selectedPermUser._id}/permissions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          role: selectedPermRole,
          permissions: selectedPermRole === 'admin' ? selectedPermList : selectedPermRole === 'owner' ? ['manage_users', 'manage_trades', 'manage_transactions', 'manage_kyc', 'market_control', 'manage_admins'] : []
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Permissions updated successfully!');
        setShowPermissionsModal(false);
        setSelectedPermUser(null);
        fetchAll();
      } else {
        alert(data.error || 'Failed to update permissions');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating permissions');
    }
  };

  const handleTransferOwnership = async (toUserId: string) => {
    if (!confirm('Are you absolutely sure you want to grant OWNER status to this user? They will have full system access, including managing other owners.')) return;
    try {
      const res = await fetch(`${API}/api/admin/users/transfer-ownership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({ toUserId })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Ownership granted successfully!');
        onUserUpdate();
        fetchAll();
      } else {
        alert(data.error || 'Failed to transfer ownership');
      }
    } catch (err) {
      console.error(err);
      alert('Error transferring ownership');
    }
  };

  const handleAddBinaryOption = async () => {
    if (!newBinaryDuration || !newBinaryLabel || !newBinaryCommission) {
      alert('Please fill in all binary settings fields');
      return;
    }
    try {
      const res = await fetch(`${API}/api/admin/binary/options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          duration: Number(newBinaryDuration),
          label: newBinaryLabel,
          commission: Number(newBinaryCommission)
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Binary Option added successfully!');
        setNewBinaryDuration('');
        setNewBinaryLabel('');
        setNewBinaryCommission('');
        fetchAll();
      } else {
        alert(data.error || 'Failed to add binary option');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding binary option');
    }
  };

  const handleDeleteBinaryOption = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Binary Option?')) return;
    try {
      const res = await fetch(`${API}/api/admin/binary/options/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-email': user?.email || '' }
      });
      if (res.ok) {
        alert('Binary Option deleted.');
        fetchAll();
      } else {
        alert('Failed to delete option.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting option');
    }
  };

  // Stats
  const totalBalance = users.reduce((s, u) => s + (u.balance ?? 0), 0);
  const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);
  const openTradesCount = trades.filter(t => t.status === 'open').length;
  const totalPnl = trades.filter(t => t.status === 'closed').reduce((s, t) => s + (t.profit ?? 0), 0);
  const winRate = trades.filter(t => t.status === 'closed').length > 0
    ? (trades.filter(t => t.status === 'closed' && (t.profit ?? 0) > 0).length / trades.filter(t => t.status === 'closed').length) * 100 : 0;

  const filteredUsers = users.filter(u => u.displayName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  const filteredTrades = tradeFilter === 'all' ? trades : trades.filter(t => t.status === tradeFilter);
  const filteredTxs = txFilter === 'all' ? transactions : transactions.filter(t => t.type === txFilter);

  // Chart data
  const revenueData = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((name, i) => ({
    name,
    deposits: transactions.filter(t => t.type === 'deposit' && new Date(t.timestamp).getDay() === (i+1)%7).reduce((s,t) => s+t.amount, 0),
    withdrawals: transactions.filter(t => t.type === 'withdrawal' && new Date(t.timestamp).getDay() === (i+1)%7).reduce((s,t) => s+t.amount, 0),
  }));
  const typeColors: Record<string, string> = { crypto: '#f97316', forex: '#22c55e', stock: '#3b82f6', commodity: '#eab308' };
  const tradesByType = Object.entries(
    trades.reduce((acc: Record<string, number>, t) => {
      const type = t.assetId?.includes('usd') || t.assetId?.includes('jpy') 
        ? 'forex' 
        : ['aapl','googl','tsla','nvda','amzn'].includes(t.assetId) 
          ? 'stock' 
          : ['gold','silver','oil'].includes(t.assetId) 
            ? 'commodity' 
            : 'crypto';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, Object.create(null))
  ).map(([name, value]) => ({ 
    name, 
    value, 
    color: Object.prototype.hasOwnProperty.call(typeColors, name) ? typeColors[name] : '#888' 
  }));

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: `Users (${users.length})`, icon: Users },
    { id: 'transactions', label: `Txns (${transactions.length})`, icon: DollarSign },
    { id: 'trades', label: `Trades (${trades.length})`, icon: TrendingUp },
    { id: 'kyc', label: `KYC (${kycList.filter(k=>k.status==='pending').length} pending)`, icon: Shield },
    { id: 'market', label: 'Market Control', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }} className="space-y-8 pb-12">

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tighter uppercase">Admin <span className="text-orange-500">Control</span></h2>
          <p className="text-white/40 text-xs font-mono tracking-widest uppercase flex items-center gap-2">
            <Shield className="w-3 h-3 text-orange-500" /> Full System Management
          </p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-xs font-mono text-white/40">
          <RefreshCcw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} /> Refresh
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0',
              activeTab === tab.id ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'text-white/40 hover:text-white hover:bg-white/5')}>
            <tab.icon className="w-3.5 h-3.5" />{tab.label}
          </button>
        ))}
      </motion.div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: users.length, icon: Users, color: 'blue', change: 'Registered', desc: 'All accounts' },
              { label: 'Platform Balance', value: `$${totalBalance.toLocaleString()}`, icon: Wallet, color: 'orange', change: 'Live', desc: 'Across all users' },
              { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, icon: TrendingUp, color: 'green', change: `${trades.filter(t=>t.status==='closed'&&(t.profit??0)>0).length} wins`, desc: 'Closed trades' },
              { label: 'Open Positions', value: openTradesCount, icon: Activity, color: 'purple', change: `P&L $${totalPnl.toFixed(0)}`, desc: 'Active trades' },
            ].map((s, i) => (
              <motion.div key={i} variants={itemVariants} whileHover={{ y: -4 }}
                className={cn('group relative overflow-hidden bg-[#151619] border border-white/5 p-6 rounded-3xl transition-all duration-500',
                  s.color === 'orange' ? 'hover:border-orange-500/30' : s.color === 'blue' ? 'hover:border-blue-500/30' : s.color === 'green' ? 'hover:border-green-500/30' : 'hover:border-purple-500/30')}>
                <div className={cn('absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 group-hover:opacity-40 transition-all duration-700',
                  s.color === 'orange' ? 'bg-orange-500' : s.color === 'blue' ? 'bg-blue-500' : s.color === 'green' ? 'bg-green-500' : 'bg-purple-500')} />
                <div className="flex items-center justify-between relative z-10 mb-6">
                  <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center',
                    s.color === 'orange' ? 'bg-orange-500/10 text-orange-500' : s.color === 'blue' ? 'bg-blue-500/10 text-blue-500' : s.color === 'green' ? 'bg-green-500/10 text-green-500' : 'bg-purple-500/10 text-purple-500')}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 uppercase tracking-widest">{s.change}</span>
                </div>
                <div className="relative z-10 space-y-1">
                  <p className="text-white/20 text-[10px] font-mono uppercase tracking-[0.2em]">{s.label}</p>
                  <h3 className="text-3xl font-bold font-mono tracking-tighter">{s.value}</h3>
                  <p className="text-[10px] text-white/40">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue Chart */}
            <motion.div variants={itemVariants} className="lg:col-span-8 bg-[#151619] border border-white/5 p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Platform Revenue</h3>
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-[0.3em] mt-1">Deposits vs Withdrawals</p>
                </div>
              </div>
              <div className="h-[280px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="dep" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
                      <linearGradient id="wit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff20', fontSize: 10, fontFamily: 'monospace' }} dy={10} />
                    <YAxis hide domain={['auto','auto']} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(21,22,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="deposits" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#dep)" />
                    <Area type="monotone" dataKey="withdrawals" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#wit)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Trade Distribution */}
            <motion.div variants={itemVariants} className="lg:col-span-4 bg-[#151619] border border-white/5 p-8 rounded-3xl flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold tracking-tight">Trade Types</h3>
                <PieChartIcon className="w-4 h-4 text-white/20" />
              </div>
              <div className="h-[180px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={tradesByType.length ? tradesByType : [{ name: 'No data', value: 1, color: '#333' }]} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={6} dataKey="value">
                      {(tradesByType.length ? tradesByType : [{ color: '#333' }]).map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] text-white/20 uppercase font-mono">Trades</p>
                  <p className="text-2xl font-bold font-mono">{trades.length}</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {tradesByType.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-white/60 capitalize">{item.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="bg-[#151619] border border-white/5 p-8 rounded-3xl">
              <h3 className="text-xl font-bold tracking-tight mb-6">Recent Users</h3>
              <div className="space-y-3">
                {users.slice(0, 5).map((u, i) => (
                  <div key={i} onClick={() => openUserDetail(u)} className="flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl border border-white/5 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <span className="text-orange-500 font-bold text-sm">{u.displayName?.charAt(0) || 'U'}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold">{u.displayName || 'Unknown'}</p>
                        <p className="text-[10px] text-white/30 font-mono">{u.email}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-orange-400">${u.balance?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-[#151619] border border-white/5 p-8 rounded-3xl">
              <h3 className="text-xl font-bold tracking-tight mb-6">Recent Transactions</h3>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}>
                        {tx.type === 'deposit' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold capitalize">{tx.type}</p>
                        <p className="text-[10px] text-white/30 font-mono">{new Date(tx.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <p className={cn('font-mono font-bold', tx.type === 'deposit' ? 'text-green-400' : 'text-red-400')}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* ── USERS ── */}
      {activeTab === 'users' && (
        <motion.div variants={itemVariants} className="bg-[#151619] rounded-3xl border border-white/5 p-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-1 max-w-sm">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-orange-500/50 font-mono text-sm" />
              </div>
              <span className="text-xs font-mono text-white/30 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 shrink-0">{filteredUsers.length} users</span>
            </div>
            {(mongoUser?.role === 'owner' || mongoUser?.permissions?.includes('manage_admins') || mongoUser?.permissions?.includes('manage_users') || user?.email === 'siam579214@gmail.com') && (
              <button onClick={() => setShowCreateUser(true)}
                className="flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-2xl text-xs transition-all uppercase shadow-lg shadow-orange-500/10">
                <Plus className="w-4 h-4" /> Create Account
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/30 font-mono">
                  {['User', 'Email', 'Role', 'Balance', 'Joined', 'Actions'].map(h => <th key={h} className="px-4 py-3 font-normal">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredUsers.map(u => (
                  <tr key={u._id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shrink-0">
                          <span className="text-orange-500 font-bold text-xs">{u.displayName?.charAt(0) || 'U'}</span>
                        </div>
                        <span className="text-sm font-bold truncate max-w-[100px]">{u.displayName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-white/40 font-mono">{u.email}</td>
                    <td className="px-4 py-4">
                      {u.role === 'owner' ? (
                        <span className="px-2.5 py-0.5 bg-yellow-500/15 text-yellow-500 text-[9px] font-bold rounded-full uppercase tracking-wider border border-yellow-500/25">Owner</span>
                      ) : u.role === 'admin' ? (
                        <span className="px-2.5 py-0.5 bg-orange-500/15 text-orange-400 text-[9px] font-bold rounded-full uppercase tracking-wider border border-orange-500/25">Admin</span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-blue-500/15 text-blue-400 text-[9px] font-bold rounded-full uppercase tracking-wider border border-blue-500/25">User</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {editingUser === u._id ? (
                        <div className="flex items-center gap-2">
                          <input type="number" value={newBalance} onChange={e => setNewBalance(Number(e.target.value))}
                            className="w-24 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm font-mono focus:outline-none" />
                          <button onClick={() => updateBalance(u._id)} className="p-1.5 text-green-400 hover:text-green-300"><Save className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingUser(null)} className="p-1.5 text-red-400 hover:text-red-300"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-orange-400">${u.balance?.toLocaleString()}</span>
                          {editingUser === null && (mongoUser?.role === 'owner' || mongoUser?.permissions?.includes('manage_transactions')) && (
                            <button onClick={() => { setEditingUser(u._id); setNewBalance(u.balance); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-white/20 hover:text-white"><Edit2 className="w-3 h-3" /></button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-white/30 font-mono">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openUserDetail(u)} className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl border border-blue-500/10 transition-all" title="View Details"><Eye className="w-3.5 h-3.5 text-blue-400" /></button>
                        
                        {/* Fund */}
                        {(mongoUser?.role === 'owner' || mongoUser?.permissions?.includes('manage_transactions')) && (
                          <button onClick={() => { setFundModal(u); setFundType('deposit'); setFundAmount(''); }} className="p-2 bg-green-500/10 hover:bg-green-500/20 rounded-xl border border-green-500/10 transition-all" title="Fund Account"><Plus className="w-3.5 h-3.5 text-green-400" /></button>
                        )}
                        
                        {/* Edit Permissions / Roles */}
                        {(mongoUser?.role === 'owner' || mongoUser?.permissions?.includes('manage_admins')) && (
                          <button onClick={() => {
                            setSelectedPermUser(u);
                            setSelectedPermRole(u.role || 'user');
                            setSelectedPermList(u.permissions || []);
                            setShowPermissionsModal(true);
                          }} className="p-2 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl border border-purple-500/10 transition-all" title="Manage Permissions"><Shield className="w-3.5 h-3.5 text-purple-400" /></button>
                        )}

                        {/* Transfer Ownership */}
                        {mongoUser?.role === 'owner' && u.role !== 'owner' && (
                          <button onClick={() => handleTransferOwnership(u._id)} className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-xl border border-yellow-500/10 transition-all" title="Grant Ownership"><RefreshCcw className="w-3.5 h-3.5 text-yellow-500" /></button>
                        )}

                        {/* Delete */}
                        {(mongoUser?.role === 'owner' || mongoUser?.permissions?.includes('manage_admins') || (u.role === 'user' && mongoUser?.permissions?.includes('manage_users'))) && (
                          <button onClick={() => deleteUser(u._id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/10 transition-all" title="Delete User"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── TRANSACTIONS ── */}
      {activeTab === 'transactions' && (
        <motion.div variants={itemVariants} className="bg-[#151619] rounded-3xl border border-white/5 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              {(['all','deposit','withdrawal'] as const).map(f => (
                <button key={f} onClick={() => setTxFilter(f)} className={cn('px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all', txFilter === f ? 'bg-orange-500 text-black' : 'text-white/40 hover:text-white')}>{f}</button>
              ))}
            </div>
            <div className="flex gap-6 text-xs font-mono">
              <span className="text-green-400">+${totalDeposits.toLocaleString()}</span>
              <span className="text-red-400">-${totalWithdrawals.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden">
            {filteredTxs.map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl border border-white/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}>
                    {tx.type === 'deposit' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold capitalize">{tx.type}</p>
                    <p className="text-[10px] text-white/30 font-mono">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn('font-mono font-bold', tx.type === 'deposit' ? 'text-green-400' : 'text-red-400')}>{tx.type === 'deposit' ? '+' : '-'}${tx.amount?.toLocaleString()}</p>
                  <span className="text-[9px] font-mono text-green-400/50">{tx.status || 'completed'}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── TRADES ── */}
      {activeTab === 'trades' && (
        <motion.div variants={itemVariants} className="bg-[#151619] rounded-3xl border border-white/5 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              {(['all','open','closed'] as const).map(f => (
                <button key={f} onClick={() => setTradeFilter(f)} className={cn('px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all', tradeFilter === f ? 'bg-orange-500 text-black' : 'text-white/40 hover:text-white')}>{f}</button>
              ))}
            </div>
            <div className="flex gap-6 text-xs font-mono">
              <span className="text-blue-400">Open: {openTradesCount}</span>
              <span className={totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}>P&L: {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/30 font-mono">
                  {['Asset','Type','Entry','Amount','P&L','Status','Date','Action'].map(h => <th key={h} className="px-4 py-3 font-normal">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredTrades.map((trade, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-sm font-bold">{trade.assetName}</td>
                    <td className="px-4 py-3"><span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full uppercase', trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>{trade.type}</span></td>
                    <td className="px-4 py-3 text-xs font-mono text-white/50">${trade.entryPrice?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs font-mono font-bold">${trade.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">{trade.status === 'closed' ? <span className={cn('text-xs font-mono font-bold', (trade.profit??0)>=0?'text-green-400':'text-red-400')}>{(trade.profit??0)>=0?'+':''}${(trade.profit??0).toFixed(2)}</span> : <span className="text-white/20 text-xs">—</span>}</td>
                    <td className="px-4 py-3"><span className={cn('text-[9px] font-mono px-2 py-0.5 rounded-full', trade.status==='open'?'bg-blue-500/20 text-blue-400':'bg-white/10 text-white/40')}>{trade.status}</span></td>
                    <td className="px-4 py-3 text-[10px] text-white/30 font-mono">{new Date(trade.timestamp).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{trade.status === 'open' && <button onClick={() => forceCloseTrade(trade)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/10 transition-all"><XCircle className="w-3.5 h-3.5 text-red-400" /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── KYC MANAGEMENT ── */}
      {activeTab === 'kyc' && (
        <motion.div variants={itemVariants} className="bg-[#151619] rounded-3xl border border-white/5 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">KYC Submissions</h3>
            <div className="flex gap-3 text-xs font-mono">
              <span className="text-yellow-400">{kycList.filter(k=>k.status==='pending').length} pending</span>
              <span className="text-green-400">{kycList.filter(k=>k.status==='approved').length} approved</span>
              <span className="text-red-400">{kycList.filter(k=>k.status==='rejected').length} rejected</span>
            </div>
          </div>
          <div className="space-y-3">
            {kycList.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center space-y-3 opacity-20">
                <Shield className="w-12 h-12" />
                <p className="text-[10px] font-mono uppercase tracking-widest">No KYC submissions yet</p>
              </div>
            ) : kycList.map((k, i) => (
              <div key={i} className="p-5 bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl border border-white/5 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold">{k.fullName}</p>
                      <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full uppercase',
                        k.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        k.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400')}>
                        {k.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-mono text-white/40">
                      <span>📧 {k.email}</span>
                      <span>🎂 {k.dob}</span>
                      <span>🌍 {k.country}</span>
                      <span>🪪 {k.idType?.replace('_',' ')} · {k.idNumber}</span>
                    </div>
                    {k.rejectionReason && <p className="text-xs text-red-400 mt-2 font-mono">Reason: {k.rejectionReason}</p>}
                    <p className="text-[9px] text-white/20 font-mono mt-2">Submitted: {new Date(k.submittedAt).toLocaleString()}</p>
                  </div>
                  {/* ID Photo preview */}
                  {k.idPhotoUrl && (
                    <img src={k.idPhotoUrl} alt="ID" className="w-20 h-14 object-cover rounded-xl border border-white/10 shrink-0" />
                  )}
                </div>
                {k.status === 'pending' && (
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => reviewKyc(k._id, 'approved')}
                      className="flex-1 py-2.5 bg-green-500/10 hover:bg-green-500 hover:text-black border border-green-500/30 rounded-xl text-xs font-bold text-green-400 transition-all duration-300">
                      ✓ Approve
                    </button>
                    <button onClick={() => { const r = prompt('Rejection reason:'); if (r !== null) reviewKyc(k._id, 'rejected', r); }}
                      className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/30 rounded-xl text-xs font-bold text-red-400 transition-all duration-300">
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── MARKET CONTROL ── */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Asset List */}
            <motion.div variants={itemVariants} className="lg:col-span-3 bg-[#151619] rounded-3xl border border-white/5 p-4 flex flex-col" style={{ maxHeight: '600px' }}>
              <div className="flex items-center justify-between mb-3 px-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">Assets</p>
                <button onClick={() => setShowAddCoin(true)}
                  className="flex items-center gap-1 text-[9px] font-bold font-mono text-orange-500 hover:text-orange-400 px-2 py-1 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 rounded-lg transition-all uppercase">
                  <Plus className="w-2.5 h-2.5" /> Add Coin
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide [&::-webkit-scrollbar]:hidden">
                {marketAssets.map(asset => (
                  <button key={asset.id} onClick={() => setSelectedMarketAsset(asset)}
                    className={cn('w-full px-3 py-2.5 rounded-xl border transition-all flex items-center justify-between',
                      selectedMarketAsset?.id === asset.id ? 'bg-orange-500/10 border-orange-500/40' : 'border-transparent hover:bg-white/[0.04]')}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-bold truncate">{asset.name}</span>
                      {asset.manipulation && (
                        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse shrink-0",
                          asset.manipulation.direction === 'up' ? "bg-green-400" : "bg-red-400"
                        )} />
                      )}
                    </div>
                    <span className="text-xs font-mono text-orange-400">${asset.price?.toLocaleString(undefined, { maximumFractionDigits: asset.type === 'forex' ? 4 : 2 })}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Chart + Controls */}
            <div className="lg:col-span-9 space-y-4">
              {selectedMarketAsset && (
                <>
                  {/* Price Controls */}
                  <motion.div variants={itemVariants} className="bg-[#151619] rounded-3xl border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold">{selectedMarketAsset.name}</h3>
                        <p className="text-3xl font-mono font-bold text-orange-400 mt-1">${selectedMarketAsset.price?.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => controlMarket(selectedMarketAsset.id, { direction: 'up' })}
                          className="flex items-center gap-2 px-5 py-3 bg-green-500/10 hover:bg-green-500 hover:text-black border border-green-500/30 rounded-2xl text-sm font-bold text-green-400 transition-all duration-300">
                          <ChevronUp className="w-4 h-4" /> Pump +0.5%
                        </button>
                        <button onClick={() => controlMarket(selectedMarketAsset.id, { direction: 'down' })}
                          className="flex items-center gap-2 px-5 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/30 rounded-2xl text-sm font-bold text-red-400 transition-all duration-300">
                          <ChevronDown className="w-4 h-4" /> Dump -0.5%
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2 block">Set Price</label>
                        <div className="flex gap-2">
                          <input type="number" value={priceInput} onChange={e => setPriceInput(e.target.value)} placeholder={selectedMarketAsset.price?.toFixed(2)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-orange-500/50" />
                          <button onClick={() => { controlMarket(selectedMarketAsset.id, { price: parseFloat(priceInput) }); setPriceInput(''); }}
                            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-black rounded-xl text-xs font-bold transition-all">Set</button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2 block">Volatility</label>
                        <div className="flex gap-2">
                          <input type="number" value={volInput} onChange={e => setVolInput(e.target.value)} placeholder={selectedMarketAsset.volatility?.toString()}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-orange-500/50" />
                          <button onClick={() => { controlMarket(selectedMarketAsset.id, { volatility: parseFloat(volInput) }); setVolInput(''); }}
                            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">Set</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Quick pump/dump buttons */}
                  <motion.div variants={itemVariants} className="bg-[#151619] rounded-3xl border border-white/5 p-6">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-4">Quick Market Control</p>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {[1, 2, 5, 10, 20, 50].map(pct => (
                        <div key={pct} className="space-y-2">
                          <button onClick={() => controlMarket(selectedMarketAsset.id, { price: selectedMarketAsset.price * (1 + pct/100) })}
                            className="w-full py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-xl text-xs font-bold text-green-400 transition-all">
                            +{pct}%
                          </button>
                          <button onClick={() => controlMarket(selectedMarketAsset.id, { price: selectedMarketAsset.price * (1 - pct/100) })}
                            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs font-bold text-red-400 transition-all">
                            -{pct}%
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Trend Manipulation Settings */}
                  <motion.div variants={itemVariants} className="bg-[#151619] rounded-3xl border border-white/5 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <Zap className="w-4 h-4 text-orange-500" /> Trend Manipulation
                        </h4>
                        <p className="text-[10px] text-white/30 font-mono mt-0.5 uppercase tracking-wider">
                          Force long-term trend behavior
                        </p>
                      </div>
                      {selectedMarketAsset.manipulation ? (
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider animate-pulse",
                          selectedMarketAsset.manipulation.direction === 'up' ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                        )}>
                          ⚡ Manipulating: {selectedMarketAsset.manipulation.direction} ({selectedMarketAsset.manipulation.remainingSeconds >= 86400 ? `${Math.floor(selectedMarketAsset.manipulation.remainingSeconds / 86400)}d` : selectedMarketAsset.manipulation.remainingSeconds >= 3600 ? `${Math.floor(selectedMarketAsset.manipulation.remainingSeconds / 3600)}h` : `${Math.floor(selectedMarketAsset.manipulation.remainingSeconds / 60)}m`} left)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider text-white/20 bg-white/5 border border-white/5">
                          Trend: Normal
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-3">
                        <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-2 block">Direction</label>
                        <select value={manipDir} onChange={e => setManipDir(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500/50 cursor-pointer">
                          <option value="up" className="bg-[#151619]">Pump (Upward)</option>
                          <option value="down" className="bg-[#151619]">Dump (Downward)</option>
                          <option value="normal" className="bg-[#151619]">Release (Normal)</option>
                        </select>
                      </div>
                      
                      {manipDir !== 'normal' && (
                        <>
                          <div className="md:col-span-3">
                            <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-2 block">Duration</label>
                            <input type="number" value={manipDur} onChange={e => setManipDur(e.target.value)} placeholder="e.g. 5"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-xs focus:outline-none" />
                          </div>
                          <div className="md:col-span-3">
                            <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-2 block">Unit</label>
                            <select value={manipUnit} onChange={e => setManipUnit(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer">
                              <option value="seconds" className="bg-[#151619]">Seconds</option>
                              <option value="minutes" className="bg-[#151619]">Minutes</option>
                              <option value="hours" className="bg-[#151619]">Hours</option>
                              <option value="days" className="bg-[#151619]">Days</option>
                            </select>
                          </div>
                        </>
                      )}
                      
                      <div className={manipDir === 'normal' ? "md:col-span-9" : "md:col-span-3"}>
                        <button onClick={() => applyManipulation(selectedMarketAsset.id)}
                          className="w-full py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2">
                          <Zap className="w-3.5 h-3.5" />
                          {manipDir === 'normal' ? 'Release Control' : 'Apply Trend'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS ── */}
      {activeTab === 'settings' && (
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#151619] rounded-3xl border border-white/5 p-8">
              <h3 className="text-xl font-bold mb-6">Platform Stats</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Users', value: users.length },
                  { label: 'Total Trades', value: trades.length },
                  { label: 'Open Trades', value: openTradesCount },
                  { label: 'Total Transactions', value: transactions.length },
                  { label: 'Net Deposits', value: `$${(totalDeposits - totalWithdrawals).toLocaleString()}` },
                  { label: 'Platform P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">{item.label}</span>
                    <span className="text-sm font-mono font-bold text-white/80">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#151619] rounded-3xl border border-white/5 p-8">
              <h3 className="text-xl font-bold mb-6">Admin Info</h3>
              <div className="space-y-3">
                {[
                  { label: 'Admin Email', value: 'siam579214@gmail.com' },
                  { label: 'Access Level', value: 'Super Admin' },
                  { label: 'Backend', value: API },
                  { label: 'Database', value: 'MongoDB Atlas' },
                  { label: 'Auth', value: 'Firebase Auth' },
                  { label: 'Version', value: 'Rubicon Liberty v1.0' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">{item.label}</span>
                    <span className="text-xs font-mono text-white/60">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Binary Options Management */}
          {(mongoUser?.role === 'owner' || mongoUser?.permissions?.includes('market_control') || user?.email === 'siam579214@gmail.com') && (
            <div className="bg-[#151619] rounded-3xl border border-white/5 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Binary Option Configuration</h3>
                  <p className="text-[10px] text-white/30 font-mono mt-0.5 uppercase tracking-wider">Configure active durations and commissions</p>
                </div>
                <Zap className="w-5 h-5 text-orange-500 animate-pulse" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-2 block">Duration (seconds)</label>
                  <input type="number" value={newBinaryDuration} onChange={e => setNewBinaryDuration(e.target.value)} placeholder="e.g. 120"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-orange-500/50" />
                </div>
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-2 block">Display Label</label>
                  <input type="text" value={newBinaryLabel} onChange={e => setNewBinaryLabel(e.target.value)} placeholder="e.g. 2m"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500/50" />
                </div>
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-2 block">Commission Payout %</label>
                  <div className="flex gap-2">
                    <input type="number" value={newBinaryCommission} onChange={e => setNewBinaryCommission(e.target.value)} placeholder="e.g. 40"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-orange-500/50" />
                    <button onClick={handleAddBinaryOption}
                      className="px-5 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/10">Add</button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/20 mb-2">Active Configurations ({binaryOptions.length})</p>
                {binaryOptions.length === 0 ? (
                  <p className="text-xs text-white/30 font-mono italic">No custom binary options configured.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {binaryOptions.map(opt => (
                      <div key={opt._id} className="p-4 bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl border border-white/5 flex items-center justify-between transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <Clock className="w-4 h-4 text-orange-500" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">{opt.label}</p>
                            <p className="text-[10px] text-orange-400 font-mono">+{opt.commission}% profit</p>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteBinaryOption(opt._id)} className="p-2 bg-red-500/10 hover:bg-red-500/25 rounded-xl border border-red-500/10 transition-all hover:text-red-400 text-red-500/70" title="Delete Option">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── FUND MODAL ── */}
      {fundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#151619] rounded-3xl border border-white/10 p-8 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Fund Account</h3>
              <button onClick={() => setFundModal(null)} className="p-2 text-white/30 hover:text-white rounded-xl hover:bg-white/5 transition-all"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-white/40 font-mono mb-5 p-3 bg-white/5 rounded-xl">{fundModal.email} · ${fundModal.balance?.toLocaleString()}</p>
            <div className="flex gap-2 mb-5">
              {(['deposit','withdrawal'] as const).map(t => (
                <button key={t} onClick={() => setFundType(t)}
                  className={cn('flex-1 py-3 rounded-2xl text-xs font-bold uppercase transition-all', fundType === t ? (t==='deposit'?'bg-green-500 text-black':'bg-red-500 text-white') : 'bg-white/5 text-white/40 hover:bg-white/10')}>
                  {t}
                </button>
              ))}
            </div>
            <div className="relative mb-5">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-mono text-lg">$</span>
              <input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-8 pr-4 py-4 font-mono text-xl focus:outline-none focus:border-orange-500/50" />
            </div>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[100, 500, 1000, 5000].map(a => (
                <button key={a} onClick={() => setFundAmount(String(a))} className="py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-mono transition-all">${a.toLocaleString()}</button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setFundModal(null)} className="flex-1 py-3 bg-white/5 rounded-2xl text-xs font-bold hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={fundUser} className={cn('flex-1 py-3 rounded-2xl text-xs font-bold transition-all', fundType==='deposit'?'bg-green-500 hover:bg-green-400 text-black':'bg-red-500 hover:bg-red-400 text-white')}>
                Confirm {fundType}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── USER DETAIL DRAWER ── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#151619] rounded-t-3xl md:rounded-3xl border border-white/10 p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <span className="text-orange-500 font-bold text-lg">{selectedUser.displayName?.charAt(0) || 'U'}</span>
                </div>
                <div>
                  <p className="font-bold text-lg">{selectedUser.displayName || 'Unknown'}</p>
                  <p className="text-xs text-white/30 font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold font-mono text-orange-400">${selectedUser.balance?.toLocaleString()}</span>
                <button onClick={() => setSelectedUser(null)} className="p-2 text-white/30 hover:text-white rounded-xl hover:bg-white/5 transition-all"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-3">Trades ({userTrades.length})</p>
                <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-hide">
                  {userTrades.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-[8px] font-bold px-1.5 py-0.5 rounded uppercase', t.type==='buy'?'bg-green-500/20 text-green-400':'bg-red-500/20 text-red-400')}>{t.type}</span>
                        <span className="text-xs font-bold">{t.assetName}</span>
                      </div>
                      <span className={cn('text-xs font-mono font-bold', t.status==='open'?'text-blue-400':(t.profit??0)>=0?'text-green-400':'text-red-400')}>
                        {t.status==='open'?'OPEN':`${(t.profit??0)>=0?'+':''}$${(t.profit??0).toFixed(2)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-3">Transactions ({userTxs.length})</p>
                <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-hide">
                  {userTxs.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
                      <span className={cn('text-xs font-bold capitalize', tx.type==='deposit'?'text-green-400':'text-red-400')}>{tx.type}</span>
                      <span className={cn('text-xs font-mono font-bold', tx.type==='deposit'?'text-green-400':'text-red-400')}>{tx.type==='deposit'?'+':'-'}${tx.amount?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setSelectedUser(null); setFundModal(selectedUser); setFundType('deposit'); setFundAmount(''); }}
                className="flex-1 py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-2xl text-xs font-bold text-green-400 transition-all flex items-center justify-center gap-2">
                <Plus className="w-3.5 h-3.5" /> Fund Account
              </button>
              <button onClick={() => { deleteUser(selectedUser._id); setSelectedUser(null); }}
                className="py-3 px-5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl text-xs font-bold text-red-400 transition-all">
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── ADD CUSTOM COIN MODAL ── */}
      {showAddCoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#151619] rounded-3xl border border-white/10 p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-500" /> Add Custom Coin Listing
              </h3>
              <button onClick={() => setShowAddCoin(false)} className="p-2 text-white/30 hover:text-white rounded-xl hover:bg-white/5 transition-all"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-1.5 block">Coin Symbol / ID (e.g. trx)</label>
                <input type="text" value={coinSymbol} onChange={e => setCoinSymbol(e.target.value)} placeholder="e.g. trx"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-xs focus:outline-none focus:border-orange-500/50" />
              </div>

              <div>
                <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-1.5 block">Coin Name (e.g. TRON)</label>
                <input type="text" value={coinName} onChange={e => setCoinName(e.target.value)} placeholder="e.g. TRON"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500/50" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-1.5 block">Initial Price ($)</label>
                  <input type="number" value={coinPrice} onChange={e => setCoinPrice(e.target.value)} placeholder="e.g. 0.12"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-xs focus:outline-none focus:border-orange-500/50" />
                </div>
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-1.5 block">Volatility ($ change/s)</label>
                  <input type="number" value={coinVolatility} onChange={e => setCoinVolatility(e.target.value)} placeholder="e.g. 0.005"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-xs focus:outline-none focus:border-orange-500/50" />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-1.5 block">Market Category</label>
                <select value={coinType} onChange={e => setCoinType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500/50 cursor-pointer">
                  <option value="crypto" className="bg-[#151619]">Cryptocurrency</option>
                  <option value="stock" className="bg-[#151619]">Stock</option>
                  <option value="metals" className="bg-[#151619]">Metals</option>
                  <option value="energy" className="bg-[#151619]">Energy</option>
                  <option value="forex" className="bg-[#151619]">Forex (Currency)</option>
                </select>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 font-bold">Trend Manipulation on Launch</p>
                <div className="grid grid-cols-3 gap-2">
                  {['none', 'up', 'down'].map(dir => (
                    <button key={dir} type="button" onClick={() => setCoinManipDir(dir)}
                      className={cn("py-2 rounded-xl text-[10px] font-bold font-mono uppercase border transition-all",
                        coinManipDir === dir ? "bg-orange-500 border-orange-500 text-black shadow-lg shadow-orange-500/10" : "bg-white/5 border-transparent text-white/40 hover:text-white"
                      )}>
                      {dir}
                    </button>
                  ))}
                </div>

                {coinManipDir !== 'none' && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="text-[9px] font-mono text-white/30 block mb-1">Duration</label>
                      <input type="number" value={coinManipDur} onChange={e => setCoinManipDur(e.target.value)} placeholder="5"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 font-mono text-xs focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-white/30 block mb-1">Unit</label>
                      <select value={coinManipUnit} onChange={e => setCoinManipUnit(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none cursor-pointer">
                        <option value="seconds">Seconds</option>
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddCoin(false)} className="flex-1 py-3 bg-white/5 rounded-2xl text-xs font-bold hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={handleAddCoin} className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 text-black rounded-2xl text-xs font-bold transition-all shadow-lg shadow-orange-500/20">
                Add Coin Listing
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── CREATE USER MODAL ── */}
      {showCreateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#151619] rounded-3xl border border-white/10 p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-hide">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2 text-orange-500 uppercase font-mono tracking-wide">
                <Plus className="w-5 h-5" /> Create Account
              </h3>
              <button onClick={() => setShowCreateUser(false)} className="p-2 text-white/30 hover:text-white rounded-xl hover:bg-white/5 transition-all"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-1.5 block">Full Name / Display Name</label>
                <input type="text" value={createUserDisplayName} onChange={e => setCreateUserDisplayName(e.target.value)} placeholder="e.g. John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500/50" />
              </div>

              <div>
                <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-1.5 block">Email Address</label>
                <input type="email" value={createUserEmail} onChange={e => setCreateUserEmail(e.target.value)} placeholder="e.g. user@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-orange-500/50" />
              </div>

              <div>
                <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-1.5 block">Initial Password</label>
                <input type="password" value={createUserPassword} onChange={e => setCreateUserPassword(e.target.value)} placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500/50" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-1.5 block">Account Role</label>
                  <select value={createUserRole} onChange={e => {
                    const r = e.target.value as any;
                    setCreateUserRole(r);
                    if (r === 'owner') {
                      setCreateUserPermissions(['manage_users', 'manage_trades', 'manage_transactions', 'manage_kyc', 'market_control', 'manage_admins']);
                    } else if (r === 'user') {
                      setCreateUserPermissions([]);
                    }
                  }}
                    className="w-full bg-[#0d0d0f] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500/50 cursor-pointer appearance-none">
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                    {mongoUser?.role === 'owner' && <option value="owner">System Owner</option>}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-1.5 block">Initial Balance ($)</label>
                  <input type="number" value={createUserBalance} onChange={e => setCreateUserBalance(e.target.value)} placeholder="10000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-orange-500/50" />
                </div>
              </div>

              {createUserRole === 'admin' && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 font-bold">Admin Permissions</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'manage_users', label: 'Manage Users' },
                      { id: 'manage_trades', label: 'Manage Trades' },
                      { id: 'manage_transactions', label: 'Manage Txns' },
                      { id: 'manage_kyc', label: 'Manage KYC' },
                      { id: 'market_control', label: 'Market Control' },
                      { id: 'manage_admins', label: 'Manage Admins' },
                    ].map(p => {
                      const active = createUserPermissions.includes(p.id);
                      return (
                        <button key={p.id} type="button"
                          onClick={() => {
                            if (active) {
                              setCreateUserPermissions(prev => prev.filter(x => x !== p.id));
                            } else {
                              setCreateUserPermissions(prev => [...prev, p.id]);
                            }
                          }}
                          className={cn("py-2 px-3 rounded-xl text-[10px] text-left font-semibold border transition-all flex items-center justify-between",
                            active ? "bg-orange-500/10 border-orange-500/50 text-orange-400" : "bg-[#0d0d0f] border-transparent text-white/40 hover:text-white"
                          )}>
                          <span>{p.label}</span>
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 ml-1.5", active ? "bg-orange-500 animate-pulse" : "bg-white/10")} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateUser(false)} className="flex-1 py-3 bg-white/5 rounded-2xl text-xs font-bold hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={handleCreateUser} className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 text-black rounded-2xl text-xs font-bold transition-all shadow-lg shadow-orange-500/20">
                Create Account
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── PERMISSIONS MODAL ── */}
      {showPermissionsModal && selectedPermUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#151619] rounded-3xl border border-white/10 p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-hide">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2 text-purple-400 uppercase font-mono tracking-wide">
                <Shield className="w-5 h-5" /> Edit Access Control
              </h3>
              <button onClick={() => { setShowPermissionsModal(false); setSelectedPermUser(null); }} className="p-2 text-white/30 hover:text-white rounded-xl hover:bg-white/5 transition-all"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-white/60 font-mono">
                <p className="font-bold text-white text-sm">{selectedPermUser.displayName || 'Trader'}</p>
                <p className="opacity-60">{selectedPermUser.email}</p>
              </div>

              <div>
                <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-1.5 block">Access Level Role</label>
                <select value={selectedPermRole} onChange={e => {
                  const r = e.target.value as any;
                  setSelectedPermRole(r);
                  if (r === 'owner') {
                    setSelectedPermList(['manage_users', 'manage_trades', 'manage_transactions', 'manage_kyc', 'market_control', 'manage_admins']);
                  } else if (r === 'user') {
                    setSelectedPermList([]);
                  }
                }}
                  className="w-full bg-[#0d0d0f] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50 cursor-pointer appearance-none">
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                  {mongoUser?.role === 'owner' && <option value="owner">System Owner</option>}
                </select>
              </div>

              {selectedPermRole === 'admin' && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 font-bold">Admin Permissions</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'manage_users', label: 'Manage Users' },
                      { id: 'manage_trades', label: 'Manage Trades' },
                      { id: 'manage_transactions', label: 'Manage Txns' },
                      { id: 'manage_kyc', label: 'Manage KYC' },
                      { id: 'market_control', label: 'Market Control' },
                      { id: 'manage_admins', label: 'Manage Admins' },
                    ].map(p => {
                      const active = selectedPermList.includes(p.id);
                      return (
                        <button key={p.id} type="button"
                          onClick={() => {
                            if (active) {
                              setSelectedPermList(prev => prev.filter(x => x !== p.id));
                            } else {
                              setSelectedPermList(prev => [...prev, p.id]);
                            }
                          }}
                          className={cn("py-2 px-3 rounded-xl text-[10px] text-left font-semibold border transition-all flex items-center justify-between",
                            active ? "bg-purple-500/10 border-purple-500/50 text-purple-400" : "bg-[#0d0d0f] border-transparent text-white/40 hover:text-white"
                          )}>
                          <span>{p.label}</span>
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 ml-1.5", active ? "bg-purple-500 animate-pulse" : "bg-white/10")} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowPermissionsModal(false); setSelectedPermUser(null); }} className="flex-1 py-3 bg-white/5 rounded-2xl text-xs font-bold hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={handleSavePermissions} className="flex-1 py-3 bg-purple-500 hover:bg-purple-400 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-purple-500/20">
                Save Access
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
