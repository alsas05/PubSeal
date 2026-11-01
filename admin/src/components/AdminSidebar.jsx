import React from 'react';
import {
  Database,
  FileText,
  ShieldCheck,
  SearchCheck,
  History,
  Users,
  RefreshCw,
  Activity,
  Download,
  ExternalLink,
  LogOut,
  X,
  Server,
  Layers,
  HardDrive,
  Cpu,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminSidebar({
  collections = [],
  activeCollection,
  setActiveCollection,
  activeView,
  setActiveView,
  overview,
  loadingOverview,
  fetchOverview,
  handleSync,
  syncing,
  handleExportAll,
  exporting,
  mobileOpen,
  setMobileOpen,
  totalRecords,
}) {
  const { adminUser, logout } = useAdminAuth();

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Left Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-mocha-950 border-r border-mocha-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 1. Brand Header */}
        <div className="p-6 pb-4 border-b border-mocha-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center shrink-0">
              <img
                src="/PubSeal_logo_gold_tight.png"
                alt="PubSeal Logo"
                className="h-10 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(203,159,84,0.4)]"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-serif text-lg font-bold tracking-wider text-mocha-50 leading-tight">
                  PUB<span className="text-gold-400">SEAL</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-gold-500/20 text-gold-300 border border-gold-400/30">
                  ADMIN
                </span>
              </div>
              <span className="text-[10px] tracking-widest uppercase font-mono text-mocha-400">
                Database Studio
              </span>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-mocha-400 hover:text-mocha-100 hover:bg-mocha-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. MongoDB Engine Status Card */}
        <div className="px-4 py-3 border-b border-mocha-800/60 bg-mocha-900/30">
          <div className="p-3 rounded-xl bg-mocha-900/80 border border-mocha-800 text-xs font-mono space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-mocha-400">Engine Telemetry</span>
              <span className="inline-flex items-center text-[10px] text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                Online
              </span>
            </div>
            <div className="flex items-center justify-between text-mocha-300 text-[11px]">
              <span>{overview?.engine || 'MongoDB'}</span>
              <span className="text-gold-400">{overview?.host || '127.0.0.1'}:{overview?.port || 27017}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-mocha-400 pt-1 border-t border-mocha-800/80">
              <span>Total Documents:</span>
              <span className="text-gold-300 font-bold">{overview?.metrics?.totalDocuments || 0}</span>
            </div>
          </div>
        </div>

        {/* 3. Navigation Sections (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Section: Analytics & Intelligence */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-mocha-400 font-semibold block">
              Intelligence & Charts
            </span>
            <div className="pt-1">
              <button
                onClick={() => {
                  if (setActiveView) setActiveView('analytics');
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  activeView === 'analytics'
                    ? 'bg-gradient-to-r from-gold-500/25 via-gold-400/20 to-gold-500/25 text-gold-300 border border-gold-400/50 shadow-md shadow-gold-500/15'
                    : 'text-mocha-300 hover:text-mocha-100 hover:bg-mocha-900/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <BarChart3 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Analytics & Graphs</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold-500/20 text-gold-300 border border-gold-400/40">
                  Live
                </span>
              </button>
            </div>
          </div>

          {/* Section: Collections */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-mocha-400 font-semibold block">
              Database Collections
            </span>
            <nav className="space-y-1 pt-1">
              {collections.map((col) => {
                const Icon = col.icon;
                const isActive = activeView === 'tables' && activeCollection === col.id;
                const collMeta = overview?.collections?.find((c) => c.name === col.id);
                const count = collMeta?.documentCount ?? (activeCollection === col.id ? totalRecords : '');

                return (
                  <button
                    key={col.id}
                    onClick={() => {
                      if (setActiveView) setActiveView('tables');
                      setActiveCollection(col.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-gold-500/20 via-gold-400/15 to-gold-500/20 text-gold-300 border border-gold-400/40 shadow-sm shadow-gold-500/10'
                        : 'text-mocha-300 hover:text-mocha-100 hover:bg-mocha-900/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${col.color || 'text-gold-400'}`} />
                      <span>{col.label}</span>
                    </div>
                    {count !== '' && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-gold-500/20 text-gold-300 border border-gold-400/40'
                            : 'bg-mocha-900 text-mocha-400 border border-mocha-800'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section: System Actions */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-mocha-400 font-semibold block">
              System Operations
            </span>
            <div className="space-y-1 pt-1">
              <button
                onClick={fetchOverview}
                disabled={loadingOverview}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-mocha-300 hover:text-gold-300 hover:bg-mocha-900/60 transition-colors"
                title="Refresh database connection and collection counts"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-mocha-400 ${loadingOverview ? 'animate-spin text-gold-400' : ''}`} />
                <span>Refresh Telemetry</span>
              </button>

              <button
                onClick={handleSync}
                disabled={syncing}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-mocha-300 hover:text-gold-300 hover:bg-mocha-900/60 transition-colors"
                title="Verify and generate official Certificate documents for all works"
              >
                <Activity className="w-3.5 h-3.5 text-mocha-400" />
                <span>{syncing ? 'Syncing...' : 'Sync Certificates'}</span>
              </button>

              <button
                onClick={handleExportAll}
                disabled={exporting}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-mocha-300 hover:text-gold-300 hover:bg-mocha-900/60 transition-colors"
                title="Download complete JSON snapshot of all collections"
              >
                <Download className="w-3.5 h-3.5 text-gold-400" />
                <span>{exporting ? 'Exporting...' : 'Full DB Backup (.JSON)'}</span>
              </button>
            </div>
          </div>

          {/* Section: External Link */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-mocha-400 font-semibold block">
              Applications
            </span>
            <div className="pt-1">
              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-mocha-300 hover:text-gold-300 hover:bg-mocha-900/60 transition-colors group"
                title="Open user-facing author application on port 5173"
              >
                <div className="flex items-center space-x-2.5">
                  <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
                  <span>Open User Web</span>
                </div>
                <span className="text-[10px] font-mono text-mocha-500 group-hover:text-gold-400">:5173</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4. Bottom Admin Profile & Lock Console */}
        <div className="p-4 border-t border-mocha-800/80 bg-mocha-900/40 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-400/40 flex items-center justify-center text-xs font-bold text-gold-300 font-mono">
              DA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-mocha-100 truncate">
                {adminUser?.name || 'Developer Admin'}
              </p>
              <p className="text-[10px] font-mono text-gold-400/80 truncate">
                Role: Administrator
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border border-red-900/40 bg-red-950/30 text-xs text-red-300 hover:bg-red-900/40 hover:text-red-200 transition-colors font-mono"
            title="Lock administrative studio and end session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Studio</span>
          </button>
        </div>
      </aside>
    </>
  );
}

