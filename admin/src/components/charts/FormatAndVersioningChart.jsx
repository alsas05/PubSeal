import React from 'react';
import { FileCode, GitBranch, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';

export default function FormatAndVersioningChart({
  formatDistribution = [],
  versionMetrics = {},
  verificationMetrics = {},
  auditVelocity = [],
}) {
  const single = versionMetrics.singleVersionWorks || 0;
  const multi = versionMetrics.multiVersionWorks || 0;
  const totalWorks = single + multi || 1;
  const avgVersions = versionMetrics.avgVersionsPerWork || 1;

  const verifTotal = verificationMetrics.totalVerifications || 0;
  const verifBreakdown = verificationMetrics.breakdown || { exactMatch: 0, versionMatch: 0, noMatch: 0 };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. File Formats */}
      <div className="p-6 rounded-3xl bg-mocha-900/70 border border-mocha-800/80 shadow-mocha-deep space-y-4">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 rounded-xl bg-gold-500/10 border border-gold-400/30 text-gold-400">
            <FileCode className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-serif text-sm font-bold text-mocha-100">
              Manuscript File Formats
            </h3>
            <p className="text-[10px] text-mocha-400">
              Format composition of registered drafts
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {formatDistribution.map((fmt, idx) => (
            <div key={idx} className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="font-bold text-mocha-200">.{fmt.format} Manuscript</span>
                <span className="text-gold-300 font-semibold">{fmt.count} files ({fmt.percentage}%)</span>
              </div>
              <div className="w-full bg-mocha-950 rounded-full h-2 overflow-hidden border border-mocha-800">
                <div
                  className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full"
                  style={{ width: `${fmt.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Versioning Depth */}
      <div className="p-6 rounded-3xl bg-mocha-900/70 border border-mocha-800/80 shadow-mocha-deep space-y-4">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400">
            <GitBranch className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-serif text-sm font-bold text-mocha-100">
              Draft Revision Velocity
            </h3>
            <p className="text-[10px] text-mocha-400">
              Multi-version draft revisions depth
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs font-mono p-3 rounded-xl bg-mocha-950 border border-mocha-800">
            <span className="text-mocha-300">Avg Versions/Work:</span>
            <span className="font-serif text-base font-bold text-gold-300">{avgVersions}x revisions</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-mocha-950/60 border border-mocha-800/80 space-y-1">
              <span className="text-[10px] text-mocha-400 block uppercase">Single Version</span>
              <span className="text-base font-bold text-mocha-200">{single} works</span>
              <span className="text-[10px] text-mocha-500 block">Initial draft</span>
            </div>
            <div className="p-3 rounded-xl bg-mocha-950/60 border border-mocha-800/80 space-y-1">
              <span className="text-[10px] text-mocha-400 block uppercase">Multi-Version</span>
              <span className="text-base font-bold text-emerald-300">{multi} works</span>
              <span className="text-[10px] text-mocha-500 block">Revised commits</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Verification Ledger Integrity */}
      <div className="p-6 rounded-3xl bg-mocha-900/70 border border-mocha-800/80 shadow-mocha-deep space-y-4">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-400/30 text-blue-400">
            <ShieldAlert className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-serif text-sm font-bold text-mocha-100">
              Verification Ledger Audits
            </h3>
            <p className="text-[10px] text-mocha-400">
              Public verification lookups & checks
            </p>
          </div>
        </div>

        <div className="space-y-2.5 pt-1 text-xs font-mono">
          <div className="flex items-center justify-between p-2 rounded-lg bg-mocha-950 border border-mocha-800">
            <span className="text-mocha-300">Total Checks:</span>
            <span className="font-bold text-gold-300">{verifTotal} verifications</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-mocha-950/60 border border-mocha-800">
            <span className="text-emerald-400">Exact Match:</span>
            <span className="text-mocha-200 font-bold">{verifBreakdown.exactMatch}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-mocha-950/60 border border-mocha-800">
            <span className="text-gold-400">Version Match:</span>
            <span className="text-mocha-200 font-bold">{verifBreakdown.versionMatch}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-mocha-950/60 border border-mocha-800">
            <span className="text-mocha-400">No Match / Unknown:</span>
            <span className="text-mocha-200 font-bold">{verifBreakdown.noMatch}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

