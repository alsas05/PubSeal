import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, RefreshCw, CheckCircle2, X } from 'lucide-react';

const EmailVerificationBanner = () => {
  const { user, isAuthenticated, resendVerification } = useAuth();
  const location = useLocation();

  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('pubseal_verify_banner_dismissed') === 'true';
  });
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);

  // Do not render if:
  // - Not logged in
  // - Already verified
  // - On /verify-email page
  // - Dismissed for this browser session
  if (!isAuthenticated || user?.isEmailVerified || location.pathname === '/verify-email' || dismissed) {
    return null;
  }

  const handleResend = async () => {
    try {
      setResending(true);
      setResendStatus(null);
      await resendVerification({ email: user.email });
      setResendStatus('Verification code resent! Check your inbox.');
      setTimeout(() => setResendStatus(null), 6000);
    } catch (err) {
      setResendStatus(err.response?.data?.message || 'Unable to resend verification code right now.');
      setTimeout(() => setResendStatus(null), 6000);
    } finally {
      setResending(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pubseal_verify_banner_dismissed', 'true');
  };

  return (
    <div className="relative z-30 bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-amber-950/90 border-b border-amber-600/40 text-amber-200 text-xs px-4 py-2.5 backdrop-blur-md transition-all shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center space-x-2.5 text-center sm:text-left">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Action Required:</strong> Please verify your author email (
            <span className="font-mono text-amber-100 font-semibold">{user?.email}</span>
            ) to enable formal certification and permanent evidence stamps.
          </span>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {resendStatus ? (
            <span className="text-[11px] font-mono text-emerald-300 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{resendStatus}</span>
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="font-mono text-[11px] text-amber-300 hover:text-amber-100 flex items-center space-x-1 underline decoration-amber-500/50 hover:decoration-amber-300 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
              <span>Resend PIN</span>
            </button>
          )}

          <Link
            to="/register?verify=true"
            className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 hover:text-white font-mono text-[11px] font-semibold flex items-center space-x-1 transition-all"
          >
            <span>Enter PIN</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            onClick={handleDismiss}
            className="p-1 text-amber-400 hover:text-amber-200 transition-colors"
            title="Dismiss notice for this session"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;

