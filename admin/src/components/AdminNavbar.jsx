import React from 'react';
import { ShieldAlert, Server, LogOut, ExternalLink, Database, Activity } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminNavbar() {
  const { adminUser, logout } = useAdminAuth();

  return (
    <header className="sticky top-0 z-40 bg-mocha-950/95 backdrop-blur-md border-b border-mocha-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand & Badge */}
          <div className="flex items-center space-x-3.5">
            <div className="relative flex items-center justify-center shrink-0">
              <img
                src="/PubSeal_logo_gold_tight.png"
                alt="PubSeal Logo"
                className="h-10 sm:h-12 w-auto object-contain filter drop-shadow-[0_0_10px_rgba(203,159,84,0.35)]"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-mocha-50 leading-tight">
                  PUB<span className="text-gold-400">SEAL</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest bg-gold-500/20 text-gold-300 border border-gold-400/40">
                  ADMIN STUDIO
                </span>
              </div>
              <span className="text-[10px] tracking-widest uppercase font-mono text-mocha-400 font-medium">
                System Database & Audit Portal
              </span>
            </div>
          </div>

          {/* Right Status & Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Live Database Engine Telemetry */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-mocha-900/80 border border-mocha-800 text-xs font-mono text-mocha-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MongoDB Engine</span>
              <span className="text-mocha-500">•</span>
              <span className="text-gold-300">Port 27017</span>
            </div>

            {/* Link back to User Web (port 5173) */}
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-mocha-700 bg-mocha-900/60 text-xs text-mocha-300 hover:text-gold-300 hover:border-gold-400/40 transition-colors"
              title="Open public user web application in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
              <span className="hidden sm:inline">Open User Web</span>
            </a>

            {/* Admin Lock / Sign Out */}
            <button
              onClick={logout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-red-900/40 bg-red-950/40 text-xs text-red-300 hover:bg-red-900/40 hover:text-red-200 transition-colors font-mono"
              title="Lock Admin Portal & End Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Studio</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

