import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  CheckCircle2,
  RefreshCw,
  KeyRound,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import SocialAuthButtons from '../components/SocialAuthButtons';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get('token');
  const initialEmail = searchParams.get('email');
  const initialVerify = searchParams.get('verify');

  const { register, verifyEmail, resendVerification, user } = useAuth();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // Step state: 'form' (enter details) | 'verify' (enter email PIN) | 'success' (verified celebration)
  const [step, setStep] = useState(initialToken || initialEmail || initialVerify === 'true' ? 'verify' : 'form');

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(initialEmail || user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Verification State
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '', '']);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState(null);

  // Auto-verify if opened with URL token
  useEffect(() => {
    if (initialToken) {
      handleAutoVerifyToken(initialToken);
    }
  }, [initialToken]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleAutoVerifyToken = async (token) => {
    try {
      setVerifyLoading(true);
      setError(null);
      await verifyEmail({ token });
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Token verification failed. Please enter your 6-digit PIN manually.');
    } finally {
      setVerifyLoading(false);
    }
  };

  // 1. Submit Registration Details -> Advance directly to Email Verification in-place
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required registration fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    if (!acceptedTerms) {
      setError('Please acknowledge the evidentiary registry notice.');
      return;
    }

    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);

      // Smoothly advance right to verification step
      setStep('verify');
      setResendCooldown(60);
      setInfoMessage(`A 6-digit verification PIN has been sent to your email (${email.trim()}). Please check your inbox or spam folder.`);
      
      // Auto-focus first PIN digit
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle 6-Digit PIN input
  const handlePinChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split('');
      const newDigits = [...pinDigits];
      pasted.forEach((char, i) => {
        if (index + i < 6) newDigits[index + i] = char;
      });
      setPinDigits(newDigits);
      const nextIdx = Math.min(5, index + pasted.length);
      inputRefs.current[nextIdx]?.focus();

      if (newDigits.every((d) => d !== '')) {
        submitVerificationPin(newDigits.join(''));
      }
      return;
    }

    const newDigits = [...pinDigits];
    newDigits[index] = cleaned;
    setPinDigits(newDigits);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (cleaned && index === 5 && newDigits.every((d) => d !== '')) {
      submitVerificationPin(newDigits.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 3. Submit PIN to activate account
  const submitVerificationPin = async (codeToSubmit) => {
    const code = codeToSubmit || pinDigits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of your verification PIN.');
      return;
    }

    try {
      setVerifyLoading(true);
      setError(null);
      setInfoMessage(null);
      await verifyEmail({ code, email: email.trim() });
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Verification failed. Please check the PIN and try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleManualVerifySubmit = (e) => {
    e.preventDefault();
    submitVerificationPin();
  };

  // 4. Resend code
  const handleResend = async () => {
    try {
      setResendLoading(true);
      setError(null);
      const res = await resendVerification({ email: email.trim() });
      setInfoMessage('A fresh verification code has been dispatched to your email.');
      setResendCooldown(60);
    } catch (err) {
      if (err.response?.data?.retryAfter) {
        setResendCooldown(err.response.data.retryAfter);
      }
      setError(err.response?.data?.message || 'Failed to resend code. Please try again shortly.');
    } finally {
      setResendLoading(false);
    }
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
            {step === 'form' && 'Create Author Account'}
            {step === 'verify' && 'Verify Your Email'}
            {step === 'success' && 'Account Activated'}
          </h2>
          <p className="text-sm text-mocha-300">
            {step === 'form' && 'Establish your cryptographic registry for unpublished manuscripts'}
            {step === 'verify' && 'Complete verification to activate your author credentials'}
            {step === 'success' && 'Your cryptographic registry is certified and ready'}
          </p>
        </div>

        {/* Wizard Container */}
        <div className="p-8 rounded-3xl bg-mocha-900/80 border border-mocha-700/80 shadow-mocha-deep backdrop-blur-sm space-y-6">
          {/* Progress Step Indicator */}
          <div className="flex items-center justify-between pb-4 border-b border-mocha-800 text-xs font-mono">
            <div className={`flex items-center space-x-1.5 ${step === 'form' ? 'text-gold-400 font-bold' : 'text-emerald-400'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 'form' ? 'bg-gold-500/20 border border-gold-400' : 'bg-emerald-500/20 border border-emerald-400'}`}>
                {step === 'form' ? '1' : '✓'}
              </div>
              <span>Author Details</span>
            </div>

            <div className="w-8 h-px bg-mocha-700"></div>

            <div className={`flex items-center space-x-1.5 ${step === 'verify' ? 'text-gold-400 font-bold' : step === 'success' ? 'text-emerald-400' : 'text-mocha-400'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 'verify' ? 'bg-gold-500/20 border border-gold-400' : step === 'success' ? 'bg-emerald-500/20 border border-emerald-400' : 'bg-mocha-800 text-mocha-400'}`}>
                {step === 'success' ? '✓' : '2'}
              </div>
              <span>Email Verification</span>
            </div>
          </div>

          {/* Feedback Alerts */}
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

          {/* ========================================================= */}
          {/* STEP 1: INITIAL REGISTRATION FORM                         */}
          {/* ========================================================= */}
          {step === 'form' && (
            <div className="space-y-4 animate-fade-in">
              <SocialAuthButtons mode="register" />

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-mocha-300 mb-1">
                  Full Name / Legal Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mocha-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Author or Pen Name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-mocha-950 border border-mocha-700 text-mocha-100 placeholder-mocha-400/60 focus:outline-none focus:border-gold-400 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-mocha-300 mb-1">
                  Email Address
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
                    placeholder="author@literaryworks.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-mocha-950 border border-mocha-700 text-mocha-100 placeholder-mocha-400/60 focus:outline-none focus:border-gold-400 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-mocha-300 mb-1">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mocha-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-mocha-950 border border-mocha-700 text-mocha-100 placeholder-mocha-400/60 focus:outline-none focus:border-gold-400 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-mocha-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mocha-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-mocha-950 border border-mocha-700 text-mocha-100 placeholder-mocha-400/60 focus:outline-none focus:border-gold-400 text-sm"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start space-x-2.5 text-xs text-mocha-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 rounded border-mocha-700 bg-mocha-950 text-gold-500 focus:ring-gold-400"
                  />
                  <span className="leading-tight">
                    I agree to the{' '}
                    <Link
                      to="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-400 hover:text-gold-300 underline underline-offset-2 font-medium inline-flex items-center space-x-0.5"
                    >
                      <span>Terms &amp; Conditions</span>
                    </Link>
                    , and I understand that PubSeal provides cryptographic digital timestamping for evidence of prior possession and does not replace statutory copyright registration with government agencies.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:from-gold-400 hover:to-gold-300 shadow-md shadow-gold-500/20 hover:shadow-gold-glow transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-mocha-950" />
                    <span>Creating Author Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 text-mocha-950" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-mocha-800 text-center text-xs text-mocha-300">
                <span>Already have an account? </span>
                <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium">
                  Sign In Here
                </Link>
              </div>
            </form>
          </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: IN-PLACE EMAIL VERIFICATION PIN ENTRY             */}
          {/* ========================================================= */}
          {step === 'verify' && (
            <form onSubmit={handleManualVerifySubmit} className="space-y-6 animate-fade-in">
              <div className="text-center space-y-1">
                <p className="text-xs text-mocha-300">
                  Please enter the 6-digit PIN sent to:
                </p>
                <div className="font-mono text-sm font-bold text-gold-300 break-all">
                  {email}
                </div>
              </div>

              {/* 6-Digit OTP Blocks */}
              <div className="space-y-2">
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

              {/* Confirm Button */}
              <button
                type="submit"
                disabled={verifyLoading || pinDigits.some((d) => d === '')}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:shadow-gold-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all shadow-md"
              >
                {verifyLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Activate Account</span>
                  </>
                )}
              </button>

              {/* Resend and Edit Details Links */}
              <div className="pt-2 border-t border-mocha-800 flex items-center justify-between text-xs text-mocha-400">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="hover:text-mocha-200 flex items-center space-x-1 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || resendCooldown > 0}
                  className="text-gold-400 hover:text-gold-300 font-mono flex items-center space-x-1 disabled:opacity-40 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${resendLoading ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 3: CELEBRATORY SUCCESS STATE                         */}
          {/* ========================================================= */}
          {step === 'success' && (
            <div className="text-center space-y-6 py-4 animate-fade-in">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-400/60 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-mocha-50">
                  Welcome to PubSeal!
                </h3>
                <p className="text-xs text-mocha-300 max-w-sm mx-auto leading-relaxed">
                  Your author email <strong className="text-gold-300">{email}</strong> is verified. You now have full access to register manuscripts, generate tamper-evident SHA-256 certificates, and track revision history.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard', { replace: true })}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:shadow-gold-glow flex items-center justify-center space-x-2 transition-all shadow-md"
                >
                  <span>Go to Author Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/register-work', { replace: true })}
                  className="w-full py-2.5 px-4 rounded-xl font-mono text-xs border border-gold-400/40 text-gold-300 hover:bg-gold-500/10 flex items-center justify-center space-x-2 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  <span>Register Your First Manuscript</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
