import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  PlusCircle, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  BookOpen, 
  Calendar, 
  FileText, 
  Binary, 
  Clock, 
  SearchCheck, 
  ArrowUpDown,
  Loader2,
  AlertCircle,
  GitBranch,
  Plus,
  X,
  HardDrive,
  Eye,
  Sparkles,
  BrainCircuit,
  Award
} from 'lucide-react';
import { worksApi, certificateApi } from '../services/api';
import HashBadge from '../components/HashBadge';
import CertificateModal from '../components/CertificateModal';
import FileDropzone from '../components/FileDropzone';

const CATEGORIES = [
  'All',
  'Novel',
  'Poetry',
  'Short Story',
  'Screenplay',
  'Essay',
  'Academic Writing',
  'Stage Play',
  'Memoir',
  'Other',
];

const DashboardPage = () => {
  const [works, setWorks] = useState([]);
  const [stats, setStats] = useState({
    totalWorks: 0,
    recentRegistrations: 0,
    totalVerifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('registeredAt_desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedWorkForCert, setSelectedWorkForCert] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // Version Control Modals on Dashboard
  const [workForUploadVersion, setWorkForUploadVersion] = useState(null);
  const [workForVersionHistory, setWorkForVersionHistory] = useState(null);
  const [newVersionFile, setNewVersionFile] = useState(null);
  const [changeNotes, setChangeNotes] = useState('');
  const [uploadingVersion, setUploadingVersion] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [versionError, setVersionError] = useState(null);

  // Fetch works and stats from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const [worksRes, statsRes] = await Promise.all([
        worksApi.getAll({
          search: search.trim() || undefined,
          category: category !== 'All' ? category : undefined,
          sort,
          page,
          limit: 9,
        }),
        worksApi.getStats(),
      ]);

      if (worksRes.data.success) {
        setWorks(worksRes.data.works);
        setPagination(worksRes.data.pagination);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category, sort, page]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Direct download handler for certificate PDF
  const handleDownloadCertificate = async (work, e, versionNum) => {
    if (e) e.stopPropagation();
    const ver = versionNum || work.currentVersion || 1;
    try {
      setDownloadingId(work._id);
      const res = await certificateApi.downloadPdf(work.registrationId || work._id, ver);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PubSeal-Certificate-${work.registrationId}-v${ver}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download certificate PDF:', err);
      alert('Unable to download certificate PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Direct download handler for manuscript file
  const handleDownloadOriginalFile = async (work, versionNum) => {
    const ver = versionNum || work.currentVersion || 1;
    try {
      const res = await worksApi.downloadOriginal(work._id, ver);
      const targetVer = work.versions?.find(v => v.versionNumber === ver);
      const blob = new Blob([res.data], { type: targetVer?.mimeType || work.mimeType || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', targetVer?.originalFilename || work.originalFilename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to retrieve file from vault storage.');
    }
  };

  // Upload revision / version handler
  const handleUploadVersionSubmit = async (e) => {
    e.preventDefault();
    if (!newVersionFile || !workForUploadVersion) {
      setVersionError('Please select a revised manuscript file to upload.');
      return;
    }

    try {
      setUploadingVersion(true);
      setVersionError(null);

      const formData = new FormData();
      formData.append('file', newVersionFile);
      if (changeNotes.trim()) {
        formData.append('changeNotes', changeNotes.trim());
      }

      const res = await worksApi.createVersion(workForUploadVersion._id, formData, (percent) => {
        setUploadProgress(percent);
      });

      if (res.data.success) {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#cb9f54', '#dbb97c', '#e6cfa1', '#f6eed6']
        });

        // Close modal, clear inputs & refresh dashboard works list
        setTimeout(() => {
          setWorkForUploadVersion(null);
          setNewVersionFile(null);
          setChangeNotes('');
          setUploadProgress(0);
          fetchData();
        }, 700);
      }
    } catch (err) {
      setVersionError(
        err.response?.data?.message || 'Failed to register new version. Please try again.'
      );
    } finally {
      setUploadingVersion(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-mocha-800">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-mocha-50">
            Author Registry Vault
          </h1>
          <p className="text-sm text-mocha-300 mt-1">
            Manage your registered literary works, certified SHA-256 fingerprints, and multi-version draft revisions.
          </p>
        </div>

        <Link
          to="/register-work"
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:from-gold-400 hover:to-gold-300 shadow-md shadow-gold-500/20 hover:shadow-gold-glow transition-all transform hover:-translate-y-0.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-mocha-950" />
          <span>Register New Work</span>
        </Link>
      </div>

      {/* 2. Real-time Summary Metric Cards */}
      {(() => {
        const evaluatedWorks = works.filter(
          (w) => w.copyrightReadiness && typeof w.copyrightReadiness.score === 'number'
        );
        const avgReadiness =
          evaluatedWorks.length > 0
            ? Math.round(
                evaluatedWorks.reduce((acc, curr) => acc + curr.copyrightReadiness.score, 0) /
                  evaluatedWorks.length
              )
            : 90;

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-mocha-900/60 border border-mocha-800 space-y-2">
              <span className="text-xs font-mono text-mocha-400 uppercase tracking-wider block">
                Total Vault Titles
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="font-serif text-3xl font-bold text-gold-300">
                  {stats.totalWorks}
                </span>
                <span className="text-xs text-mocha-400 font-mono">registered manuscripts</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-mocha-900/60 border border-mocha-800 space-y-2">
              <span className="text-xs font-mono text-mocha-400 uppercase tracking-wider block">
                30-Day Submissions
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="font-serif text-3xl font-bold text-gold-300">
                  {stats.recentRegistrations}
                </span>
                <span className="text-xs text-mocha-400 font-mono">certified this month</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-mocha-900/60 border border-mocha-800 space-y-2">
              <span className="text-xs font-mono text-mocha-400 uppercase tracking-wider block">
                Third-Party Verifications
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="font-serif text-3xl font-bold text-gold-300">
                  {stats.totalVerifications}
                </span>
                <span className="text-xs text-mocha-400 font-mono">cryptographic audits</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-mocha-900/60 border border-mocha-800 space-y-2">
              <span className="text-xs font-mono text-mocha-400 uppercase tracking-wider block">
                AI Copyright Readiness
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="font-serif text-3xl font-bold text-emerald-400">
                  {avgReadiness}%
                </span>
                <span className="text-xs text-mocha-400 font-mono">portfolio average</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3. Search, Filter & Sort Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-mocha-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, author, Registration ID (PUB-...), or SHA-256 hash..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-mocha-900/70 border border-mocha-700 text-mocha-100 placeholder-mocha-400/60 focus:outline-none focus:border-gold-400 text-sm"
            />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
            <ArrowUpDown className="w-4 h-4 text-mocha-400 hidden sm:block" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-mocha-900/70 border border-mocha-700 text-mocha-100 text-sm focus:outline-none focus:border-gold-400 w-full sm:w-auto font-mono text-xs"
            >
              <option value="registeredAt_desc">Newest First</option>
              <option value="registeredAt_asc">Oldest First</option>
              <option value="title_asc">Title (A - Z)</option>
              <option value="title_desc">Title (Z - A)</option>
              <option value="size_desc">File Size (Largest)</option>
              <option value="size_asc">File Size (Smallest)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-gold-500 text-mocha-950 font-bold shadow-sm'
                  : 'bg-mocha-900/80 text-mocha-300 border border-mocha-800 hover:border-gold-400/40 hover:text-gold-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Registered Works Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
          <p className="text-xs font-mono text-mocha-400">Loading Author Registry Vault...</p>
        </div>
      ) : works.length === 0 ? (
        <div className="py-20 p-8 rounded-3xl bg-mocha-900/40 border border-mocha-800 text-center space-y-4 max-w-xl mx-auto">
          <BookOpen className="w-12 h-12 text-mocha-400 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-mocha-100">No Works Found in Vault</h3>
          <p className="text-sm text-mocha-300">
            {search || category !== 'All'
              ? 'No registered works match your current filters. Try resetting search parameters.'
              : 'You have not registered any literary manuscripts yet. Begin by securing your first document.'}
          </p>
          <div className="pt-2">
            <Link
              to="/register-work"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:from-gold-400 hover:to-gold-300 shadow-gold-glow transition-all"
            >
              <PlusCircle className="w-4 h-4 text-mocha-950" />
              <span>Register Your First Work</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map((work) => {
            const versionCount = work.versions?.length || 1;
            const currentVer = work.currentVersion || 1;

            return (
              <div
                key={work._id}
                className="p-6 rounded-2xl bg-mocha-900/70 border border-mocha-800/90 hover:border-gold-400/50 shadow-md hover:shadow-mocha-deep transition-all flex flex-col justify-between space-y-5 group"
              >
                {/* Card Top: Category, Readiness Score & Version Badge */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono uppercase bg-gold-500/10 text-gold-300 border border-gold-400/20">
                      {work.category}
                    </span>

                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      {/* AI Copyright Readiness Score Pill */}
                      {work.copyrightReadiness?.score !== undefined && (
                        <Link
                          to={`/works/${work._id}?tab=readiness`}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors flex items-center space-x-1 ${
                            work.copyrightReadiness.score >= 85
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:border-emerald-400'
                              : work.copyrightReadiness.score >= 70
                              ? 'bg-gold-500/15 text-gold-300 border-gold-400/30 hover:border-gold-300'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:border-amber-400'
                          }`}
                          title="AI Copyright Readiness Score — Click to view statutory analysis"
                        >
                          <BrainCircuit className="w-3 h-3 text-gold-400" />
                          <span>{work.copyrightReadiness.score}%</span>
                        </Link>
                      )}

                      {/* Version history trigger badge */}
                      <button
                        type="button"
                        onClick={() => setWorkForVersionHistory(work)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold-500/15 text-gold-300 border border-gold-400/30 hover:bg-gold-500/25 transition-colors flex items-center space-x-1"
                        title="Click to view all document revisions & version history"
                      >
                        <GitBranch className="w-3 h-3 text-gold-400" />
                        <span>v{currentVer}.0 ({versionCount})</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Author */}
                  <div>
                    <h3 className="font-serif text-lg font-bold text-mocha-50 group-hover:text-gold-200 transition-colors line-clamp-1">
                      {work.title}
                    </h3>
                    <p className="text-xs text-mocha-300 mt-0.5">By {work.authorName}</p>
                  </div>

                  {/* Meta details */}
                  <div className="text-xs text-mocha-400 space-y-1 font-mono pt-1 border-t border-mocha-800/60">
                    <div className="flex items-center justify-between">
                      <span>Token:</span>
                      <span className="text-mocha-200 font-semibold">{work.registrationId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Latest File:</span>
                      <span className="truncate max-w-[170px] text-mocha-200">{work.originalFilename}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Updated:</span>
                      <span className="text-mocha-200">{new Date(work.registeredAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* SHA-256 Hash snippet */}
                  <div className="pt-1">
                    <HashBadge hash={work.sha256Hash} truncate={true} showLabel={false} />
                  </div>
                </div>

                {/* Card Actions Bottom */}
                <div className="pt-4 border-t border-mocha-800/80 flex items-center justify-between gap-2">
                  <Link
                    to={`/works/${work._id}`}
                    className="flex-1 text-center py-2 px-2.5 rounded-lg border border-mocha-700 bg-mocha-950/40 text-xs font-medium text-mocha-200 hover:text-gold-300 hover:border-gold-400/40 transition-colors"
                  >
                    View Record
                  </Link>

                  {/* Quick Upload Revision CTA */}
                  <button
                    type="button"
                    onClick={() => setWorkForUploadVersion(work)}
                    className="py-2 px-2.5 rounded-lg border border-gold-400/40 bg-gold-500/10 text-xs font-medium text-gold-300 hover:bg-gold-500/20 hover:text-gold-200 transition-colors flex items-center space-x-1"
                    title="Upload an updated version / revision for this manuscript"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold-400" />
                    <span>+ Revision</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDownloadCertificate(work, e)}
                    disabled={downloadingId === work._id}
                    title="Download Official Registration Certificate PDF"
                    className="p-2 rounded-lg bg-gold-500/10 text-gold-300 border border-gold-400/30 hover:bg-gold-500/20 hover:text-gold-200 transition-all shrink-0"
                  >
                    {downloadingId === work._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-3 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-mocha-700 text-xs text-mocha-300 disabled:opacity-40 hover:text-gold-300"
          >
            Previous
          </button>
          <span className="text-xs font-mono text-mocha-300">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 rounded-lg border border-mocha-700 text-xs text-mocha-300 disabled:opacity-40 hover:text-gold-300"
          >
            Next
          </button>
        </div>
      )}

      {/* MODAL 1: Upload New Version directly from Dashboard */}
      {workForUploadVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-mocha-950 border border-gold-400/50 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-mocha-800 bg-mocha-900/80">
              <div className="flex items-center space-x-2.5">
                <GitBranch className="w-5 h-5 text-gold-400" />
                <h3 className="font-serif text-lg font-medium text-mocha-100">
                  Upload Revision (v{(workForUploadVersion.currentVersion || 1) + 1}.0)
                </h3>
              </div>
              <button
                onClick={() => {
                  setWorkForUploadVersion(null);
                  setNewVersionFile(null);
                  setVersionError(null);
                }}
                className="p-1 rounded-lg text-mocha-400 hover:text-mocha-100 hover:bg-mocha-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadVersionSubmit} className="p-6 space-y-5">
              <div className="bg-mocha-900/60 p-3.5 rounded-xl border border-mocha-800 text-xs font-mono">
                <span className="text-mocha-400 block uppercase text-[10px]">Updating Work:</span>
                <span className="text-mocha-100 font-bold text-sm block mt-0.5">{workForUploadVersion.title}</span>
                <span className="text-gold-400 text-[11px]">Currently at Version {workForUploadVersion.currentVersion || 1}.0 • {workForUploadVersion.registrationId}</span>
              </div>

              {versionError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{versionError}</span>
                </div>
              )}

              {/* File Dropzone (No size limit) */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase text-mocha-300">
                  Updated Manuscript File (PDF, DOCX, or TXT)
                </label>
                <FileDropzone
                  selectedFile={newVersionFile}
                  onFileSelected={(file) => setNewVersionFile(file)}
                  onClear={() => setNewVersionFile(null)}
                  label="Drop updated draft here"
                />
              </div>

              {/* Change Notes */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase text-mocha-300">
                  Change Notes / Revision Summary (Optional)
                </label>
                <textarea
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  placeholder="e.g. Chapter 2 rewrite; pacing edits in third act; copyedited."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-mocha-900 border border-mocha-700 text-mocha-100 placeholder-mocha-400/50 focus:outline-none focus:border-gold-400 text-xs resize-none"
                />
              </div>

              {/* Progress Bar */}
              {uploadingVersion && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-gold-300">
                    <span>Hashing & Vaulting Revision...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-mocha-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-mocha-800">
                <button
                  type="button"
                  onClick={() => {
                    setWorkForUploadVersion(null);
                    setNewVersionFile(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs text-mocha-300 hover:text-mocha-100 hover:bg-mocha-900 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploadingVersion || !newVersionFile}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:from-gold-400 hover:to-gold-300 shadow-md shadow-gold-500/20 hover:shadow-gold-glow transition-all disabled:opacity-50"
                >
                  {uploadingVersion ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-mocha-950" />
                      <span>Fingerprinting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-mocha-950" />
                      <span>Certify Version {(workForUploadVersion.currentVersion || 1) + 1}.0</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Version History Drawer / Modal */}
      {workForVersionHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-mocha-950 border border-gold-400/50 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-mocha-800 bg-mocha-900/80">
              <div className="flex items-center space-x-2.5">
                <GitBranch className="w-5 h-5 text-gold-400" />
                <div>
                  <h3 className="font-serif text-lg font-medium text-mocha-100">
                    Version History: {workForVersionHistory.title}
                  </h3>
                  <span className="text-[11px] font-mono text-mocha-400">
                    Token: {workForVersionHistory.registrationId} • {workForVersionHistory.versions?.length || 1} Registered Editions
                  </span>
                </div>
              </div>
              <button
                onClick={() => setWorkForVersionHistory(null)}
                className="p-1 rounded-lg text-mocha-400 hover:text-mocha-100 hover:bg-mocha-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-mocha-800">
                <span className="text-xs font-mono uppercase text-mocha-400">Chronological Revisions</span>
                <button
                  type="button"
                  onClick={() => {
                    const target = workForVersionHistory;
                    setWorkForVersionHistory(null);
                    setWorkForUploadVersion(target);
                  }}
                  className="px-3 py-1 rounded-lg bg-gold-500 text-mocha-950 font-semibold text-xs hover:bg-gold-400 transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Version {(workForVersionHistory.currentVersion || 1) + 1}.0</span>
                </button>
              </div>

              {/* Version History List */}
              <div className="space-y-3">
                {([...(workForVersionHistory.versions || [
                  {
                    versionNumber: 1,
                    originalFilename: workForVersionHistory.originalFilename,
                    fileSize: workForVersionHistory.fileSize,
                    sha256Hash: workForVersionHistory.sha256Hash,
                    changeNotes: 'Initial registration',
                    registeredAt: workForVersionHistory.registeredAt,
                  }
                ])])
                  .sort((a, b) => b.versionNumber - a.versionNumber)
                  .map((ver) => {
                    const isLatest = ver.versionNumber === (workForVersionHistory.currentVersion || 1);

                    return (
                      <div
                        key={ver.versionNumber}
                        className="p-4 rounded-xl bg-mocha-900/60 border border-mocha-800 space-y-2.5"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                              isLatest
                                ? 'bg-gold-500/20 text-gold-300 border border-gold-400/50'
                                : 'bg-mocha-800 text-mocha-300 border border-mocha-700'
                            }`}>
                              Version {ver.versionNumber}.0 {isLatest ? '• Current Latest' : '• Historical'}
                            </span>
                            <span className="text-xs font-mono text-mocha-400 flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{new Date(ver.registeredAt).toUTCString()}</span>
                            </span>
                          </div>

                          {/* Action Buttons for this version */}
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleDownloadCertificate(workForVersionHistory, null, ver.versionNumber)}
                              className="px-2.5 py-1 rounded-lg bg-gold-500/10 text-gold-300 border border-gold-400/30 hover:bg-gold-500/20 text-xs font-mono flex items-center space-x-1"
                              title="Download PDF Certificate for this version"
                            >
                              <Download className="w-3 h-3" />
                              <span>Certificate</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadOriginalFile(workForVersionHistory, ver.versionNumber)}
                              className="px-2.5 py-1 rounded-lg bg-mocha-800 text-mocha-200 border border-mocha-700 hover:text-white text-xs font-mono flex items-center space-x-1"
                              title="Download draft manuscript file for this version"
                            >
                              <HardDrive className="w-3 h-3" />
                              <span>Manuscript</span>
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-mocha-200 font-medium">
                          {ver.changeNotes || `Revision v${ver.versionNumber}`}
                        </p>

                        <div className="flex items-center justify-between text-[11px] font-mono text-mocha-400 pt-1 border-t border-mocha-800/60">
                          <span>File: <strong className="text-mocha-300">{ver.originalFilename}</strong></span>
                          <span>Size: <strong className="text-mocha-300">{formatFileSize(ver.fileSize)}</strong></span>
                        </div>

                        <HashBadge hash={ver.sha256Hash} truncate={true} showLabel={true} />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={!!selectedWorkForCert}
        onClose={() => setSelectedWorkForCert(null)}
        work={selectedWorkForCert}
      />
    </div>
  );
};

export default DashboardPage;
