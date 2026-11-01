import React from 'react';
import { Sparkles, ShieldCheck, Award } from 'lucide-react';

export default function ReadinessScoreChart({ readinessMetrics }) {
  const avgScore = readinessMetrics?.avgScore || 0;
  const tiers = readinessMetrics?.tiers || {
    exceptional: 0,
    strong: 0,
    moderate: 0,
    needsWork: 0,
  };
  const distribution = readinessMetrics?.distribution || [];

  return (
    <div className="p-6 rounded-3xl bg-mocha-900/70 border border-mocha-800/80 shadow-mocha-deep space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 rounded-xl bg-gold-500/10 border border-gold-400/30 text-gold-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-serif text-base font-bold text-mocha-100">
              AI Copyright Readiness Distribution
            </h3>
            <p className="text-[11px] text-mocha-400">
              Statutory readiness health and filing preparedness metrics across all works
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono uppercase text-mocha-400 block">Average Score</span>
          <span className="font-serif text-2xl font-bold text-emerald-400">{avgScore}%</span>
        </div>
      </div>

      {/* Tier Breakdown Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-mocha-950/80 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 uppercase">
            <span>Ready (85-100%)</span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="font-serif text-xl font-bold text-emerald-300">{tiers.exceptional}</div>
          <span className="text-[10px] text-mocha-400 block">Filing ready</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-mocha-950/80 border border-gold-400/30 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-gold-400 uppercase">
            <span>Strong (70-84%)</span>
            <Award className="w-3.5 h-3.5" />
          </div>
          <div className="font-serif text-xl font-bold text-gold-300">{tiers.strong}</div>
          <span className="text-[10px] text-mocha-400 block">Minor polish</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-mocha-950/80 border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 uppercase">
            <span>Moderate (50-69%)</span>
          </div>
          <div className="font-serif text-xl font-bold text-amber-300">{tiers.moderate}</div>
          <span className="text-[10px] text-mocha-400 block">Needs review</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-mocha-950/80 border border-red-500/30 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-red-400 uppercase">
            <span>Incomplete (&lt;50%)</span>
          </div>
          <div className="font-serif text-xl font-bold text-red-300">{tiers.needsWork}</div>
          <span className="text-[10px] text-mocha-400 block">Metadata missing</span>
        </div>
      </div>

      {/* Individual Work Readiness Scores */}
      <div className="space-y-2 pt-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-mocha-400 block">
          Individual Manuscript Scores
        </span>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {distribution.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-mocha-950/60 border border-mocha-800/80 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5 truncate mr-3">
                <span className="font-serif font-bold text-mocha-100 truncate block">
                  {item.title}
                </span>
                <span className="text-[10px] text-mocha-400 font-mono">{item.grade}</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="w-24 bg-mocha-900 rounded-full h-2 overflow-hidden border border-mocha-800">
                  <div
                    className={`h-full rounded-full ${
                      item.score >= 85
                        ? 'bg-emerald-400'
                        : item.score >= 70
                        ? 'bg-gold-400'
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-gold-300 min-w-[32px] text-right">
                  {item.score}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

