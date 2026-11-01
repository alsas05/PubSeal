import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  Copy,
  Check,
  Download,
  RefreshCw,
  Edit3,
  Award,
  BookOpen,
  UserCheck,
  Scale,
  BrainCircuit,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { worksApi } from '../services/api';

/**
 * AI Copyright Readiness Evaluation Component
 * Evaluates uploaded works against statutory copyright registration criteria
 * (U.S. Copyright Office Form TX / eCO, UK IPO, and international copyright conventions)
 */
export default function CopyrightReadinessView({ work, onWorkUpdated }) {
  const readiness = work.copyrightReadiness || {};
  const score = typeof readiness.score === 'number' ? readiness.score : 0;
  const grade = readiness.grade || 'Needs Review';
  const breakdown = readiness.breakdown || {};
  const recommendations = readiness.recommendations || [];
  const checklist = readiness.checklist || [];
  const metrics = readiness.manuscriptMetrics || {};
  const dossier = readiness.filingDossier || {};

  // Local state
  const [activeSeverityTab, setActiveSeverityTab] = useState('all');
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [downloadingDossier, setDownloadingDossier] = useState(false);
  const [reEvaluating, setReEvaluating] = useState(false);
  const [reEvalSuccess, setReEvalSuccess] = useState(false);

  // Edit metadata form state
  const [formData, setFormData] = useState({
    yearCompleted: work.yearCompleted || new Date().getFullYear(),
    publicationStatus: work.publicationStatus || 'unpublished',
    natureOfAuthorship: work.natureOfAuthorship || 'Entire text',
    isPseudonymous: !!work.isPseudonymous,
    pseudonym: work.pseudonym || '',
    isWorkMadeForHire: !!work.isWorkMadeForHire,
    humanAuthorshipCertified: work.humanAuthorshipCertified !== false,
    aiContentDisclosed: !!work.aiContentDisclosed,
    aiDisclosureDetails: work.aiDisclosureDetails || '',
    preexistingMaterialExcluded: work.preexistingMaterialExcluded || '',
  });

  // Grade color helper
  const getGradeStyle = (g) => {
    switch (g) {
      case 'Ready for Filing':
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          text: 'text-emerald-400',
          ring: '#10b981',
          bgGlow: 'shadow-[0_0_50px_rgba(16,185,129,0.18)]',
        };
      case 'Good Preparation':
        return {
          badge: 'bg-gold-500/20 text-gold-300 border-gold-400/40',
          text: 'text-gold-400',
          ring: '#cb9f54',
          bgGlow: 'shadow-[0_0_50px_rgba(203,159,84,0.18)]',
        };
      case 'Needs Review':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          text: 'text-amber-400',
          ring: '#f59e0b',
          bgGlow: 'shadow-[0_0_50px_rgba(245,158,11,0.18)]',
        };
      default:
        return {
          badge: 'bg-red-500/20 text-red-300 border-red-500/40',
          text: 'text-red-400',
          ring: '#ef4444',
          bgGlow: 'shadow-[0_0_50px_rgba(239,68,68,0.18)]',
        };
    }
  };

  const gradeStyle = getGradeStyle(grade);

  // SVG Circular Radial Gauge Math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Filter recommendations
  const filteredRecs = recommendations.filter((r) => {
    if (activeSeverityTab === 'all') return true;
    return r.severity === activeSeverityTab;
  });

  // Copy helper
  const handleCopy = (text, fieldKey) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2200);
  };

  // Download dossier TXT
  const handleDownloadDossier = async () => {
    try {
      setDownloadingDossier(true);
      const res = await worksApi.downloadFilingDossier(work._id);
      const blob = new Blob([res.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PubSeal-Copyright-Dossier-${work.registrationId}.txt`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download dossier:', err);
      alert('Unable to download filing dossier. Please try again.');
    } finally {
      setDownloadingDossier(false);
    }
  };

  // Re-evaluate readiness
  const handleReEvaluate = async (e) => {
    if (e) e.preventDefault();
    try {
      setReEvaluating(true);
      const res = await worksApi.evaluateReadiness(work._id, formData);
      if (res.data.success) {
        setReEvalSuccess(true);
        if (onWorkUpdated) {
          onWorkUpdated({
            ...work,
            ...formData,
            copyrightReadiness: res.data.readiness,
          });
        }
        if (res.data.readiness.score >= 85) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#cb9f54', '#dbb97c', '#ffffff', '#10b981'],
          });
        }
        setTimeout(() => {
          setShowEditModal(false);
          setReEvalSuccess(false);
        }, 1200);
      }
    } catch (err) {
      console.error('Error re-evaluating readiness:', err);
      alert('Failed to re-evaluate readiness. Please try again.');
    } finally {
      setReEvaluating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header Banner & Radial Gauge Card */}
      <div
        className={`relative p-8 rounded-3xl bg-gradient-to-br from-mocha-900/90 via-mocha-950 to-mocha-900/80 border border-mocha-700/80 ${gradeStyle.bgGlow} overflow-hidden backdrop-blur-md`}
      >
        {/* Ambient champagne gold background accent */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left: Title, Grade & Narrative Summary */}
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase bg-gold-500/10 text-gold-300 border border-gold-400/30">
                <BrainCircuit className="w-3.5 h-3.5 text-gold-400" />
                <span>AI Copyright Readiness System</span>
              </span>

              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase border ${gradeStyle.badge}`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{grade}</span>
              </span>

              <span className="text-[11px] font-mono text-mocha-400">
                Engine: <strong className="text-mocha-200">{readiness.engine || 'Statutory AI'}</strong>
              </span>
            </div>

            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-mocha-50">
                Statutory Copyright Registration Readiness
              </h2>
              <p className="mt-2 text-sm text-mocha-300 leading-relaxed">
                {readiness.summary ||
                  'Evaluates your creative manuscript against formal copyright office requirements (e.g. U.S. Copyright Office Form TX / eCO and international conventions) to ensure complete statutory compliance before filing.'}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 text-mocha-950 shadow-md shadow-gold-500/20 hover:shadow-gold-glow transition-all transform hover:-translate-y-0.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-mocha-950" />
                <span>Update Filing Answers & Boost Score</span>
              </button>

              <button
                onClick={() => setShowDossierModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border border-mocha-700 bg-mocha-900/90 text-xs font-medium text-mocha-200 hover:text-gold-300 hover:border-gold-400/40 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-gold-400" />
                <span>View Formal Filing Packet (Dossier)</span>
              </button>

              <button
                onClick={handleDownloadDossier}
                disabled={downloadingDossier}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-mocha-700/80 bg-mocha-900/50 text-xs text-mocha-300 hover:text-mocha-100 hover:border-mocha-600 transition-colors disabled:opacity-50"
                title="Download official dossier text packet"
              >
                <Download className="w-3.5 h-3.5 text-mocha-400" />
                <span>{downloadingDossier ? 'Preparing...' : 'Export Dossier (.TXT)'}</span>
              </button>
            </div>
          </div>

          {/* Right: Radial Score Gauge */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Track */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-mocha-800"
                  fill="transparent"
                />
                {/* Dynamic Score Ring */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke={gradeStyle.ring}
                  strokeWidth="9"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center Score Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-serif text-3xl font-bold text-mocha-50 tracking-tight">
                  {score}%
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-mocha-400">
                  Readiness
                </span>
              </div>
            </div>

            <div className="mt-2 text-center">
              <span className="text-[11px] font-mono text-mocha-400">
                Evaluated for <strong className="text-gold-300">v{readiness.versionEvaluated || work.currentVersion || 1}.0</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Manuscript Diagnostic Chips */}
        <div className="mt-8 pt-6 border-t border-mocha-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-mocha-950/60 border border-mocha-800/80 text-center">
            <span className="block text-[10px] font-mono uppercase text-mocha-400">Word Count</span>
            <span className="font-mono text-sm font-semibold text-mocha-100">
              {metrics.wordCount ? metrics.wordCount.toLocaleString() : 'N/A'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-mocha-950/60 border border-mocha-800/80 text-center">
            <span className="block text-[10px] font-mono uppercase text-mocha-400">Est. Pages</span>
            <span className="font-mono text-sm font-semibold text-mocha-100">
              {metrics.estimatedPages || 1} pgs
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-mocha-950/60 border border-mocha-800/80 text-center">
            <span className="block text-[10px] font-mono uppercase text-mocha-400">Statutory Notice</span>
            <span
              className={`inline-flex items-center space-x-1 text-xs font-semibold ${
                metrics.detectedNotice ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {metrics.detectedNotice ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Detected</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Missing</span>
                </>
              )}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-mocha-950/60 border border-mocha-800/80 text-center">
            <span className="block text-[10px] font-mono uppercase text-mocha-400">Title Page</span>
            <span
              className={`inline-flex items-center space-x-1 text-xs font-semibold ${
                metrics.detectedTitleInFrontMatter ? 'text-emerald-400' : 'text-mocha-300'
              }`}
            >
              {metrics.detectedTitleInFrontMatter ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Matched</span>
                </>
              ) : (
                <>
                  <Info className="w-3.5 h-3.5 text-mocha-400" />
                  <span>Unformatted</span>
                </>
              )}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-mocha-950/60 border border-mocha-800/80 text-center">
            <span className="block text-[10px] font-mono uppercase text-mocha-400">Structure</span>
            <span
              className={`inline-flex items-center space-x-1 text-xs font-semibold ${
                metrics.detectedStructure ? 'text-emerald-400' : 'text-mocha-300'
              }`}
            >
              {metrics.detectedStructure ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Chapters Present</span>
                </>
              ) : (
                <span>Unsegmented</span>
              )}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-mocha-950/60 border border-mocha-800/80 text-center">
            <span className="block text-[10px] font-mono uppercase text-mocha-400">AI Material</span>
            <span
              className={`inline-flex items-center space-x-1 text-xs font-semibold ${
                metrics.detectedAiArtifacts ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {metrics.detectedAiArtifacts ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Review Artifacts</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Human Verified</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 2. 5 Statutory Evaluation Pillars */}
      <div className="p-6 sm:p-8 rounded-3xl bg-mocha-900/70 border border-mocha-700/80 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-mocha-100 flex items-center space-x-2">
              <Scale className="w-5 h-5 text-gold-400" />
              <span>Statutory Evaluation Pillars (100 Point Breakdown)</span>
            </h3>
            <p className="text-xs text-mocha-400">
              Evaluated against statutory deposit and authorship criteria used by examiners at the U.S. Copyright Office and WIPO national registries.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pillar 1: Authorship & Claimant Identification (25 pts) */}
          <PillarCard
            icon={<UserCheck className="w-4 h-4 text-gold-400" />}
            title="1. Authorship & Claimant Clarity"
            score={breakdown.authorshipClaim?.score || 0}
            maxScore={25}
            status={breakdown.authorshipClaim?.status}
            details={breakdown.authorshipClaim?.details}
          />

          {/* Pillar 2: Title & Work Categorization (20 pts) */}
          <PillarCard
            icon={<BookOpen className="w-4 h-4 text-gold-400" />}
            title="2. Title & Work Categorization"
            score={breakdown.titleMetadata?.score || 0}
            maxScore={20}
            status={breakdown.titleMetadata?.status}
            details={breakdown.titleMetadata?.details}
          />

          {/* Pillar 3: Statutory Notice & Deposit Formatting (20 pts) */}
          <PillarCard
            icon={<FileText className="w-4 h-4 text-gold-400" />}
            title="3. Statutory Notice & Deposit Formatting"
            score={breakdown.statutoryNoticeDeposit?.score || 0}
            maxScore={20}
            status={breakdown.statutoryNoticeDeposit?.status}
            details={breakdown.statutoryNoticeDeposit?.details}
          />

          {/* Pillar 4: Human Authorship & AI Disclosure (20 pts) */}
          <PillarCard
            icon={<BrainCircuit className="w-4 h-4 text-gold-400" />}
            title="4. Human Authorship & AI Disclosure (USCO Rules)"
            score={breakdown.humanAuthorshipAiDisclosure?.score || 0}
            maxScore={20}
            status={breakdown.humanAuthorshipAiDisclosure?.status}
            details={breakdown.humanAuthorshipAiDisclosure?.details}
          />

          {/* Pillar 5: Creation Year & Publication Status (15 pts) */}
          <div className="md:col-span-2">
            <PillarCard
              icon={<Calendar className="w-4 h-4 text-gold-400" />}
              title="5. Creation Year & Publication Status"
              score={breakdown.publicationStatusCompleteness?.score || 0}
              maxScore={15}
              status={breakdown.publicationStatusCompleteness?.status}
              details={breakdown.publicationStatusCompleteness?.details}
            />
          </div>
        </div>
      </div>

      {/* 3. Actionable Recommendations & Preparation Steps */}
      <div className="p-6 sm:p-8 rounded-3xl bg-mocha-900/70 border border-mocha-700/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-mocha-100 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-gold-400" />
              <span>Actionable Preparation Recommendations</span>
            </h3>
            <p className="text-xs text-mocha-400">
              Complete these steps to optimize your manuscript for immediate acceptance by national copyright examiners.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-mocha-950 border border-mocha-800">
            {['all', 'critical', 'recommended', 'optional'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSeverityTab(tab)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono capitalize transition-all ${
                  activeSeverityTab === tab
                    ? 'bg-gold-500/20 text-gold-300 font-semibold'
                    : 'text-mocha-400 hover:text-mocha-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations List */}
        {filteredRecs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-mocha-950/40 border border-mocha-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-medium text-mocha-100 text-sm">No Pending Items in this Category</h4>
            <p className="text-xs text-mocha-400">
              Your manuscript meets the requirements for this evaluation filter.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecs.map((rec) => (
              <div
                key={rec.id}
                className="p-4 sm:p-5 rounded-2xl bg-mocha-950/70 border border-mocha-800/90 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-mocha-700 transition-colors"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <SeverityBadge severity={rec.severity} />
                    <span className="text-[11px] font-mono text-mocha-400">{rec.category}</span>
                  </div>
                  <h4 className="font-serif text-sm font-semibold text-mocha-100">{rec.title}</h4>
                  <p className="text-xs text-mocha-300 leading-relaxed">{rec.description}</p>
                </div>

                <div className="shrink-0 flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-mocha-800 text-mocha-200 hover:bg-gold-500/20 hover:text-gold-300 border border-mocha-700 hover:border-gold-400/30 transition-all"
                  >
                    <span>Fix / Answer</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Statutory Filing Checklist */}
      <div className="p-6 sm:p-8 rounded-3xl bg-mocha-900/70 border border-mocha-700/80 space-y-6">
        <div className="space-y-1">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-mocha-100 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-gold-400" />
            <span>Formal Copyright Filing Checklist</span>
          </h3>
          <p className="text-xs text-mocha-400">
            A comprehensive readiness checklist to verify before paying statutory filing fees on governmental portals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-mocha-950/50 border border-mocha-800/80 flex items-start space-x-3"
            >
              <div className="mt-0.5 shrink-0">
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-mocha-600 bg-mocha-900" />
                )}
              </div>
              <div className="space-y-1 text-xs">
                <span
                  className={`font-medium block ${
                    item.completed ? 'text-mocha-100' : 'text-mocha-300'
                  }`}
                >
                  {item.label}
                </span>
                <p className="text-[11px] text-mocha-400 leading-relaxed">{item.guidance}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: Formal Filing Packet / Dossier Modal */}
      {showDossierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-mocha-950 border border-gold-400/50 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-mocha-800 bg-mocha-900/80">
              <div className="flex items-center space-x-2.5">
                <FileText className="w-5 h-5 text-gold-400" />
                <div>
                  <h3 className="font-serif text-lg font-medium text-mocha-100">
                    Formal Copyright Registration Dossier
                  </h3>
                  <span className="text-[11px] font-mono text-mocha-400">
                    Prepared for U.S. Copyright Office (Form TX / eCO) & National Registries
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDossierModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-mocha-400 hover:text-mocha-100 hover:bg-mocha-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-mocha-200">
              <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-400/30 text-mocha-200 leading-relaxed">
                <p className="font-medium text-gold-300 mb-1">Examiner Form Preparation Sheet</p>
                When you submit your formal application on the U.S. Copyright Office portal (eCO) or national registry, use these prepared answers to fill in each section accurately.
              </div>

              {/* Ready to copy Form TX fields */}
              <div className="space-y-4">
                <DossierFieldRow
                  label="Title of Work"
                  value={dossier.workTitle}
                  onCopy={() => handleCopy(dossier.workTitle, 'title')}
                  copied={copiedField === 'title'}
                />

                <DossierFieldRow
                  label="Nature of Work / Classification"
                  value={dossier.natureOfWork}
                  onCopy={() => handleCopy(dossier.natureOfWork, 'nature')}
                  copied={copiedField === 'nature'}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DossierFieldRow
                    label="Year of Completion"
                    value={dossier.yearCompleted ? String(dossier.yearCompleted) : 'Current Year'}
                    onCopy={() => handleCopy(String(dossier.yearCompleted), 'year')}
                    copied={copiedField === 'year'}
                  />

                  <DossierFieldRow
                    label="Publication Status"
                    value={dossier.publicationStatus}
                    onCopy={() => handleCopy(dossier.publicationStatus, 'pubStatus')}
                    copied={copiedField === 'pubStatus'}
                  />
                </div>

                <DossierFieldRow
                  label="Name of Author & Claimant"
                  value={dossier.authorName}
                  onCopy={() => handleCopy(dossier.authorName, 'author')}
                  copied={copiedField === 'author'}
                />

                <DossierFieldRow
                  label="Nature of Authorship Claim (Author Created)"
                  value={dossier.natureOfAuthorship}
                  onCopy={() => handleCopy(dossier.natureOfAuthorship, 'natureAuthor')}
                  copied={copiedField === 'natureAuthor'}
                />

                <DossierFieldRow
                  label="Human Authorship & AI Disclosure Statement"
                  value={dossier.aiDisclosureStatement}
                  onCopy={() => handleCopy(dossier.aiDisclosureStatement, 'aiStmt')}
                  copied={copiedField === 'aiStmt'}
                />

                <DossierFieldRow
                  label="Material Excluded / Limitation of Claim"
                  value={dossier.materialExcluded}
                  onCopy={() => handleCopy(dossier.materialExcluded, 'excluded')}
                  copied={copiedField === 'excluded'}
                />

                {/* Formatted Statutory Notice String */}
                <div className="space-y-1.5 p-4 rounded-2xl bg-mocha-900 border border-mocha-700">
                  <div className="flex items-center justify-between">
                    <span className="font-mono uppercase text-[11px] text-gold-300 font-semibold">
                      Statutory Copyright Notice to Insert into Manuscript
                    </span>
                    <button
                      onClick={() => handleCopy(dossier.formattedStatutoryNotice, 'notice')}
                      className="inline-flex items-center space-x-1 text-xs text-mocha-300 hover:text-gold-300 transition-colors"
                    >
                      {copiedField === 'notice' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Notice</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="font-mono text-[11px] p-3 rounded-xl bg-mocha-950 text-mocha-100 whitespace-pre-wrap select-all">
                    {dossier.formattedStatutoryNotice}
                  </pre>
                </div>

                {/* Cryptographic Evidence Trail */}
                <div className="p-3.5 rounded-xl bg-mocha-900/60 border border-mocha-800 text-[11px] font-mono text-mocha-300">
                  <span className="text-gold-400 font-semibold block mb-0.5">
                    PubSeal Cryptographic Anchor:
                  </span>
                  <span>{dossier.pubsealEvidenceTrail}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-mocha-800 bg-mocha-900/80">
              <span className="text-[11px] text-mocha-400">
                Ready for submission to eCO (U.S. Copyright Office)
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDownloadDossier}
                  disabled={downloadingDossier}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:from-gold-400 hover:to-gold-300 shadow-md transition-all disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-mocha-950" />
                  <span>{downloadingDossier ? 'Downloading...' : 'Download Dossier (.TXT)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Filing Answers & Re-evaluate Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-mocha-950 border border-gold-400/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-mocha-800 bg-mocha-900/80">
              <div className="flex items-center space-x-2.5">
                <Edit3 className="w-5 h-5 text-gold-400" />
                <div>
                  <h3 className="font-serif text-lg font-medium text-mocha-100">
                    Update Statutory Filing Details
                  </h3>
                  <span className="text-[11px] font-mono text-mocha-400">
                    Re-evaluates copyright readiness and boosts compliance score
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-mocha-400 hover:text-mocha-100 hover:bg-mocha-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleReEvaluate} className="p-6 overflow-y-auto space-y-5">
              {reEvalSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-200 flex items-center space-x-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Evaluation updated! New readiness score calculated successfully.</span>
                </div>
              )}

              {/* 1. Year of Completion & Publication Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-mocha-300">
                    Year of Completion
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2100"
                    value={formData.yearCompleted}
                    onChange={(e) => setFormData({ ...formData, yearCompleted: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-mocha-900 border border-mocha-700 text-mocha-100 focus:outline-none focus:border-gold-400 text-xs font-mono"
                    required
                  />
                  <span className="text-[10px] text-mocha-500">Year this manuscript draft was finished.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-mocha-300">
                    Publication Status
                  </label>
                  <select
                    value={formData.publicationStatus}
                    onChange={(e) => setFormData({ ...formData, publicationStatus: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-mocha-900 border border-mocha-700 text-mocha-100 focus:outline-none focus:border-gold-400 text-xs"
                  >
                    <option value="unpublished">Unpublished Work (Draft / Pre-release)</option>
                    <option value="published">Published Work (Publicly Distributed / Sold)</option>
                  </select>
                  <span className="text-[10px] text-mocha-500">Unpublished is standard for pre-publication drafts.</span>
                </div>
              </div>

              {/* 2. Nature of Authorship Claim */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-mocha-300">
                  Nature of Authorship Claim (Author Created)
                </label>
                <input
                  type="text"
                  value={formData.natureOfAuthorship}
                  onChange={(e) => setFormData({ ...formData, natureOfAuthorship: e.target.value })}
                  placeholder='e.g. "Entire text", "Original novel text and dialogue", "Poetry collection"'
                  className="w-full px-4 py-2.5 rounded-xl bg-mocha-900 border border-mocha-700 text-mocha-100 focus:outline-none focus:border-gold-400 text-xs"
                  required
                />
                <span className="text-[10px] text-mocha-500">
                  Describes what the author created for Form TX (e.g. &quot;Entire text&quot;).
                </span>
              </div>

              {/* 3. Human Authorship Certification (USCO Requirement) */}
              <div className="p-4 rounded-2xl bg-mocha-900/80 border border-mocha-700/80 space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.humanAuthorshipCertified}
                    onChange={(e) => setFormData({ ...formData, humanAuthorshipCertified: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-mocha-600 bg-mocha-950 text-gold-500 focus:ring-gold-400"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-mocha-100 block">
                      Certify Human Expressive Authorship
                    </span>
                    <p className="text-[11px] text-mocha-400 leading-relaxed">
                      I confirm that this literary work represents my original creative human expression in accordance with U.S. Copyright Office guidelines.
                    </p>
                  </div>
                </label>

                {/* AI Material Disclosure Toggle */}
                <label className="flex items-start space-x-3 cursor-pointer pt-2 border-t border-mocha-800">
                  <input
                    type="checkbox"
                    checked={formData.aiContentDisclosed}
                    onChange={(e) => setFormData({ ...formData, aiContentDisclosed: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-mocha-600 bg-mocha-950 text-gold-500 focus:ring-gold-400"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-mocha-200 block">
                      Work contains AI assistance (USCO AI Disclosure)
                    </span>
                    <p className="text-[10px] text-mocha-400">
                      Check if you used generative AI tools for drafting or brainstorming that should be disclosed.
                    </p>
                  </div>
                </label>

                {formData.aiContentDisclosed && (
                  <div className="space-y-1.5 pt-2 animate-fade-in">
                    <label className="block text-[11px] font-mono text-mocha-300">
                      Explain AI Contribution vs Human Author Contribution:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.aiDisclosureDetails}
                      onChange={(e) => setFormData({ ...formData, aiDisclosureDetails: e.target.value })}
                      placeholder='e.g. "Generative AI used for brainstorm ideas and outline; all narrative prose and dialogue written by human author."'
                      className="w-full px-3 py-2 rounded-xl bg-mocha-950 border border-mocha-700 text-xs text-mocha-100 focus:outline-none focus:border-gold-400 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* 4. Pseudonym & Work Made for Hire */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 p-3.5 rounded-2xl bg-mocha-900/50 border border-mocha-800">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPseudonymous}
                      onChange={(e) => setFormData({ ...formData, isPseudonymous: e.target.checked })}
                      className="w-4 h-4 rounded border-mocha-600 bg-mocha-950 text-gold-500"
                    />
                    <span className="text-xs text-mocha-200">Pseudonymous Work (Pen Name)</span>
                  </label>
                  {formData.isPseudonymous && (
                    <input
                      type="text"
                      value={formData.pseudonym}
                      onChange={(e) => setFormData({ ...formData, pseudonym: e.target.value })}
                      placeholder="Enter pen name / pseudonym"
                      className="w-full px-3 py-1.5 rounded-lg bg-mocha-950 border border-mocha-700 text-xs text-mocha-100 focus:outline-none focus:border-gold-400"
                    />
                  )}
                </div>

                <div className="space-y-2 p-3.5 rounded-2xl bg-mocha-900/50 border border-mocha-800">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isWorkMadeForHire}
                      onChange={(e) => setFormData({ ...formData, isWorkMadeForHire: e.target.checked })}
                      className="w-4 h-4 rounded border-mocha-600 bg-mocha-950 text-gold-500"
                    />
                    <span className="text-xs text-mocha-200">Work Made for Hire</span>
                  </label>
                  <p className="text-[10px] text-mocha-500">
                    Created under an employment or commission agreement.
                  </p>
                </div>
              </div>

              {/* 5. Limitation of Claim / Excluded Material */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-mocha-300">
                  Limitation of Claim / Material Excluded (Optional)
                </label>
                <input
                  type="text"
                  value={formData.preexistingMaterialExcluded}
                  onChange={(e) => setFormData({ ...formData, preexistingMaterialExcluded: e.target.value })}
                  placeholder='e.g. "Public domain folklore tale", "Song lyrics from Chapter 4", or leave blank'
                  className="w-full px-4 py-2.5 rounded-xl bg-mocha-900 border border-mocha-700 text-mocha-100 focus:outline-none focus:border-gold-400 text-xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-mocha-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-mocha-300 hover:text-mocha-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={reEvaluating}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:from-gold-400 hover:to-gold-300 shadow-md shadow-gold-500/20 hover:shadow-gold-glow transition-all disabled:opacity-50"
                >
                  {reEvaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-mocha-950" />
                      <span>Re-evaluating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-mocha-950" />
                      <span>Re-Evaluate & Update Score</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Pillar Card Component
function PillarCard({ icon, title, score, maxScore, status, details }) {
  const percent = Math.min(100, Math.round((score / maxScore) * 100));

  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  let barColor = 'from-emerald-500 to-emerald-400';
  if (status === 'warn' || percent < 75) {
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    barColor = 'from-gold-500 to-gold-400';
  }
  if (status === 'fail' || percent < 50) {
    badgeColor = 'bg-red-500/20 text-red-300 border-red-500/30';
    barColor = 'from-red-500 to-red-400';
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-mocha-950/60 border border-mocha-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon}
          <h4 className="font-serif text-xs sm:text-sm font-semibold text-mocha-100">{title}</h4>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border ${badgeColor}`}>
          {score} / {maxScore} pts
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-mocha-900 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-[11px] text-mocha-300 leading-relaxed">{details || 'Pillar evaluated.'}</p>
    </div>
  );
}

// Severity Badge Helper
function SeverityBadge({ severity }) {
  switch (severity) {
    case 'critical':
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-red-500/20 text-red-300 border border-red-500/40">
          Critical
        </span>
      );
    case 'recommended':
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-gold-500/20 text-gold-300 border border-gold-400/40">
          Recommended
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold bg-mocha-800 text-mocha-300 border border-mocha-700">
          Best Practice
        </span>
      );
  }
}

// Dossier Row Component
function DossierFieldRow({ label, value, onCopy, copied }) {
  return (
    <div className="p-3.5 rounded-xl bg-mocha-900/80 border border-mocha-700/80 flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <span className="block text-[10px] font-mono uppercase text-mocha-400">{label}</span>
        <span className="font-medium text-mocha-100 text-xs">{value || 'N/A'}</span>
      </div>

      <button
        type="button"
        onClick={onCopy}
        className="shrink-0 inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-mocha-950 border border-mocha-700 text-[11px] text-mocha-300 hover:text-gold-300 transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}

