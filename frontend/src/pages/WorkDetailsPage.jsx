import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Download, 
  FileText, 
  Calendar, 
  Clock, 
  Tag, 
  User, 
  Binary, 
  SearchCheck, 
  Eye, 
  Loader2, 
  AlertCircle,
  HardDrive,
  GitBranch,
  History,
  Layers,
  Plus,
  X,
  CheckCircle2,
  Sparkles,
  BrainCircuit,
  Award
} from 'lucide-react';
import { worksApi, certificateApi } from '../services/api';
import HashBadge from '../components/HashBadge';
import CertificateModal from '../components/CertificateModal';
import FileDropzone from '../components/FileDropzone';
import CopyrightReadinessView from '../components/CopyrightReadinessView';

const WorkDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [certModalWork, setCertModalWork] = useState(null);

  // Active Tab: 'readiness' | 'versions' | 'vault'
  const tabFromQuery = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabFromQuery && ['readiness', 'versions', 'vault'].includes(tabFromQuery) ? tabFromQuery : 'readiness'
  );

  // Version Control State
  const [selectedVersionNum, setSelectedVersionNum] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState(null);
  const [changeNotes, setChangeNotes] = useState('');
  const [uploadingVersion, setUploadingVersion] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [versionError, setVersionError] = useState(null);
  const [duplicateNotice, setDuplicateNotice] = useState(null);

  useEffect(() => {
    fetchWork();
  }, [id]);

  const fetchWork = async () => {
    try {
      setLoading(true);
      const res = await worksApi.getById(id);
      if (res.data.success && res.data.work) {
        const fetchedWork = res.data.work;
        setWork(fetchedWork);
        // Default selected version to latest
        setSelectedVersionNum(fetchedWork.currentVersion || 1);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registered work record not found or access unauthorized.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Get active version object based on selection
  const versionsList = work?.versions && work.versions.length > 0 
    ? [...work.versions].sort((a, b) => b.versionNumber - a.versionNumber)
    : work ? [{
        versionNumber: 1,
        originalFilename: work.originalFilename,
        storedFilename: work.storedFilename,
        mimeType: work.mimeType,
        fileSize: work.fileSize,
        sha256Hash: work.sha256Hash,
        changeNotes: 'Initial registration',
        registeredAt: work.registeredAt,
      }] : [];

  const selectedVersion = versionsList.find(v => v.versionNumber === selectedVersionNum) || versionsList[0];

  const handleDownloadCertificate = async (versionNum) => {
    if (!work) return;
    const ver = versionNum || selectedVersion?.versionNumber || work.currentVersion || 1;
    try {
      setDownloadingCert(true);
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
      alert('Failed to download certificate PDF. Please try again.');
    } finally {
      setDownloadingCert(false);
    }
  };

  const handleDownloadOriginalFile = async (versionNum) => {
    if (!work) return;
    const ver = versionNum || selectedVersion?.versionNumber || work.currentVersion || 1;
    const targetVer = versionsList.find(v => v.versionNumber === ver) || selectedVersion;
    try {
      setDownloadingFile(true);
      const res = await worksApi.downloadOriginal(work._id, ver);
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
      alert('Failed to retrieve manuscript file from vault storage.');
    } finally {
      setDownloadingFile(false);
    }
  };

  const handleOpenCertificateModal = (versionObj) => {
    const ver = versionObj || selectedVersion;
    setCertModalWork({
      ...work,
      versionNumber: ver?.versionNumber || 1,
      versionLabel: ver?.versionNumber === work.currentVersion ? 'Latest' : 'Historical',
      sha256Hash: ver?.sha256Hash || work.sha256Hash,
      originalFilename: ver?.originalFilename || work.originalFilename,
      registeredAt: ver?.registeredAt || work.registeredAt,
    });
    setShowCertModal(true);
  };

  // Submit new revision / version
  const handleUploadNewVersion = async (e) => {
    e.preventDefault();
    if (!newVersionFile) {
      setVersionError('Please select a new manuscript file to upload.');
      return;
    }

    try {
      setUploadingVersion(true);
      setVersionError(null);
      setDuplicateNotice(null);

      const formData = new FormData();
      formData.append('file', newVersionFile);
      if (changeNotes.trim()) {
        formData.append('changeNotes', changeNotes.trim());
      }

      const res = await worksApi.createVersion(work._id, formData, (percent) => {
        setUploadProgress(percent);
      });

      if (res.data.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#cb9f54', '#dbb97c', '#e6cfa1', '#f6eed6']
        });

        const updatedWork = res.data.work;
        setWork(updatedWork);
        setSelectedVersionNum(res.data.newVersion?.versionNumber || updatedWork.currentVersion);
        if (res.data.duplicateNotice) {
          setDuplicateNotice(res.data.duplicateNotice);
        }

        // Close modal after brief delay or clear inputs
        setTimeout(() => {
          setShowUploadModal(false);
          setNewVersionFile(null);
          setChangeNotes('');
          setUploadProgress(0);
        }, 800);
      }
    } catch (err) {
      setVersionError(
        err.response?.data?.message || 'Failed to upload new revision. Please try again.'
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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
        <p className="text-sm font-mono text-mocha-300">Retrieving Vault Record & Version History...</p>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/40 border border-red-800 flex items-center justify-center text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-mocha-100">Unable to Access Work Record</h2>
        <p className="text-sm text-mocha-300">{error || 'Record does not exist.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 text-xs font-mono text-gold-400 hover:text-gold-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 text-xs font-mono text-mocha-400 hover:text-gold-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Author Vault</span>
        </Link>

        {/* Quick version indicator */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-mocha-400">Current Version:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/40 font-bold">
            v{work.currentVersion || 1}.0
          </span>
          <span className="text-mocha-500">({versionsList.length} revision{versionsList.length !== 1 ? 's' : ''})</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-8 sm:p-10 rounded-3xl bg-mocha-900/80 border border-mocha-700/80 shadow-mocha-deep space-y-8 backdrop-blur-sm">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-mocha-800">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-gold-500/10 text-gold-300 border border-gold-400/30">
                {work.category}
              </span>
              <span className="font-mono text-xs text-mocha-400">
                Token: <strong className="text-mocha-100">{work.registrationId}</strong>
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-mocha-50">
              {work.title}
            </h1>
            <p className="text-sm text-mocha-300">
              By <span className="text-mocha-100 font-medium">{work.authorName}</span>
            </p>
          </div>

          {/* Top Actions: Includes Version Control CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 text-mocha-950 shadow-md shadow-gold-500/25 hover:shadow-gold-glow transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 text-mocha-950" />
              <span>Register New Version</span>
            </button>

            <button
              onClick={() => handleOpenCertificateModal(selectedVersion)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-mocha-700 bg-mocha-800/80 text-xs font-medium text-mocha-200 hover:text-gold-300 hover:border-gold-400/40 transition-colors"
            >
              <Eye className="w-4 h-4 text-gold-400" />
              <span>Preview Certificate</span>
            </button>

            <button
              onClick={() => handleDownloadCertificate(selectedVersion?.versionNumber)}
              disabled={downloadingCert}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-gold-400/50 bg-mocha-900 text-xs font-medium text-gold-300 hover:bg-gold-500/10 transition-all"
            >
              {downloadingCert ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                  <span>Preparing PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-gold-400" />
                  <span>Download PDF (v{selectedVersion?.versionNumber || 1})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Synopsis / Description if present */}
        {work.description && (
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-gold-400/80">
              Synopsis & Notes
            </span>
            <p className="text-sm text-mocha-200/90 leading-relaxed bg-mocha-950/60 p-4 rounded-xl border border-mocha-800">
              {work.description}
            </p>
          </div>
        )}

        {/* PERSPECTIVE NAVIGATION TABS */}
        <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-mocha-950/90 border border-mocha-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('readiness');
              setSearchParams({ tab: 'readiness' });
            }}
            className={`flex-1 min-w-[190px] py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'readiness'
                ? 'bg-gradient-to-r from-gold-500/20 via-gold-400/15 to-gold-500/20 text-gold-300 border border-gold-400/50 shadow-md shadow-gold-500/10'
                : 'text-mocha-400 hover:text-mocha-200 hover:bg-mocha-900/50'
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-gold-400 shrink-0" />
            <span>AI Copyright Readiness</span>
            {work.copyrightReadiness?.score !== undefined && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold-500/20 text-gold-300 border border-gold-400/40">
                {work.copyrightReadiness.score}%
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('versions');
              setSearchParams({ tab: 'versions' });
            }}
            className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'versions'
                ? 'bg-gradient-to-r from-gold-500/20 via-gold-400/15 to-gold-500/20 text-gold-300 border border-gold-400/50 shadow-md shadow-gold-500/10'
                : 'text-mocha-400 hover:text-mocha-200 hover:bg-mocha-900/50'
            }`}
          >
            <GitBranch className="w-4 h-4 text-gold-400 shrink-0" />
            <span>Version History ({versionsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('vault');
              setSearchParams({ tab: 'vault' });
            }}
            className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'vault'
                ? 'bg-gradient-to-r from-gold-500/20 via-gold-400/15 to-gold-500/20 text-gold-300 border border-gold-400/50 shadow-md shadow-gold-500/10'
                : 'text-mocha-400 hover:text-mocha-200 hover:bg-mocha-900/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
            <span>Vault & Cryptographic Digest</span>
          </button>
        </div>

        {/* TAB 1: AI COPYRIGHT READINESS EVALUATION */}
        {activeTab === 'readiness' && (
          <CopyrightReadinessView
            work={work}
            onWorkUpdated={(updatedWork) => setWork(updatedWork)}
          />
        )}

        {/* TAB 2: DOCUMENT VERSION CONTROL & TIMELINE */}
        {activeTab === 'versions' && (
          <div className="p-6 sm:p-7 rounded-2xl bg-mocha-950/90 border border-gold-400/30 space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-mocha-800">
              <div className="flex items-center space-x-2.5">
                <GitBranch className="w-5 h-5 text-gold-400" />
                <h3 className="font-serif text-base sm:text-lg font-bold text-mocha-100">
                  Document Version History & Revisions
                </h3>
              </div>
              <span className="text-xs font-mono text-mocha-400">
                {versionsList.length} Registered Version{versionsList.length !== 1 ? 's' : ''}
              </span>
            </div>

            <p className="text-xs text-mocha-300 leading-relaxed">
              Each uploaded revision receives its own independent, authoritative SHA-256 binary fingerprint and archival certificate. 
              All prior drafts remain permanently cryptographically timestamped in your ownership chain.
            </p>

            {/* Version Selector Tabs & History Cards */}
            <div className="space-y-3">
              {versionsList.map((ver) => {
                const isSelected = ver.versionNumber === selectedVersionNum;
                const isLatest = ver.versionNumber === (work.currentVersion || 1);

                return (
                  <div
                    key={ver.versionNumber}
                    onClick={() => setSelectedVersionNum(ver.versionNumber)}
                    className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-mocha-900/90 border-gold-400 shadow-md shadow-gold-500/10'
                        : 'bg-mocha-950/60 border-mocha-800/80 hover:border-gold-400/40 hover:bg-mocha-900/40'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                            isLatest
                              ? 'bg-gold-500/20 text-gold-300 border border-gold-400/50'
                              : 'bg-mocha-800 text-mocha-300 border border-mocha-700'
                          }`}>
                            Version {ver.versionNumber}.0 {isLatest ? '• Current' : '• Historical'}
                          </span>
                          
                          <span className="text-xs font-mono text-mocha-400 flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(ver.registeredAt).toUTCString()}</span>
                          </span>
                        </div>

                        {/* Change notes */}
                        <p className="text-xs text-mocha-200 font-medium">
                          {ver.changeNotes || `Revision ${ver.versionNumber}`}
                        </p>

                        {/* File specs */}
                        <div className="flex items-center space-x-3 text-[11px] font-mono text-mocha-400">
                          <span>File: <strong className="text-mocha-300">{ver.originalFilename}</strong></span>
                          <span>•</span>
                          <span>Size: <strong className="text-mocha-300">{formatFileSize(ver.fileSize)}</strong></span>
                        </div>

                        {/* Hash Preview */}
                        <div className="pt-1.5">
                          <HashBadge hash={ver.sha256Hash} truncate={true} showLabel={true} />
                        </div>
                      </div>

                      {/* Version Specific Actions */}
                      <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCertificateModal(ver);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-mocha-700 bg-mocha-800 text-[11px] text-mocha-200 hover:text-gold-300 hover:border-gold-400/40 transition-colors flex items-center space-x-1"
                          title="Preview Certificate for this version"
                        >
                          <Eye className="w-3.5 h-3.5 text-gold-400" />
                          <span>Preview</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadCertificate(ver.versionNumber);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-gold-400/40 bg-gold-500/10 text-[11px] text-gold-300 hover:bg-gold-500/20 transition-colors flex items-center space-x-1"
                          title="Download Certificate PDF for this version"
                        >
                          <Download className="w-3.5 h-3.5 text-gold-400" />
                          <span>PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadOriginalFile(ver.versionNumber);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-mocha-700 bg-mocha-800 text-[11px] text-mocha-200 hover:text-mocha-100 hover:border-mocha-600 transition-colors flex items-center space-x-1"
                          title="Download original manuscript file from vault for this version"
                        >
                          <HardDrive className="w-3.5 h-3.5 text-mocha-400" />
                          <span>Draft</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CRYPTOGRAPHIC PROOF & VAULT */}
        {activeTab === 'vault' && (
          <div className="space-y-6 animate-fade-in">
            {/* Selected Version Cryptographic Hash Showcase */}
            <div className="p-6 rounded-2xl bg-mocha-950/70 border border-mocha-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-gold-400 tracking-wider flex items-center space-x-2">
                  <Binary className="w-4 h-4 text-gold-400" />
                  <span>
                    SHA-256 Digest for Version {selectedVersion?.versionNumber || 1}.0 
                    {selectedVersion?.versionNumber === (work.currentVersion || 1) ? ' (Current)' : ' (Historical)'}
                  </span>
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  Immutable Digest
                </span>
              </div>
              <HashBadge hash={selectedVersion?.sha256Hash || work.sha256Hash} truncate={false} showLabel={false} />
              <p className="text-[11px] text-mocha-400 leading-tight">
                Calculated server-side from the exact binary bytes of <span className="font-mono text-mocha-200">{selectedVersion?.originalFilename || work.originalFilename}</span>.
              </p>
            </div>

            {/* Technical & Audit Details Grid for Selected Version */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Box 1: File Storage Details */}
              <div className="p-6 rounded-2xl bg-mocha-950/50 border border-mocha-800 space-y-4">
                <h4 className="font-serif text-sm font-bold text-mocha-100 flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-gold-400" />
                  <span>Version {selectedVersion?.versionNumber || 1}.0 Manuscript Artifact</span>
                </h4>
                <div className="space-y-2.5 text-xs font-mono text-mocha-300">
                  <div className="flex justify-between border-b border-mocha-800/60 pb-1.5">
                    <span className="text-mocha-400">Original Filename:</span>
                    <span className="text-mocha-100 truncate max-w-[200px]">{selectedVersion?.originalFilename || work.originalFilename}</span>
                  </div>
                  <div className="flex justify-between border-b border-mocha-800/60 pb-1.5">
                    <span className="text-mocha-400">File Size:</span>
                    <span className="text-mocha-100">{formatFileSize(selectedVersion?.fileSize || work.fileSize)}</span>
                  </div>
                  <div className="flex justify-between border-b border-mocha-800/60 pb-1.5">
                    <span className="text-mocha-400">MIME Type:</span>
                    <span className="text-mocha-100">{selectedVersion?.mimeType || work.mimeType}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-mocha-400">Vault Access:</span>
                    <span className="text-emerald-400">Author Only (Secure)</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadOriginalFile(selectedVersion?.versionNumber)}
                  disabled={downloadingFile}
                  className="w-full mt-3 py-2 px-3 rounded-lg border border-mocha-700 bg-mocha-900 text-xs text-mocha-200 hover:text-gold-300 hover:border-gold-400/40 flex items-center justify-center space-x-2 transition-colors"
                >
                  {downloadingFile ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-400" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-gold-400" />
                  )}
                  <span>Download Version {selectedVersion?.versionNumber || 1} From Vault</span>
                </button>
              </div>

              {/* Box 2: Audit & Verification Stats */}
              <div className="p-6 rounded-2xl bg-mocha-950/50 border border-mocha-800 space-y-4">
                <h4 className="font-serif text-sm font-bold text-mocha-100 flex items-center space-x-2">
                  <SearchCheck className="w-4 h-4 text-gold-400" />
                  <span>Registry Timestamp & Audit</span>
                </h4>
                <div className="space-y-2.5 text-xs font-mono text-mocha-300">
                  <div className="flex justify-between border-b border-mocha-800/60 pb-1.5">
                    <span className="text-mocha-400">Version Registered (UTC):</span>
                    <span className="text-mocha-100">{new Date(selectedVersion?.registeredAt || work.registeredAt).toUTCString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-mocha-800/60 pb-1.5">
                    <span className="text-mocha-400">Verification Checks:</span>
                    <span className="text-emerald-400">{work.verificationCount || 0} times</span>
                  </div>
                  <div className="flex justify-between border-b border-mocha-800/60 pb-1.5">
                    <span className="text-mocha-400">Total Work Versions:</span>
                    <span className="text-gold-300 font-bold">{versionsList.length} editions</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-mocha-400">Registry Status:</span>
                    <span className="text-emerald-400 font-bold uppercase">{work.status}</span>
                  </div>
                </div>

                <Link
                  to={`/verify?token=${work.registrationId}`}
                  className="w-full mt-3 py-2 px-3 rounded-lg border border-gold-400/30 bg-gold-500/10 text-xs text-gold-300 hover:bg-gold-500/20 hover:text-gold-200 flex items-center justify-center space-x-2 transition-colors"
                >
                  <SearchCheck className="w-3.5 h-3.5" />
                  <span>Test In Verification Suite</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Register New Version / Revision */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-mocha-950 border border-gold-400/50 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-mocha-800 bg-mocha-900/80">
              <div className="flex items-center space-x-2.5">
                <GitBranch className="w-5 h-5 text-gold-400" />
                <h3 className="font-serif text-lg font-medium text-mocha-100">
                  Register New Version (v{(work.currentVersion || 1) + 1}.0)
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setNewVersionFile(null);
                  setVersionError(null);
                }}
                className="p-1 rounded-lg text-mocha-400 hover:text-mocha-100 hover:bg-mocha-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadNewVersion} className="p-6 space-y-5">
              {versionError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{versionError}</span>
                </div>
              )}

              {duplicateNotice && (
                <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800/80 text-xs text-amber-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{duplicateNotice}</span>
                </div>
              )}

              {/* File Dropzone */}
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

              {/* Change Notes / Revision Summary */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase text-mocha-300">
                  Change Notes / Revision Summary (Optional)
                </label>
                <textarea
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  placeholder="e.g. Chapter 4 dialogue revised; fixed pacing in climax; updated prologue."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-mocha-900 border border-mocha-700 text-mocha-100 placeholder-mocha-400/50 focus:outline-none focus:border-gold-400 text-xs resize-none"
                />
              </div>

              {/* Upload Progress Bar */}
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

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-mocha-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
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
                      <span>Fingerprinting & Saving...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-mocha-950" />
                      <span>Certify Version {(work.currentVersion || 1) + 1}.0</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal Preview */}
      <CertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        work={certModalWork || work}
      />
    </div>
  );
};

export default WorkDetailsPage;
