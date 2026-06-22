'use client';

import { useState } from 'react';
import { X, Copy, Check, Send, Loader2, CheckCircle2, Smartphone } from 'lucide-react';
import { submitUnlockRequest } from '@/app/actions/clips';

interface UnlockModalProps {
  onClose: () => void;
  price?: number;
}

const UPI_ID = 'cwaya@upi'; // TODO: Replace with your real UPI ID
const WHATSAPP_NUMBER = '917000000000'; // TODO: Replace with your WhatsApp number

export function UnlockModal({ onClose, price = 19 }: UnlockModalProps) {
  const [step, setStep] = useState<'payment' | 'verify' | 'success'>('payment');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    email: '',
    upi_ref: '',
    website_url: '',
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=${UPI_ID}%26pn=Cwaya%26am=${price}%26cu=INR%26tn=Raw+Clips+Access`;

  const handleCopy = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.website_url) return;
    if (!form.name || !form.whatsapp || !form.upi_ref) {
      setError('Saari details zaroori hain!');
      return;
    }
    setIsLoading(true);
    setError(null);
    const result = await submitUnlockRequest(form);
    setIsLoading(false);
    if (result.success) {
      setStep('success');
    } else {
      setError(result.error || 'Kuch galat hua, dobara try karo.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-2xl font-bold">🎬 Unlock All Clips</h2>
          <p className="text-indigo-100 mt-1 text-sm">Sirf ₹{price} mein unlimited high-quality raw clips!</p>
        </div>

        <div className="p-6">
          {step === 'payment' && (
            <div className="space-y-5">
              {/* Price */}
              <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                <p className="text-slate-500 text-sm">Total Amount</p>
                <p className="text-5xl font-black text-green-600 my-1">₹{price}</p>
                <p className="text-slate-400 text-xs">One-time payment • Lifetime access</p>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-slate-600 font-semibold text-sm">📱 UPI QR Code Scan Karo</p>
                <div className="bg-white border-2 border-indigo-100 rounded-2xl p-3 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="UPI QR Code" width={200} height={200} className="rounded-xl" />
                </div>
                <p className="text-xs text-slate-400">Google Pay, PhonePe, Paytm — sab kaam karega</p>
              </div>

              {/* UPI ID */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-200">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ya seedha UPI ID pe bhejo</p>
                  <p className="font-bold text-slate-800 text-lg">{UPI_ID}</p>
                </div>
                <button onClick={handleCopy} className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <button
                onClick={() => setStep('verify')}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg"
              >
                ✅ Payment Ho Gayi — Verify Karo
              </button>
            </div>
          )}

          {step === 'verify' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <p className="font-bold text-slate-800">Payment Confirm Karo</p>
                <p className="text-slate-500 text-sm">UPI reference number aur details bharein — 24 hours mein access milega</p>
              </div>

              <input
                type="text"
                placeholder="Aapka Naam *"
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              <input
                type="tel"
                placeholder="WhatsApp Number * (jahan link bhejein)"
                value={form.whatsapp}
                onChange={(e) => setForm(p => ({ ...p, whatsapp: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={form.email}
                onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input
                type="text"
                placeholder="UPI Transaction ID / Reference Number *"
                value={form.upi_ref}
                onChange={(e) => setForm(p => ({ ...p, upi_ref: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                required
              />
              {/* Honeypot */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <input type="text" value={form.website_url} onChange={(e) => setForm(p => ({ ...p, website_url: e.target.value }))} />
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('payment')} className="px-5 py-3 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 transition-all">
                  Back
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isLoading ? 'Submit ho raha hai...' : 'Submit Karo'}
                </button>
              </div>

              {/* WhatsApp link fallback */}
              <p className="text-center text-xs text-slate-400">
                Ya seedha{' '}
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Cwaya!%20Maine%20₹${price}%20pay%20kar%20diye%20hain%20raw%20clips%20ke%20liye.%20Mera%20naam%20${encodeURIComponent(form.name || 'User')}%20hai.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 font-semibold underline"
                >
                  WhatsApp pe message karo
                </a>
              </p>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-2">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Request Mili! 🎉</h3>
              <p className="text-slate-600">
                Aapka request submit ho gaya hai. <strong>24 hours ke andar</strong> aapke WhatsApp pe Drive link bheja jayega.
              </p>
              <div className="bg-indigo-50 rounded-2xl p-4 text-left space-y-2">
                <div className="flex items-center gap-2 text-indigo-700">
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <p className="text-sm font-semibold">WhatsApp number check karte rahein — aapko link milega!</p>
                </div>
              </div>
              <button onClick={onClose} className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-700 transition-all">
                Theek Hai, Close Karo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
