import React, { useState } from 'react';
import { Copy, Check, Fingerprint } from 'lucide-react';

const HashBadge = ({ hash, truncate = false, showLabel = true, className = '' }) => {
  const [copied, setCopied] = useState(false);

  if (!hash) return null;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayText = truncate
    ? `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`
    : hash;

  return (
    <div className={`inline-flex flex-col space-y-1 ${className}`}>
      {showLabel && (
        <span className="text-[11px] font-mono uppercase tracking-wider text-gold-400/80 flex items-center space-x-1">
          <Fingerprint className="w-3 h-3 text-gold-400" />
          <span>SHA-256 Digital Fingerprint</span>
        </span>
      )}
      <div
        onClick={handleCopy}
        title="Click to copy full SHA-256 hash"
        className="group relative inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-mocha-900 border border-mocha-700/80 hover:border-gold-400/60 transition-all cursor-pointer shadow-sm select-all"
      >
        <span className="font-mono text-xs text-mocha-200 group-hover:text-gold-200 tracking-wider break-all">
          {displayText}
        </span>
        <button
          type="button"
          aria-label="Copy hash"
          className="p-1 rounded text-mocha-400 group-hover:text-gold-400 hover:bg-mocha-800 transition-colors shrink-0"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400 animate-scale-up" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>

        {copied && (
          <span className="absolute -top-7 right-0 px-2 py-0.5 rounded bg-emerald-900/90 text-[10px] font-mono text-emerald-200 border border-emerald-500/30">
            Copied!
          </span>
        )}
      </div>
    </div>
  );
};

export default HashBadge;

