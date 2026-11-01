import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Binary, BookOpen, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-mocha-950 border-t border-mocha-800/80 text-mocha-300 pt-16 pb-12 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-mocha-800/60">
          {/* Brand & Statement */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3.5 group">
              <div className="relative flex items-center justify-center shrink-0">
                <img
                  src="/PubSeal_logo_gold_tight.png"
                  alt="PubSeal Logo"
                  className="h-12 sm:h-14 w-auto object-contain filter drop-shadow-[0_0_10px_rgba(203,159,84,0.35)] transition-transform group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-mocha-50 leading-tight">
                  PUB<span className="text-gold-400">SEAL</span>
                </span>
                <span className="text-[10px] sm:text-[11px] tracking-widest uppercase font-mono text-gold-400/80 font-medium">
                  Digital Ownership Registry
                </span>
              </div>
            </Link>
            <p className="text-sm text-mocha-300/80 max-w-md leading-relaxed">
              A secure, digital registration platform for novelists, poets, screenwriters, and researchers. 
              We calculate immutable SHA-256 digital fingerprints directly from your raw manuscript bytes, providing verifiable evidence of your creative work before public release.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono bg-mocha-900 text-gold-300 border border-gold-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
                Registry Engine v1.0 • SHA-256 Active
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-gold-400">
              Registry Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/register-work" className="hover:text-gold-300 transition-colors">
                  Register Unpublished Work
                </Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-gold-300 transition-colors">
                  Public Integrity Verification
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-gold-300 transition-colors">
                  Author Vault & Certificates
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="hover:text-gold-300 transition-colors">
                  Cryptographic Workflow
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-gold-300 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards & Philosophy */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-gold-400">
              Standards
            </h4>
            <ul className="space-y-2 text-sm text-mocha-400">
              <li className="flex items-center space-x-2">
                <Binary className="w-3.5 h-3.5 text-gold-500" />
                <span>NIST FIPS 180-4 SHA-256</span>
              </li>
              <li className="flex items-center space-x-2">
                <Lock className="w-3.5 h-3.5 text-gold-500" />
                <span>Author-Private Manuscript Storage</span>
              </li>
              <li className="flex items-center space-x-2">
                <BookOpen className="w-3.5 h-3.5 text-gold-500" />
                <span>Format Agnostic (PDF, DOCX, TXT)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Clear Evidentiary Notice & Disclaimers */}
        <div className="pt-8 space-y-4">
          <div className="p-4 rounded-xl bg-mocha-900/60 border border-mocha-800/80 text-xs text-mocha-300/80 leading-relaxed">
            <strong className="text-gold-400 font-medium">Important Legal & Evidentiary Notice: </strong>
            PubSeal records cryptographic digital registration fingerprints and server-certified timestamps for uploaded files. It serves as independent, timestamped digital evidence of the exact binary file in your possession. PubSeal is not an official government copyright office, and cryptographic registration does not constitute a judicial determination of copyright ownership or prevent unauthorized copying. Read our full{' '}
            <Link to="/terms" className="text-gold-400 hover:text-gold-300 underline font-medium">
              Terms & Conditions
            </Link>{' '}
            for complete statutory disclaimers and 100% author ownership covenants.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-mocha-400 pt-4 gap-4">
            <p>© {new Date().getFullYear()} PubSeal Digital Registry. Built for writers and creators.</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <Link to="/terms" className="hover:text-gold-300 transition-colors">
                Terms of Service
              </Link>
              <Link to="/terms#author-ownership" className="hover:text-gold-300 transition-colors">
                Author Rights (100% Owned)
              </Link>
              <Link to="/terms#vault-confidentiality" className="hover:text-gold-300 transition-colors">
                Vault Privacy
              </Link>
              <span className="hidden md:inline font-mono text-mocha-600">•</span>
              <span className="font-mono text-mocha-500">
                Private • Verifiable • Cryptographic
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

