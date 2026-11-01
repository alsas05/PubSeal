import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  UploadCloud, 
  FileText, 
  Binary, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Info,
  Sparkles,
  GitBranch,
  Plus,
  BrainCircuit,
  Scale
} from 'lucide-react';
import { worksApi, certificateApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FileDropzone from '../components/FileDropzone';
import HashBadge from '../components/HashBadge';

const CATEGORIES = [
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

const RegisterWorkPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode: 'new' (brand new work) or 'revision' (new version of existing work)
  const initialMode = searchParams.get('mode') === 'revision' ? 'revision' : 'new';
  const initialWorkId = searchParams.get('workId') || '';

  const [registrationMode, setRegistrationMode] = useState(initialMode);
  const [existingWorks, setExistingWorks] = useState([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [selectedExistingWorkId, setSelectedExistingWorkId] = useState(initialWorkId);

  // Form State
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Novel');
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [description, setDescription] = useState('');
  const [changeNotes, setChangeNotes] = useState('');

  // Optional Readiness Pre-configuration
  const [showReadinessFields, setShowReadinessFields] = useState(false);
  const [yearCompleted, setYearCompleted] = useState(new Date().getFullYear());
  const [natureOfAuthorship, setNatureOfAuthorship] = useState('Entire text');
  const [humanAuthorshipCertified, setHumanAuthorshipCertified] = useState(true);

  // Submission State
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [duplicateNotice, setDuplicateNotice] = useState(null);
  const [registeredWork, setRegisteredWork] = useState(null);
  const [downloadingCert, setDownloadingCert] = useState(false);

  // Fetch author's existing works for revision selection
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        setLoadingExisting(true);
        const res = await worksApi.getAll({ limit: 50 });
        if (res.data.success && res.data.works) {
          setExistingWorks(res.data.works);
          if (!selectedExistingWorkId && res.data.works.length > 0) {
            setSelectedExistingWorkId(res.data.works[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load existing works:', err);
      } finally {
        setLoadingExisting(false);
      }
    };

    fetchExisting();
  }, []);

  const selectedExistingWork = existingWorks.find((w) => w._id === selectedExistingWorkId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setDuplicateNotice(null);

    if (!file) {
      setError('Please attach your creative work manuscript file (.pdf, .docx, or .txt).');
      return;
    }

    // MODE 1: UPLOAD REVISION TO EXISTING WORK
    if (registrationMode === 'revision') {
      if (!selectedExistingWorkId) {
        setError('Please select an existing document to upload a new version for.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      if (changeNotes.trim()) {
        formData.append('changeNotes', changeNotes.trim());
      }

      try {
        setLoading(true);
        setUploadProgress(15);

        const res = await worksApi.createVersion(selectedExistingWorkId, formData, (percent) => {
          setUploadProgress(percent);
        });

        if (res.data.success && res.data.work) {
          setRegisteredWork(res.data.work);
          if (res.data.duplicateNotice) {
            setDuplicateNotice(res.data.duplicateNotice);
          }

          confetti({
            particleCount: 85,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#cb9f54', '#dbb97c', '#e6cfa1', '#f6eed6'],
          });
        }
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to register manuscript revision. Please try again.'
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    // MODE 2: REGISTER BRAND NEW WORK
    if (!title.trim()) {
      setError('Please provide a title for your creative work.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    formData.append('category', category);
    formData.append('authorName', authorName.trim() || user?.name || 'Author');
    if (description.trim()) {
      formData.append('description', description.trim());
    }
    if (showReadinessFields) {
      formData.append('yearCompleted', yearCompleted);
      formData.append('natureOfAuthorship', natureOfAuthorship);
      formData.append('humanAuthorshipCertified', humanAuthorshipCertified);
    }

    try {
      setLoading(true);
      setUploadProgress(10);

      const res = await worksApi.create(formData, (percent) => {
        setUploadProgress(percent);
      });

      if (res.data.success && res.data.work) {
        setRegisteredWork(res.data.work);
        if (res.data.duplicateNotice) {
          setDuplicateNotice(res.data.duplicateNotice);
        }

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#cb9f54', '#dbb97c', '#e6cfa1', '#38261b'],
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please review your file and details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!registeredWork) return;
    try {
      setDownloadingCert(true);
      const res = await certificateApi.downloadPdf(
        registeredWork.registrationId || registeredWork._id,
        registeredWork.currentVersion || 1
      );
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `PubSeal-Certificate-${registeredWork.registrationId}-v${registeredWork.currentVersion || 1}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Unable to download certificate PDF right now. Please try again.');
    } finally {
      setDownloadingCert(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Title */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-mono uppercase tracking-widest text-gold-400">
          Cryptographic Manuscript Registry
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-mocha-50">
          Register Creative Work
        </h1>
        <p className="text-sm text-mocha-300">
          Certify fresh manuscripts or register updated revisions into your immutable ownership history.
        </p>
      </div>

      {/* Success View */}
      {registeredWork ? (
        <div className="p-8 sm:p-10 rounded-3xl bg-mocha-900 border border-gold-400/50 shadow-mocha-deep space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-mocha-50">
              {registrationMode === 'revision'
                ? `Version ${registeredWork.currentVersion || 1}.0 Successfully Certified!`
                : 'Work Successfully Registered & Fingerprinted'}
            </h2>
            <p className="text-sm text-mocha-300 max-w-md mx-auto">
              {registrationMode === 'revision'
                ? 'Your new revision has been fingerprinted and appended to your document version history.'
                : 'Your manuscript has been stored in your private vault and its authoritative SHA-256 fingerprint recorded.'}
            </p>
          </div>

          {duplicateNotice && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/50 text-xs text-amber-200 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{duplicateNotice}</span>
            </div>
          )}

          {/* Registration Record Card */}
          <div className="p-6 rounded-2xl bg-mocha-950/80 border border-mocha-800 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-mocha-800/80">
              <div>
                <span className="text-[10px] font-mono uppercase text-gold-400/80">
                  Unique Registration Token
                </span>
                <p className="font-mono text-base font-bold text-mocha-50">
                  {registeredWork.registrationId}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-gold-400/80">
                  Certified Edition
                </span>
                <p className="font-mono text-sm font-bold text-gold-300">
                  Version {registeredWork.currentVersion || 1}.0 (Latest)
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-gold-400/80">
                  Work Title
                </span>
                <p className="font-serif font-bold text-mocha-100 text-sm">
                  {registeredWork.title}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-gold-400/80">
                  Certified Timestamp (UTC)
                </span>
                <p className="font-mono text-xs text-mocha-200">
                  {new Date(registeredWork.registeredAt).toUTCString()}
                </p>
              </div>
            </div>

            {/* SHA-256 Digest Box */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-gold-400 block">
                Authoritative SHA-256 Fingerprint
              </span>
              <HashBadge hash={registeredWork.sha256Hash} truncate={false} />
            </div>

            {/* AI Copyright Readiness Showcase */}
            {registeredWork.copyrightReadiness?.score !== undefined && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-mocha-900 via-mocha-950 to-mocha-900 border border-gold-400/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 text-center sm:text-left">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/15 border border-gold-400/40 flex items-center justify-center text-gold-400 shrink-0">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-mocha-400 block">AI Copyright Readiness</span>
                    <span className="font-serif text-sm sm:text-base font-bold text-mocha-100">
                      {registeredWork.copyrightReadiness.score}% • {registeredWork.copyrightReadiness.grade}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/works/${registeredWork._id}?tab=readiness`}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gold-500/20 text-gold-300 border border-gold-400/50 hover:bg-gold-500/30 transition-all shrink-0"
                >
                  <span>Explore Readiness Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleDownloadCertificate}
              disabled={downloadingCert}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-medium text-sm bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:from-gold-400 hover:to-gold-300 shadow-md shadow-gold-500/20 hover:shadow-gold-glow transition-all"
            >
              {downloadingCert ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-mocha-950" />
                  <span>Preparing Certificate PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-mocha-950" />
                  <span>Download Certificate PDF (v{registeredWork.currentVersion || 1}.0)</span>
                </>
              )}
            </button>

            <Link
              to={`/works/${registeredWork._id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-medium text-sm border border-mocha-700 bg-mocha-800/80 text-mocha-200 hover:text-gold-300 hover:border-gold-400/40 transition-colors"
            >
              <span>View Document & Version History</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Form View */
        <div className="p-8 sm:p-10 rounded-3xl bg-mocha-900/80 border border-mocha-700/80 shadow-mocha-deep backdrop-blur-sm space-y-8">
          
          {/* Registration Mode Selector */}
          <div className="flex items-center justify-center p-1.5 rounded-2xl bg-mocha-950 border border-mocha-800 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => {
                setRegistrationMode('new');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                registrationMode === 'new'
                  ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 shadow-sm'
                  : 'text-mocha-300 hover:text-gold-200'
              }`}
            >
              New Literary Work
            </button>
            <button
              type="button"
              onClick={() => {
                setRegistrationMode('revision');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center space-x-1.5 ${
                registrationMode === 'revision'
                  ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 shadow-sm'
                  : 'text-mocha-300 hover:text-gold-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Upload Revision</span>
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-xs text-red-200 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* If Revision Mode: Work Selector */}
            {registrationMode === 'revision' && (
              <div className="p-5 rounded-2xl bg-mocha-950 border border-gold-400/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-gold-300 font-bold">
                    Select Existing Work to Update
                  </label>
                  {selectedExistingWork && (
                    <span className="text-[11px] font-mono text-gold-400">
                      Currently v{selectedExistingWork.currentVersion || 1}.0 → Next will be v{(selectedExistingWork.currentVersion || 1) + 1}.0
                    </span>
                  )}
                </div>

                {existingWorks.length === 0 ? (
                  <p className="text-xs text-mocha-400">
                    No existing works found in your vault. Switch to "New Literary Work" to register your first manuscript.
                  </p>
                ) : (
                  <select
                    value={selectedExistingWorkId}
                    onChange={(e) => setSelectedExistingWorkId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-mocha-900 border border-mocha-700 text-mocha-100 text-sm focus:outline-none focus:border-gold-400 font-mono text-xs"
                  >
                    {existingWorks.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.title} ({w.registrationId} • v{w.currentVersion || 1}.0)
                      </option>
                    ))}
                  </select>
                )}

                {/* Change notes */}
                <div className="pt-2">
                  <label className="block text-xs font-mono uppercase text-mocha-300 mb-1.5">
                    Revision Notes / What Changed? (Optional)
                  </label>
                  <textarea
                    value={changeNotes}
                    onChange={(e) => setChangeNotes(e.target.value)}
                    placeholder="e.g. Chapter 4 dialogue polish, updated prologue, grammar copyedit."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-mocha-900 border border-mocha-700 text-mocha-100 placeholder-mocha-400/50 focus:outline-none focus:border-gold-400 text-xs resize-none"
                  />
                </div>
              </div>
            )}

            {/* 1. File Upload Dropzone (Supports unlimited size) */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-mocha-300">
                {registrationMode === 'revision' ? 'Upload Updated Manuscript File' : '1. Select Creative Manuscript File'} <span className="text-gold-400">*</span>
              </label>
              <FileDropzone
                selectedFile={file}
                onFileSelected={(f) => setFile(f)}
                onClear={() => setFile(null)}
                label={registrationMode === 'revision' ? 'Drop revised manuscript draft here' : 'Drop your unpublished manuscript here'}
              />
            </div>

            {/* 2. Metadata for Brand New Work */}
            {registrationMode === 'new' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase text-mocha-300 mb-1.5">
                    Work Title <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Whispers of the Obsidian Shore"
                    className="w-full px-4 py-2.5 rounded-xl bg-mocha-950 border border-mocha-700 text-mocha-100 placeholder-mocha-400/50 focus:outline-none focus:border-gold-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-mocha-300 mb-1.5">
                    Category / Literary Form <span className="text-gold-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-mocha-950 border border-mocha-700 text-mocha-100 text-sm focus:outline-none focus:border-gold-400"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-mocha-300 mb-1.5">
                    Author / Creator Name (or Pseudonym) <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Author Name"
                    className="w-full px-4 py-2.5 rounded-xl bg-mocha-950 border border-mocha-700 text-mocha-100 text-sm focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase text-mocha-300 mb-1.5">
                    Synopsis / Summary & Working Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a brief summary, logline, or contextual notes about this creative work..."
                    className="w-full px-4 py-2.5 rounded-xl bg-mocha-950 border border-mocha-700 text-mocha-100 placeholder-mocha-400/50 focus:outline-none focus:border-gold-400 text-sm resize-none"
                  />
                </div>

                {/* Optional Statutory Copyright Readiness Pre-configuration */}
                <div className="sm:col-span-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowReadinessFields(!showReadinessFields)}
                    className="inline-flex items-center space-x-2 text-xs font-mono text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>{showReadinessFields ? '− Hide' : '+ Configure'} Statutory Copyright Readiness Parameters (Optional)</span>
                  </button>

                  {showReadinessFields && (
                    <div className="mt-3 p-4 rounded-2xl bg-mocha-950/70 border border-mocha-800 space-y-4 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono uppercase text-mocha-300 mb-1">
                            Year of Completion
                          </label>
                          <input
                            type="number"
                            min="1900"
                            max="2100"
                            value={yearCompleted}
                            onChange={(e) => setYearCompleted(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl bg-mocha-900 border border-mocha-700 text-mocha-100 text-xs font-mono focus:outline-none focus:border-gold-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase text-mocha-300 mb-1">
                            Nature of Authorship Claim
                          </label>
                          <input
                            type="text"
                            value={natureOfAuthorship}
                            onChange={(e) => setNatureOfAuthorship(e.target.value)}
                            placeholder='e.g. "Entire text", "Poetry collection"'
                            className="w-full px-3 py-2 rounded-xl bg-mocha-900 border border-mocha-700 text-mocha-100 text-xs focus:outline-none focus:border-gold-400"
                          />
                        </div>
                      </div>

                      <label className="flex items-start space-x-2.5 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={humanAuthorshipCertified}
                          onChange={(e) => setHumanAuthorshipCertified(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-mocha-600 bg-mocha-900 text-gold-500"
                        />
                        <span className="text-xs text-mocha-200">
                          Certify Original Human Authorship (U.S. Copyright Office AI Compliance)
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Evidentiary Notice */}
            <div className="p-4 rounded-xl bg-mocha-950/60 border border-mocha-800 space-y-2 text-xs text-mocha-300">
              <div className="flex items-center space-x-2 text-gold-400 font-serif font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Notice on Cryptographic Proof of Existence</span>
              </div>
              <p className="leading-relaxed text-mocha-400">
                PubSeal establishes mathematical proof of document possession and byte-exact integrity at an immutable server timestamp. 
                {registrationMode === 'revision'
                  ? ' Each revision is permanently recorded with its own cryptographic fingerprint without overwriting past versions.'
                  : ' Subsequent revisions can be registered at any time to maintain a verifiable version history.'}
              </p>
            </div>

            {/* Progress Bar when uploading */}
            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-gold-300">
                  <span>Uploading & Calculating SHA-256 Digest...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-mocha-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !file || (registrationMode === 'revision' && !selectedExistingWorkId)}
              className="w-full py-4 rounded-xl font-medium text-base bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 text-mocha-950 hover:from-gold-400 hover:to-gold-300 shadow-md shadow-gold-500/20 hover:shadow-gold-glow transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-mocha-950" />
                  <span>Streaming Bytes & Generating Fingerprint...</span>
                </>
              ) : registrationMode === 'revision' ? (
                <>
                  <Sparkles className="w-5 h-5 text-mocha-950" />
                  <span>Certify New Version</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-mocha-950" />
                  <span>Register Manuscript & Generate Certificate</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RegisterWorkPage;
