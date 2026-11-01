import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import SocialAuthButtons from '../components/SocialAuthButtons';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
            Sign In to PubSeal
          </h2>
          <p className="text-sm text-mocha-300">
            Access your private manuscript registry and certificates
          </p>
        </div>

        {/* Form Container */}
        <div className="p-8 rounded-2xl bg-mocha-900/80 border border-mocha-700/80 shadow-mocha-deep backdrop-blur-sm space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-xs text-red-200 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Social Authentication Options matching PubSeal theme */}
          <SocialAuthButtons mode="login" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-mocha-300 mb-1.5">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-mocha-950 border border-mocha-700 text-mocha-100 placeholder-mocha-400/60 focus:outline-none focus:border-gold-400 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase text-mocha-300">
                  Password
                </label>
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:from-gold-400 hover:to-gold-300 shadow-md shadow-gold-500/20 hover:shadow-gold-glow transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-mocha-950" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-mocha-950" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="pt-4 border-t border-mocha-800 text-center text-xs text-mocha-300">
            <span>Don't have an account yet? </span>
            <Link to="/register" className="text-gold-400 hover:text-gold-300 font-medium">
              Create an Author Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

