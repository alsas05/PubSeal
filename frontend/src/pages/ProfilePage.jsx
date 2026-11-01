import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  ShieldAlert,
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  KeyRound
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    if (!name.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }

    try {
      setProfileLoading(true);
      const res = await authApi.updateProfile({ name: name.trim(), bio: bio.trim() });
      if (res.data.success && res.data.user) {
        updateUser(res.data.user);
        setProfileSuccess('Profile details successfully updated.');
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword || !newPassword) {
      setPasswordError('Please provide both current and new passwords.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (res.data.success) {
        setPasswordSuccess('Password successfully updated.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-mono uppercase tracking-widest text-gold-400">
          Account Governance
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-mocha-50">
          Profile & Security Settings
        </h1>
        <p className="text-sm text-mocha-300">
          Manage your author credentials, pen identity, and authentication keys.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Profile Information Form */}
        <div className="p-8 rounded-3xl bg-mocha-900/80 border border-mocha-700/80 shadow-mocha-deep backdrop-blur-sm space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-mocha-800">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-400/30 flex items-center justify-center text-gold-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-mocha-100">Author Identity</h3>
              <p className="text-xs text-mocha-400 font-mono">Public and vault credit</p>
            </div>
          </div>

          {profileSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-200 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-xs text-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-mocha-300 mb-1.5">
                Full Name / Author Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-mocha-950 border border-mocha-700 text-mocha-100 text-sm focus:outline-none focus:border-gold-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase text-mocha-300">
                  Email Address
                </label>
                {user?.isEmailVerified ? (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Verified Author</span>
                  </span>
                ) : (
                  <Link
                    to="/register?verify=true"
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/70 text-amber-300 border border-amber-500/40 hover:bg-amber-900/60 transition-colors"
                  >
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    <span>Unverified • Verify Now</span>
                  </Link>
                )}
              </div>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl bg-mocha-950/50 border border-mocha-800 text-mocha-400 text-sm cursor-not-allowed font-mono"
              />
              <span className="text-[10px] text-mocha-400 mt-1 block">
                {user?.isEmailVerified
                  ? `Cryptographically verified on ${user.emailVerifiedAt ? new Date(user.emailVerifiedAt).toLocaleDateString() : 'Active'}.`
                  : 'Email is pending verification. Please verify to ensure full evidentiary protection.'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-mocha-300 mb-1.5">
                Author Bio / Literary Focus
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Speculative fiction author, poet, and dramatist..."
                className="w-full px-4 py-2.5 rounded-xl bg-mocha-950 border border-mocha-700 text-mocha-100 placeholder-mocha-400/50 text-sm focus:outline-none focus:border-gold-400 resize-none"
              ></textarea>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="w-full py-2.5 rounded-xl font-medium text-xs bg-gold-500 text-mocha-950 hover:bg-gold-400 transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                {profileLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-mocha-950" />
                ) : (
                  <span>Save Profile Updates</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Security & Password Change */}
        <div className="p-8 rounded-3xl bg-mocha-900/80 border border-mocha-700/80 shadow-mocha-deep backdrop-blur-sm space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-mocha-800">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-400/30 flex items-center justify-center text-gold-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-mocha-100">Security & Keys</h3>
              <p className="text-xs text-mocha-400 font-mono">Password encryption</p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-200 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-xs text-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-mocha-300 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-mocha-950 border border-mocha-700 text-mocha-100 text-sm focus:outline-none focus:border-gold-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-mocha-300 mb-1.5">
                New Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-mocha-950 border border-mocha-700 text-mocha-100 text-sm focus:outline-none focus:border-gold-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-mocha-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-mocha-950 border border-mocha-700 text-mocha-100 text-sm focus:outline-none focus:border-gold-400"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-2.5 rounded-xl font-medium text-xs bg-gold-500 text-mocha-950 hover:bg-gold-400 transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                {passwordLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-mocha-950" />
                ) : (
                  <span>Update Master Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Account Details & Session */}
      <div className="p-6 rounded-2xl bg-mocha-950/60 border border-mocha-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-mocha-400">
        <div className="flex items-center space-x-3">
          <Calendar className="w-4 h-4 text-gold-400" />
          <span>
            Member Registered: <strong className="text-mocha-200">{new Date(user?.createdAt).toLocaleDateString()}</strong>
          </span>
        </div>
        <button
          onClick={logout}
          className="text-red-400 hover:text-red-300 self-start sm:self-auto"
        >
          Sign Out of This Device
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;

