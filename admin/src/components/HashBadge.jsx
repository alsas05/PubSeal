import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function HashBadge({ hash, truncate = true, showLabel = true }) {
  const [copied, setCopied] = useState(false);

  if (!hash) return <span className="text-mocha-500 font-mono text-xs">N/A</span>;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayHash = truncate
    ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`
    : hash;

  return (
    <div
      onClick={handleCopy}
      title="Click to copy full SHA-256 fingerprint"
      className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-mocha-950/80 border border-mocha-800 hover:border-gold-400/50 text-gold-300 font-mono text-[11px] cursor-pointer transition-all group"
    >
      {showLabel && (
        <span className="text-[10px] text-mocha-400 font-semibold uppercase">SHA-256:</span>
      )}
      <span className="group-hover:text-gold-200">{displayHash}</span>
      {copied ? (
        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
      ) : (
        <Copy className="w-3 h-3 text-mocha-500 group-hover:text-gold-400 shrink-0" />
      )}
    </div>
  );
}

