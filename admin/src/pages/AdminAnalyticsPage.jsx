import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Users,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Loader2,
  Calendar,
  Layers,
  HardDrive,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { adminDatabaseApi } from '../services/api';
import RegistrationTimelineChart from '../components/charts/RegistrationTimelineChart';
import CategoryDistributionChart from '../components/charts/CategoryDistributionChart';
import ReadinessScoreChart from '../components/charts/ReadinessScoreChart';
import FormatAndVersioningChart from '../components/charts/FormatAndVersioningChart';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      const res = await adminDatabaseApi.getAnalytics();
      if (res.data.success) {
        setData(res.data.analytics);
      }
    } catch (err) {
      console.error('Failed to load database analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-9 h-9 animate-spin text-gold-400" />
        <span className="text-xs font-mono text-mocha-400">
          Calculating registry analytics & aggregations...
        </span>
      </div>
    );
  }

  const summary = data?.summary || {};

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-mocha-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-gold-500/10 border border-gold-400/30 text-gold-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-mocha-50">
              Registry Intelligence & Analytics
            </h1>
          </div>
          <p className="text-xs text-mocha-300">
            Real-time statistical distributions, author growth, copyright readiness scores, and cryptographic activity.
          </p>
        </div>

        <button
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
          className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border border-mocha-700 bg-mocha-900/80 text-xs text-mocha-200 hover:text-gold-300 hover:border-gold-400/40 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-gold-400' : ''}`} />
          <span>{refreshing ? 'Recalculating...' : 'Refresh Analytics'}</span>
        </button>
      </div>

      {/* 2. Primary KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="p-5 rounded-2xl bg-mocha-900/60 border border-mocha-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-mocha-400 uppercase">
            <span>Registered Documents</span>
            <FileText className="w-4 h-4 text-gold-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-serif text-3xl font-bold text-gold-300">
              {summary.totalWorks || 0}
            </span>
            <span className="text-xs font-mono text-mocha-400">
              ({summary.totalVersionsCount || 0} total revisions)
            </span>
          </div>
          <span className="text-[11px] font-mono text-mocha-400 block">
            Avg {summary.avgVersionsPerWork || 1} versions per work
          </span>
        </div>

        {/* Total Authors */}
        <div className="p-5 rounded-2xl bg-mocha-900/60 border border-mocha-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-mocha-400 uppercase">
            <span>Active Authors</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-serif text-3xl font-bold text-amber-300">
              {summary.totalUsers || 0}
            </span>
            <span className="text-xs font-mono text-mocha-400">author accounts</span>
          </div>
          <span className="text-[11px] font-mono text-mocha-400 block">
            {data?.userMetrics?.avgWorksPerAuthor || 0} works / author ratio
          </span>
        </div>

        {/* AI Copyright Readiness Score */}
        <div className="p-5 rounded-2xl bg-mocha-900/60 border border-mocha-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-mocha-400 uppercase">
            <span>Readiness Quality</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-serif text-3xl font-bold text-emerald-300">
              {summary.avgReadinessScore || 0}%
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              Ready for Filing
            </span>
          </div>
          <span className="text-[11px] font-mono text-mocha-400 block">
            Evaluated against 5 statutory copyright pillars
          </span>
        </div>

        {/* Active Certificates */}
        <div className="p-5 rounded-2xl bg-mocha-900/60 border border-mocha-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-mocha-400 uppercase">
            <span>Archival Certificates</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-serif text-3xl font-bold text-blue-300">
              {summary.totalCertificates || 0}
            </span>
            <span className="text-xs font-mono text-mocha-400">issued</span>
          </div>
          <span className="text-[11px] font-mono text-mocha-400 block">
            Immutable SHA-256 binary cryptographic seals
          </span>
        </div>
      </div>

      {/* 3. Row 1 Charts: Registration Timeline & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RegistrationTimelineChart timeline={data?.registrationTimeline || []} />
        <CategoryDistributionChart categories={data?.categoryDistribution || []} />
      </div>

      {/* 4. Row 2 Chart: AI Copyright Readiness Distribution */}
      <ReadinessScoreChart readinessMetrics={data?.readinessMetrics} />

      {/* 5. Row 3 Charts: Formats, Versioning Depth, Verification Ledger */}
      <FormatAndVersioningChart
        formatDistribution={data?.formatDistribution || []}
        versionMetrics={data?.versionMetrics || {}}
        verificationMetrics={data?.verificationMetrics || {}}
        auditVelocity={data?.auditVelocity || []}
      />

      {/* 6. System Audit Velocity Activity Breakdown */}
      {data?.auditVelocity && data.auditVelocity.length > 0 && (
        <div className="p-6 rounded-3xl bg-mocha-900/70 border border-mocha-800/80 shadow-mocha-deep space-y-4">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-400/30 text-purple-400">
              <Activity className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-serif text-base font-bold text-mocha-100">
                System Audit Trail Action Velocity
              </h3>
              <p className="text-[11px] text-mocha-400">
                Tamper-evident system activity frequency by event category
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {data.auditVelocity.map((action, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-mocha-950/80 border border-mocha-800 flex items-center justify-between text-xs font-mono"
              >
                <div className="space-y-0.5 truncate mr-2">
                  <span className="text-gold-300 font-bold block truncate">{action.action}</span>
                  <span className="text-[10px] text-mocha-500">Audit ledger events</span>
                </div>
                <span className="px-2 py-1 rounded bg-mocha-900 text-mocha-200 border border-mocha-700 font-bold">
                  {action.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

