import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, ArrowRight, ExternalLink, Loader2, Database } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLoginPage() {
  const { loginWithPasskey } = useAdminAuth();
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!passkey.trim()) {
      setError('Please provide an administrator passkey.');
      return;
    }

    setSubmitting(true);
    const res = await loginWithPasskey(passkey);
    if (!res.success) {
      setError(res.message || 'Passkey authorization failed.');
    }
    setSubmitting(false);
  };

  const handleInstantBypass = async () => {
    setSubmitting(true);
    await loginWithPasskey('pubseal_dev_admin_2026');
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute w-[500px] h-[500px] bg-gold-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl bg-mocha-900/90 border border-mocha-700/80 p-8 sm:p-10 shadow-mocha-deep backdrop-blur-md space-y-6 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 rounded-2xl bg-gold-500/10 border border-gold-400/30 text-gold-400">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-mocha-50">
              PUB<span className="text-gold-400">SEAL</span> ADMIN
            </h1>
            <p className="text-xs font-mono uppercase tracking-widest text-gold-400/80 mt-1">
              Independent Database & Ledger Studio
            </p>
          </div>
          <p className="text-xs text-mocha-300 leading-relaxed pt-1">
            Isolated administrator web interface for querying MongoDB collections, monitoring cryptographic hashes, and exporting audits.
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 rounded-xl bg-mocha-950/80 border border-mocha-800 text-xs text-mocha-400 flex items-start space-x-2.5">
          <ShieldAlert className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
          <span>
            This web portal is isolated from the author app and restricted to engineers and system administrators.
          </span>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-xs text-red-200">
            {error}
          </div>
        )}

        {/* Passkey Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-mocha-400 mb-1.5">
              Developer / Admin Key
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-mocha-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter admin key (pubseal_dev_admin_2026)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-mocha-950/90 border border-mocha-700 text-xs font-mono text-mocha-100 placeholder-mocha-600 focus:outline-none focus:border-gold-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:from-gold-400 hover:to-gold-300 shadow-md shadow-gold-500/20 hover:shadow-gold-glow transition-all flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-mocha-950" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Enter Admin Studio</span>
                <ArrowRight className="w-4 h-4 text-mocha-950" />
              </>
            )}
          </button>
        </form>

        {/* Local Dev Instant Unlock */}
        <div className="pt-2 border-t border-mocha-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={handleInstantBypass}
            disabled={submitting}
            className="text-gold-400 hover:text-gold-300 transition-colors font-mono inline-flex items-center space-x-1"
          >
            <span>⚡ Quick Unlock (Local Dev Key)</span>
          </button>

          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mocha-400 hover:text-mocha-200 transition-colors inline-flex items-center space-x-1"
          >
            <span>User Web</span>
            <ExternalLink className="w-3 h-3 text-mocha-500" />
          </a>
        </div>
      </div>
    </div>
  );
}

