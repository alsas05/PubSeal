import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { 
  ShieldCheck, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Sparkles,
  KeyRound,
  ExternalLink
} from 'lucide-react';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');
  const emailParam = searchParams.get('email');
  const verifiedParam = searchParams.get('verified');

  const { user, verifyEmail, resendVerification, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState(emailParam || user?.email || '');
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(verifiedParam === 'true');
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  // Resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  // Dev helper state
  const [devEmail, setDevEmail] = useState(null);

  // Input refs for 6-digit OTP fields
  const inputRefs = useRef([]);

  // Auto-verify if token is in query params
  useEffect(() => {
    if (verifiedParam === 'true') {
      setSuccess(true);
      return;
    }

    if (tokenParam) {
      handleAutoVerifyToken(tokenParam);
    }
  }, [tokenParam, verifiedParam]);

  // Keep email synced if user loads
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user]);

  // Check for dev email in local environment
  useEffect(() => {
    const fetchDevEmail = async () => {
      try {
        const res = await authApi.getDevLatestEmail();
        if (res.data?.success && res.data.email) {
          setDevEmail(res.data.email);
        }
      } catch {
        // Dev endpoint ignore
      }
    };
    fetchDevEmail();
  }, []);

  // Cooldown countdown effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleAutoVerifyToken = async (token) => {
    try {
      setLoading(true);
      setError(null);
      await verifyEmail({ token });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Token verification failed. Please try entering your 6-digit PIN manually.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (index, value) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length > 1) {
      // Handle paste of multiple digits
      const pasted = cleaned.slice(0, 6).split('');
      const newDigits = [...pinDigits];
      pasted.forEach((char, i) => {
        if (index + i < 6) newDigits[index + i] = char;
      });
      setPinDigits(newDigits);
      const nextIndex = Math.min(5, index + pasted.length);
      inputRefs.current[nextIndex]?.focus();

      // If full 6 digits filled, trigger auto-submit
      if (newDigits.every((d) => d !== '')) {
        submitPin(newDigits.join(''));
      }
      return;
    }

    const newDigits = [...pinDigits];
    newDigits[index] = cleaned;
    setPinDigits(newDigits);

    // Auto-advance to next input
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits completed
    if (cleaned && index === 5 && newDigits.every((d) => d !== '')) {
      submitPin(newDigits.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submitPin = async (codeToSubmit) => {
    const code = codeToSubmit || pinDigits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of your verification PIN.');
      return;
    }

    const targetEmail = (email || user?.email)?.trim();
    if (!targetEmail) {
      setError('Please provide your registered email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setInfoMessage(null);
      await verifyEmail({ code, email: targetEmail });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    submitPin();
  };

  const handleResend = async () => {
    const targetEmail = (email || user?.email)?.trim();
    if (!targetEmail) {
      setError('Please specify your email address to receive a fresh verification code.');
      return;
    }

    try {
      setResendLoading(true);
      setError(null);
      const res = await resendVerification({ email: targetEmail });
      setInfoMessage(res.message || 'A fresh 6-digit verification code has been dispatched.');
      setResendCooldown(60);
      
      // Update dev email preview
      if (res.devVerificationCode) {
        setDevEmail({ code: res.devVerificationCode, to: targetEmail });
      }
    } catch (err) {
      if (err.response?.data?.retryAfter) {
        setResendCooldown(err.response.data.retryAfter);
      }
      setError(err.response?.data?.message || 'Failed to resend code. Please try again shortly.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleUseDevCode = (code) => {
    const digits = code.slice(0, 6).split('');
    setPinDigits(digits);
    submitPin(code);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Crest */}
        <div className="text-center space-y-3">
          <div className="relative flex items-center justify-center mx-auto">
            <img
              src="/PubSeal_logo_gold_tight.png"
              alt="PubSeal Logo"
              className="h-24 sm:h-28 w-auto object-contain filter drop-shadow-[0_0_20px_rgba(203,159,84,0.5)]"
            />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-mocha-50">
            {success ? 'Email Verified' : 'Verify Your Email'}
          </h2>
          <p className="text-sm text-mocha-300">
            {success 
              ? 'Your cryptographic author credentials are now fully active.'
              : 'Enter the 6-digit security PIN sent to your email to activate your account.'}
          </p>
        </div>

        {/* Verification Card */}
        <div className="p-8 rounded-3xl bg-mocha-900/80 border border-mocha-700/80 shadow-mocha-deep backdrop-blur-sm space-y-6">
          {success ? (
            /* SUCCESS STATE */
            <div className="text-center space-y-6 py-4 animate-fade-in">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-400/60 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-mocha-50">
                  Verification Complete!
                </h3>
                <p className="text-xs text-mocha-300 max-w-sm mx-auto leading-relaxed">
                  Your author email <strong className="text-gold-300">{email || user?.email}</strong> is certified. You now have full access to register manuscripts, generate SHA-256 evidence certificates, and run AI Copyright Readiness evaluations.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <Link
                  to="/dashboard"
                  className="w-full py-3 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:shadow-gold-glow flex items-center justify-center space-x-2 transition-all"
                >
                  <span>Go to Author Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/register-work"
                  className="w-full py-2.5 px-4 rounded-xl font-mono text-xs border border-gold-400/40 text-gold-300 hover:bg-gold-500/10 flex items-center justify-center space-x-2 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  <span>Register a Manuscript</span>
                </Link>
              </div>
            </div>
          ) : (
            /* PIN ENTRY FORM */
            <form onSubmit={handleManualSubmit} className="space-y-6">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-xs text-red-200 flex items-start space-x-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {infoMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-200 flex items-center space-x-2.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{infoMessage}</span>
                </div>
              )}

              {/* Email Address target display */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-mocha-300">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mocha-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="author@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-mocha-950 border border-mocha-700 text-mocha-100 placeholder-mocha-400/60 focus:outline-none focus:border-gold-400 text-sm font-mono"
                  />
                </div>
              </div>

              {/* 6-Digit OTP Blocks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-mocha-300">
                    6-Digit Verification PIN
                  </label>
                  <span className="text-[10px] font-mono text-gold-400/80">
                    24h Expiration
                  </span>
                </div>

                <div className="flex justify-between gap-2 sm:gap-2.5">
                  {pinDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center font-mono text-2xl font-bold rounded-xl bg-mocha-950 border border-mocha-700 text-gold-300 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30 transition-all selection:bg-transparent"
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || pinDigits.some((d) => d === '')}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:shadow-gold-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Author Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Activate Account</span>
                  </>
                )}
              </button>

              {/* Resend Action */}
              <div className="pt-2 border-t border-mocha-800 flex items-center justify-between text-xs text-mocha-400">
                <span>Didn't receive the email?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || resendCooldown > 0}
                  className="text-gold-400 hover:text-gold-300 font-mono flex items-center space-x-1 disabled:opacity-40 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Back navigation */}
        <div className="text-center text-xs text-mocha-400">
          <Link to="/" className="text-gold-400 hover:underline">
            &larr; Return to PubSeal Home
          </Link>
          {!isAuthenticated && (
            <span className="mx-2 text-mocha-600">•</span>
          )}
          {!isAuthenticated && (
            <Link to="/login" className="text-mocha-300 hover:text-gold-300">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

