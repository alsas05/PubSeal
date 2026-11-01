import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle2, X, ArrowRight, User } from 'lucide-react';

// Official High-Fidelity Google "G" Vector Icon
export const GoogleIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      fill="#34A853"
    />
    <path
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      fill="#EA4335"
    />
  </svg>
);

// Official High-Fidelity Facebook Circular Icon
export const FacebookIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#1877F2" />
    <path
      d="M16.5 12.05h-2.94v8.95h-3.7v-8.95H7.72V8.92h2.14V6.73c0-2.12 1.3-3.28 3.19-3.28.9 0 1.68.07 1.9.1v2.22h-1.3c-1.03 0-1.23.49-1.23 1.21v1.94h2.46l-.38 3.13z"
      fill="#FFFFFF"
    />
  </svg>
);

const SocialAuthButtons = ({ mode = 'login' }) => {
  const { socialLogin } = useAuth();
  const navigate = useNavigate();

  const [loadingProvider, setLoadingProvider] = useState(null);
  const [modalProvider, setModalProvider] = useState(null); // 'google' | 'facebook'
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState(null);

  const actionVerb = mode === 'register' ? 'Sign up' : 'Log in';

  const handleQuickLogin = async (provider, email, name) => {
    try {
      setLoadingProvider(provider);
      setError(null);
      await socialLogin({
        provider,
        email,
        name: name || email.split('@')[0],
        providerId: `${provider}_${Date.now()}`,
      });
      setModalProvider(null);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Failed to sign in with ${provider}`);
      setLoadingProvider(null);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    handleQuickLogin(modalProvider, customEmail.trim(), customName.trim());
  };

  return (
    <div className="space-y-3 w-full">
      {/* 1. Google Button - Themed with PubSeal Mocha & Gold Accents */}
      <button
        type="button"
        onClick={() => {
          setError(null);
          setModalProvider('google');
        }}
        disabled={!!loadingProvider}
        className="w-full py-2.5 px-4 rounded-xl border border-mocha-700/80 bg-mocha-950/70 hover:bg-mocha-900/90 hover:border-gold-400/50 text-mocha-100 hover:text-mocha-50 text-sm font-medium flex items-center justify-center space-x-3 transition-all duration-200 shadow-sm hover:shadow-[0_0_15px_rgba(203,159,84,0.12)] group disabled:opacity-50"
      >
        {loadingProvider === 'google' ? (
          <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
        ) : (
          <GoogleIcon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105" />
        )}
        <span>{actionVerb} with Google</span>
      </button>

      {/* 2. Facebook Button - Themed with PubSeal Mocha & Blue Glow */}
      <button
        type="button"
        onClick={() => {
          setError(null);
          setModalProvider('facebook');
        }}
        disabled={!!loadingProvider}
        className="w-full py-2.5 px-4 rounded-xl border border-mocha-700/80 bg-mocha-950/70 hover:bg-mocha-900/90 hover:border-[#1877F2]/60 text-mocha-100 hover:text-mocha-50 text-sm font-medium flex items-center justify-center space-x-3 transition-all duration-200 shadow-sm hover:shadow-[0_0_15px_rgba(24,119,242,0.15)] group disabled:opacity-50"
      >
        {loadingProvider === 'facebook' ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#1877F2]" />
        ) : (
          <FacebookIcon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105" />
        )}
        <span>{actionVerb} with Facebook</span>
      </button>

      {/* 3. Divider: OR CONTINUE WITH EMAIL */}
      <div className="relative flex items-center justify-center pt-3 pb-1">
        <div className="border-t border-mocha-800 w-full" />
        <span className="bg-mocha-900/90 px-3 text-[11px] font-mono uppercase text-mocha-400 tracking-wider shrink-0">
          or continue with email
        </span>
        <div className="border-t border-mocha-800 w-full" />
      </div>

      {/* 4. MODAL: Provider Account Selector Dialog */}
      {modalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-mocha-950 border border-gold-400/50 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-mocha-800">
              <div className="flex items-center space-x-2.5">
                {modalProvider === 'google' ? (
                  <GoogleIcon className="w-5 h-5" />
                ) : (
                  <FacebookIcon className="w-5 h-5" />
                )}
                <span className="font-serif text-base font-bold text-mocha-100">
                  {modalProvider === 'google' ? 'Google Account Login' : 'Facebook Login'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalProvider(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-mocha-400 hover:text-mocha-100 hover:bg-mocha-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs text-mocha-300">
                Choose an author account to continue with{' '}
                <strong className="text-gold-300">
                  {modalProvider === 'google' ? 'Google' : 'Facebook'}
                </strong>
                :
              </p>

              {/* Quick Author Account Choice */}
              <button
                type="button"
                disabled={!!loadingProvider}
                onClick={() =>
                  handleQuickLogin(
                    modalProvider,
                    'author.demo@gmail.com',
                    'Demo Author'
                  )
                }
                className="w-full p-3.5 rounded-2xl bg-mocha-900/90 border border-mocha-700/80 hover:border-gold-400/60 hover:bg-mocha-850 flex items-center justify-between transition-all group text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-400/40 flex items-center justify-center text-xs font-serif font-bold text-gold-300">
                    A
                  </div>
                  <div>
                    <div className="font-medium text-xs text-mocha-100 group-hover:text-gold-200">
                      Demo Author
                    </div>
                    <div className="text-[11px] font-mono text-mocha-400">
                      author.demo@gmail.com
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-mocha-500 group-hover:text-gold-400 transition-colors" />
              </button>
            </div>

            {/* Custom Account Form */}
            <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-mocha-800 space-y-3">
              <span className="text-[11px] font-mono uppercase text-mocha-400 block">
                Or use another account:
              </span>

              <input
                type="text"
                placeholder="Author Name (e.g. Maya Angelou)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-mocha-900 border border-mocha-700 text-mocha-100 placeholder-mocha-500 text-xs focus:outline-none focus:border-gold-400"
              />

              <input
                type="email"
                required
                placeholder={
                  modalProvider === 'google'
                    ? 'your.name@gmail.com'
                    : 'your.facebook@email.com'
                }
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-mocha-900 border border-mocha-700 text-mocha-100 placeholder-mocha-500 text-xs focus:outline-none focus:border-gold-400 font-mono"
              />

              <button
                type="submit"
                disabled={!!loadingProvider}
                className="w-full py-2.5 rounded-xl font-medium text-xs bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:shadow-gold-glow transition-all flex items-center justify-center space-x-2"
              >
                {loadingProvider ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with {modalProvider === 'google' ? 'Google' : 'Facebook'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialAuthButtons;

