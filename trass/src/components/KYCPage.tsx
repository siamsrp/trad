import React, { useState, useRef } from 'react';
import { Shield, CheckCircle, Clock, XCircle, Upload, User, Calendar, Globe, CreditCard, Camera, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface KYCPageProps {
  user: any;
  kyc: any;
  onSubmit: (kyc: any) => void;
}

export default function KYCPage({ user, kyc, onSubmit }: KYCPageProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.displayName || '',
    dob: '',
    country: '',
    idType: 'passport' as 'passport' | 'national_id' | 'drivers_license',
    idNumber: '',
    idPhotoUrl: '',
    selfieUrl: '',
  });
  const idRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file); });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, field: 'idPhotoUrl' | 'selfieUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await toBase64(file);
    setForm(f => ({ ...f, [field]: b64 }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, ...form }),
      });
      const data = await res.json();
      if (res.ok) onSubmit(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Already submitted
  if (kyc) {
    return (
      <div className="max-w-lg mx-auto">
        <div className={cn('rounded-3xl border p-8 text-center space-y-4',
          kyc.status === 'approved' ? 'bg-green-500/5 border-green-500/20' :
          kyc.status === 'rejected' ? 'bg-red-500/5 border-red-500/20' :
          'bg-orange-500/5 border-orange-500/20')}>
          {kyc.status === 'approved' && <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />}
          {kyc.status === 'pending'  && <Clock className="w-16 h-16 text-orange-400 mx-auto animate-pulse" />}
          {kyc.status === 'rejected' && <XCircle className="w-16 h-16 text-red-500 mx-auto" />}
          <h3 className="text-2xl font-bold">
            {kyc.status === 'approved' ? 'KYC Verified' : kyc.status === 'pending' ? 'Under Review' : 'KYC Rejected'}
          </h3>
          <p className="text-white/50 text-sm">
            {kyc.status === 'approved' && 'Your identity has been verified. You have full access to all features.'}
            {kyc.status === 'pending' && 'Your documents are being reviewed. This usually takes 1-2 business days.'}
            {kyc.status === 'rejected' && `Your KYC was rejected. Reason: ${kyc.rejectionReason || 'Documents unclear'}`}
          </p>
          {kyc.status === 'rejected' && (
            <button onClick={() => onSubmit(null)} className="px-6 py-3 bg-orange-500 text-black rounded-2xl font-bold text-sm hover:bg-orange-400 transition-all">
              Resubmit KYC
            </button>
          )}
          <div className="text-[10px] font-mono text-white/20 mt-2">Submitted: {new Date(kyc.submittedAt).toLocaleString()}</div>
        </div>
      </div>
    );
  }

  const steps = ['Personal Info', 'Identity', 'Documents'];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto border border-orange-500/20">
          <Shield className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold">KYC Verification</h2>
        <p className="text-white/40 text-sm">Verify your identity to unlock full trading features</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
              step === i + 1 ? 'bg-orange-500 text-black' : step > i + 1 ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/30')}>
              {step > i + 1 ? <CheckCircle className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
              {s}
            </div>
            {i < 2 && <div className={cn('w-8 h-0.5 rounded-full', step > i + 1 ? 'bg-green-500/40' : 'bg-white/10')} />}
          </React.Fragment>
        ))}
      </div>

      {/* Form */}
      <div className="bg-[#151619] rounded-3xl border border-white/5 p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <h3 className="font-bold text-lg flex items-center gap-2"><User className="w-5 h-5 text-orange-500" /> Personal Information</h3>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2 block">Full Legal Name</label>
                <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="As shown on ID"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-orange-500/50 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2 block flex items-center gap-1"><Calendar className="w-3 h-3" /> Date of Birth</label>
                <input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-orange-500/50 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2 block flex items-center gap-1"><Globe className="w-3 h-3" /> Country of Residence</label>
                <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-orange-500/50 transition-colors appearance-none">
                  <option value="">Select country...</option>
                  {['Bangladesh','United States','United Kingdom','Canada','Australia','Germany','France','Japan','India','Singapore','UAE','Saudi Arabia','Pakistan','Indonesia','Malaysia','Other'].map(c => (
                    <option key={c} value={c} className="bg-[#151619]">{c}</option>
                  ))}
                </select>
              </div>
              <button onClick={() => setStep(2)} disabled={!form.fullName || !form.dob || !form.country}
                className="w-full py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-black rounded-2xl font-bold transition-all">
                Continue →
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <h3 className="font-bold text-lg flex items-center gap-2"><CreditCard className="w-5 h-5 text-orange-500" /> Identity Document</h3>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2 block">Document Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'passport', label: 'Passport' },
                    { id: 'national_id', label: 'National ID' },
                    { id: 'drivers_license', label: "Driver's License" },
                  ].map(t => (
                    <button key={t.id} onClick={() => setForm(f => ({ ...f, idType: t.id as any }))}
                      className={cn('py-3 rounded-xl text-xs font-bold border transition-all',
                        form.idType === t.id ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20')}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2 block">Document Number</label>
                <input value={form.idNumber} onChange={e => setForm(f => ({ ...f, idNumber: e.target.value }))} placeholder="Enter document number"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-orange-500/50 transition-colors" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm transition-all">← Back</button>
                <button onClick={() => setStep(3)} disabled={!form.idNumber}
                  className="flex-1 py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-black rounded-2xl font-bold transition-all">
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <h3 className="font-bold text-lg flex items-center gap-2"><Camera className="w-5 h-5 text-orange-500" /> Upload Documents</h3>
              {/* ID Photo */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2 block">ID Document Photo</label>
                <div onClick={() => idRef.current?.click()}
                  className={cn('w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all',
                    form.idPhotoUrl ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 hover:border-orange-500/40 hover:bg-orange-500/5')}>
                  {form.idPhotoUrl
                    ? <><CheckCircle className="w-8 h-8 text-green-500" /><span className="text-xs text-green-400 font-mono">Document uploaded</span></>
                    : <><Upload className="w-8 h-8 text-white/20" /><span className="text-xs text-white/30 font-mono">Click to upload ID photo</span></>}
                </div>
                <input ref={idRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e, 'idPhotoUrl')} />
              </div>
              {/* Selfie */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2 block">Selfie with ID (optional)</label>
                <div onClick={() => selfieRef.current?.click()}
                  className={cn('w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all',
                    form.selfieUrl ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 hover:border-orange-500/40 hover:bg-orange-500/5')}>
                  {form.selfieUrl
                    ? <><CheckCircle className="w-8 h-8 text-green-500" /><span className="text-xs text-green-400 font-mono">Selfie uploaded</span></>
                    : <><Camera className="w-8 h-8 text-white/20" /><span className="text-xs text-white/30 font-mono">Click to upload selfie</span></>}
                </div>
                <input ref={selfieRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e, 'selfieUrl')} />
              </div>
              <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl flex gap-3">
                <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-orange-400/80 font-mono leading-relaxed">Your documents are encrypted and stored securely. We only use them for identity verification purposes.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm transition-all">← Back</button>
                <button onClick={handleSubmit} disabled={!form.idPhotoUrl || loading}
                  className="flex-1 py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-black rounded-2xl font-bold transition-all">
                  {loading ? 'Submitting...' : 'Submit KYC ✓'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
