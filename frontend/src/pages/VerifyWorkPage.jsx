import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  SearchCheck, 
  UploadCloud, 
  FileText, 
  Binary, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Download,
  Info,
  ExternalLink,
  Search
} from 'lucide-react';
import { verificationApi, certificateApi } from '../services/api';
import FileDropzone from '../components/FileDropzone';
import HashBadge from '../components/HashBadge';
import CertificateModal from '../components/CertificateModal';

const VerifyWorkPage = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'lookup'
  const [file, setFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Lookup state
  const [query, setQuery] = useState(tokenParam || '');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);

  // Certificate Modal state
  const [modalWork, setModalWork] = useState(null);
  const [downloadingCert, setDownloadingCert] = useState(false);

  // If token is present in URL, auto-trigger lookup
  useEffect(() => {
    if (tokenParam) {
      setActiveTab('lookup');
      handleLookup(tokenParam);
    }
  }, [tokenParam]);

  const handleFileVerification = async (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setVerifying(true);
      const res = await verificationApi.checkFile(formData);
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Verification process encountered an unexpected error.'
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleLookup = async (queryString) => {
    const q = queryString !== undefined ? queryString : query;
    if (!q || !q.trim()) return;

    setLookupResult(null);
    setError(null);

    try {
      setLookingUp(true);
      const res = await verificationApi.lookup(q.trim());
      setLookupResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lookup failed.');
    } finally {
      setLookingUp(false);
    }
  };

  const handleDownloadCert = async (work) => {
    try {
      setDownloadingCert(true);
      const res = await certificateApi.downloadPdf(work.registrationId);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PubSeal-Certificate-${work.registrationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Unable to download certificate.');
    } finally {
      setDownloadingCert(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-mono uppercase tracking-widest text-gold-400">
          Independent Integrity Verification
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-mocha-50">
          PubSeal Verification Suite
        </h1>
        <p className="text-sm text-mocha-300">
          Test any creative manuscript file or registration ID against the immutable cryptographic registry.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center space-x-2 border-b border-mocha-800 pb-4">
        <button
          onClick={() => {
            setActiveTab('upload');
            setError(null);
          }}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'upload'
              ? 'bg-gold-500 text-mocha-950 font-semibold shadow-gold-glow'
              : 'text-mocha-300 hover:text-gold-300 hover:bg-mocha-900'
          }`}
        >
          Verify by File Upload
        </button>
        <button
          onClick={() => {
            setActiveTab('lookup');
            setError(null);
          }}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'lookup'
              ? 'bg-gold-500 text-mocha-950 font-semibold shadow-gold-glow'
              : 'text-mocha-300 hover:text-gold-300 hover:bg-mocha-900'
          }`}
        >
          Lookup by Registration ID / Hash
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-xs text-red-200 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: File Verification */}
      {activeTab === 'upload' && (
        <div className="space-y-8">
          <div className="p-8 rounded-3xl bg-mocha-900/80 border border-mocha-700/80 shadow-mocha-deep backdrop-blur-sm space-y-6">
            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-mocha-100">
                Upload Manuscript to Check Cryptographic Match
              </h3>
              <p className="text-xs text-mocha-300 max-w-md mx-auto">
                We will calculate the raw SHA-256 fingerprint on the server and check if an identical file has been registered.
              </p>
            </div>

            <FileDropzone
              selectedFile={file}
              onFileSelected={handleFileVerification}
              onClear={() => {
                setFile(null);
                setResult(null);
              }}
              label="Drop manuscript to verify integrity"
            />

            {verifying && (
              <div className="p-6 rounded-2xl bg-mocha-950/60 border border-mocha-800 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
                <p className="text-xs font-mono text-gold-300">
                  Reading Raw Binary Bytes & Computing SHA-256...
                </p>
              </div>
            )}
          </div>

          {/* Verification Result Display */}
          {result && (
            <div className="animate-fade-in space-y-6">
              {result.match ? (
                /* MATCH FOUND */
                <div className="p-8 rounded-3xl bg-mocha-900 border-2 border-emerald-500/50 shadow-2xl space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                        EXACT CRYPTOGRAPHIC MATCH CONFIRMED
                      </span>
                      <h2 className="font-serif text-2xl font-bold text-mocha-50 mt-1">
                        {result.work.title}
                      </h2>
                      <p className="text-xs text-mocha-300">
                        Registered to: <strong className="text-mocha-100">{result.work.authorName}</strong> ({result.work.category})
                      </p>
                      {/* Version match badge */}
                      <div className="flex items-center space-x-2.5 mt-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                          result.version?.isLatest
                            ? 'bg-gold-500/20 text-gold-300 border border-gold-400/50'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-600/40'
                        }`}>
                          Matched Version {result.version?.versionNumber || 1}.0 {result.version?.isLatest ? '• Current Latest' : `• Historical Revision (Latest is v${result.work.currentVersion || 1})`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!result.version?.isLatest && (
                    <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-700/50 text-xs text-amber-200">
                      <strong>Historical Draft Notice:</strong> This document matches an earlier version (Version {result.version?.versionNumber || 1}) of the author’s registered work. The author has since published Version {result.work.currentVersion}.
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-mocha-200/90 leading-relaxed bg-mocha-950/80 p-4 rounded-xl border border-mocha-800">
                    The uploaded document is bit-for-bit identical to the registered manuscript in the PubSeal vault. 
                    Not a single byte, comma, or whitespace character has been altered since registration.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono p-4 rounded-xl bg-mocha-950/60 border border-mocha-800">
                    <div>
                      <span className="text-mocha-400 block text-[10px] uppercase">Registration Token</span>
                      <span className="text-mocha-100 font-bold">{result.work.registrationId}</span>
                    </div>
                    <div>
                      <span className="text-mocha-400 block text-[10px] uppercase">Registered Timestamp</span>
                      <span className="text-mocha-100">{new Date(result.work.registeredAt).toUTCString()}</span>
                    </div>
                  </div>

                  {/* Hash comparison */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-gold-400 block">
                      Matching SHA-256 Digest
                    </span>
                    <HashBadge hash={result.calculatedHash} truncate={false} showLabel={false} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => handleDownloadCert(result.work)}
                      disabled={downloadingCert}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-medium bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:from-gold-400 hover:to-gold-300 shadow-gold-glow transition-all"
                    >
                      {downloadingCert ? (
                        <Loader2 className="w-4 h-4 animate-spin text-mocha-950" />
                      ) : (
                        <Download className="w-4 h-4 text-mocha-950" />
                      )}
                      <span>Download Registration Certificate</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* NO MATCH FOUND */
                <div className="p-8 rounded-3xl bg-mocha-900 border-2 border-amber-600/40 shadow-xl space-y-5">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <XCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-amber-950 text-amber-300 border border-amber-500/30 font-bold uppercase">
                        NO MATCHING RECORD FOUND
                      </span>
                      <h2 className="font-serif text-xl font-bold text-mocha-50 mt-1">
                        Unregistered or Modified Digital Artifact
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-mocha-300 leading-relaxed bg-mocha-950/80 p-4 rounded-xl border border-mocha-800">
                    {result.message} <br />
                    <span className="text-mocha-400 block mt-1.5">{result.explanation}</span>
                  </p>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-mocha-400 block">
                      Calculated SHA-256 Digest of Uploaded File:
                    </span>
                    <HashBadge hash={result.calculatedHash} truncate={false} showLabel={false} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Direct Token / Hash Lookup */}
      {activeTab === 'lookup' && (
        <div className="p-8 rounded-3xl bg-mocha-900/80 border border-mocha-700/80 shadow-mocha-deep backdrop-blur-sm space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-serif text-lg font-bold text-mocha-100">
              Lookup by Token or Hash Digest
            </h3>
            <p className="text-xs text-mocha-300 max-w-md mx-auto">
              Enter a PubSeal Registration Token (e.g. PUB-2026-3E5F763F) or a 64-character SHA-256 string.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mocha-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="PUB-2026-... or SHA-256 hash"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-mocha-950 border border-mocha-700 text-mocha-100 placeholder-mocha-400/50 font-mono text-xs sm:text-sm focus:outline-none focus:border-gold-400"
              />
            </div>
            <button
              type="submit"
              disabled={lookingUp}
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-medium bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:from-gold-400 hover:to-gold-300 shadow-md shadow-gold-500/20 hover:shadow-gold-glow flex items-center justify-center space-x-2 shrink-0 transition-all"
            >
              {lookingUp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-mocha-950" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Lookup Record</span>
              )}
            </button>
          </form>

          {/* Lookup Result */}
          {lookupResult && (
            <div className="pt-4 border-t border-mocha-800 animate-fade-in">
              {lookupResult.found ? (
                <div className="p-6 rounded-2xl bg-mocha-950/80 border border-emerald-500/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      Verified Registration Record
                    </span>
                    <span className="font-mono text-xs text-gold-400 font-bold">
                      {lookupResult.work.registrationId}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif text-xl font-bold text-mocha-50">
                      {lookupResult.work.title}
                    </h4>
                    <p className="text-xs text-mocha-300 mt-0.5">
                      By {lookupResult.work.authorName} • {lookupResult.work.category}
                    </p>
                  </div>

                  <div className="text-xs font-mono text-mocha-300 space-y-1">
                    <div className="flex justify-between border-b border-mocha-800 pb-1">
                      <span className="text-mocha-400">Timestamp:</span>
                      <span>{new Date(lookupResult.work.registeredAt).toUTCString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-mocha-800 pb-1">
                      <span className="text-mocha-400">Original Filename:</span>
                      <span>{lookupResult.work.originalFilename}</span>
                    </div>
                  </div>

                  <HashBadge hash={lookupResult.work.sha256Hash} truncate={false} />

                  {lookupResult.work.versions && lookupResult.work.versions.length > 1 && (
                    <div className="space-y-2 pt-2 border-t border-mocha-800">
                      <span className="text-[11px] font-mono text-gold-400 block uppercase font-bold">
                        Certified Version History ({lookupResult.work.versions.length} Editions)
                      </span>
                      <div className="space-y-2">
                        {lookupResult.work.versions.map((v) => (
                          <div key={v.versionNumber} className="p-2.5 rounded-lg bg-mocha-900/60 border border-mocha-800 text-xs font-mono">
                            <div className="flex justify-between items-center text-mocha-200">
                              <span className="font-bold text-gold-300">Version {v.versionNumber}.0 {v.isLatest ? '(Latest)' : ''}</span>
                              <span className="text-[10px] text-mocha-400">{new Date(v.registeredAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[11px] text-mocha-400 mt-0.5">{v.changeNotes || v.originalFilename}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleDownloadCert(lookupResult.work)}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium bg-gold-500 text-mocha-950 hover:bg-gold-400 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-mocha-950" />
                    <span>Download Certificate PDF</span>
                  </button>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-mocha-950/80 border border-amber-600/30 text-center space-y-2">
                  <XCircle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="font-serif text-base font-bold text-mocha-100">
                    No Matching Record Found
                  </p>
                  <p className="text-xs text-mocha-300 max-w-sm mx-auto">
                    {lookupResult.message}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Legal distinction note */}
      <div className="p-4 rounded-xl bg-mocha-950/60 border border-mocha-800 text-xs text-mocha-400 leading-relaxed">
        <strong className="text-gold-400 font-medium">Verification Note: </strong>
        Verification mathematically confirms whether an uploaded file is byte-for-byte identical to the registered manuscript at its certified timestamp. PubSeal does not assess artistic merit or represent an official determination of copyright ownership.
      </div>
    </div>
  );
};

export default VerifyWorkPage;

