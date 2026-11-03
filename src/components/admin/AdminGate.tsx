'use client';

import { useState } from 'react';
import { Loader2, Lock, AlertTriangle } from 'lucide-react';
import { verifyAdminPassword } from '@/app/actions/auth';

// Password screen shown by admin pages before they load any data.
export function AdminGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(false);
    const result = await verifyAdminPassword(password);
    if (result.success) onAuth();
    else setError(true);
    setVerifying(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-sm shadow-sm space-y-4">
        <Lock className="w-8 h-8 text-indigo-600 mx-auto" />
        <h1 className="text-xl font-black text-center text-slate-900">Admin Access</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          aria-label="Admin password"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        {error && (
          <p className="text-red-500 text-sm text-center flex items-center justify-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Incorrect password
          </p>
        )}
        <button disabled={verifying} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">
          {verifying && <Loader2 className="w-4 h-4 animate-spin" />} Enter
        </button>
      </form>
    </div>
  );
}
