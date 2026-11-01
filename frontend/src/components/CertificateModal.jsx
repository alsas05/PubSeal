import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Download, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { certificateApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CertificateModal = ({ isOpen, onClose, work, isSample = false }) => {
  const { isAuthenticated } = useAuth();
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !work) return null;

  // Only allow download if authenticated and not a sample specimen preview
  const canDownload = !isSample && isAuthenticated;

  const handleDownload = async () => {
    if (!canDownload) return;
    try {
      setDownloading(true);
      const res = await certificateApi.downloadPdf(work.registrationId || work._id, work.versionNumber);
      
      // Create download blob
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PubSeal-Certificate-${work.registrationId}-v${work.versionNumber || work.currentVersion || 1}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download certificate PDF:', err);
      alert('Unable to generate certificate PDF right now. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-mocha-950 border border-gold-400/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-mocha-800 bg-mocha-900/80">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-gold-400" />
            <h3 className="font-serif text-lg font-medium text-mocha-100">
              {isSample ? 'Sample Certificate Preview' : 'Digital Certificate Preview'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-mocha-400 hover:text-mocha-100 hover:bg-mocha-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Parchment Body */}
        <div className="p-6 overflow-y-auto">
          <div className="relative p-6 sm:p-8 rounded-xl bg-[#FAF6F0] text-mocha-950 border-4 border-[#261912] shadow-xl overflow-hidden">
            {/* Inner Gold Border */}
            <div className="absolute inset-2 border border-gold-500/70 pointer-events-none"></div>

            {/* Parchment Champagne Gold Logo Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
              <img
                src="/PubSeal_logo_gold_tight.png"
                alt=""
                className="w-64 sm:w-80 max-w-none opacity-[0.08] object-contain filter drop-shadow-sm"
              />
            </div>

            {/* Specimen watermark badge if sample */}
            {isSample && (
              <div className="absolute top-4 right-4 z-10 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-gold-500/20 text-gold-900 border border-gold-600/40">
                Sample Specimen
              </div>
            )}

            {/* Header */}
            <div className="text-center space-y-1 mb-6">
              <span className="font-serif text-2xl font-black tracking-widest text-mocha-950">
                PUBSEAL
              </span>
              <p className="text-[10px] tracking-widest font-mono text-gold-700 uppercase">
                Secure Digital Ownership Registry for Writers
              </p>
              <div className="w-32 h-0.5 bg-gold-600 mx-auto my-2"></div>
              <h4 className="font-serif text-sm font-bold text-mocha-900 tracking-wider">
                CERTIFICATE OF DIGITAL REGISTRATION & INTEGRITY
              </h4>
            </div>

            {/* Statement */}
            <p className="text-xs text-mocha-800 text-center leading-relaxed mb-6 max-w-xl mx-auto">
              This archival certificate records that the creative literary work below was submitted to PubSeal, where an immutable SHA-256 cryptographic fingerprint was calculated from the original file bytes upon timestamped registration.
            </p>

            {/* Details Grid */}
            <div className="bg-[#FFFDF9] border border-gold-300 rounded-lg p-5 mb-5 space-y-2.5 text-xs">
              <div className="grid grid-cols-3 gap-2 border-b border-mocha-100 pb-2">
                <span className="font-bold text-gold-800 uppercase font-mono">Registration ID</span>
                <span className="col-span-2 font-mono font-bold text-mocha-950 text-sm">
                  {work.registrationId}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-mocha-100 pb-2">
                <span className="font-bold text-gold-800 uppercase">Work Title</span>
                <span className="col-span-2 font-medium text-mocha-900 text-sm">
                  {work.title}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-mocha-100 pb-2">
                <span className="font-bold text-gold-800 uppercase">Author / Creator</span>
                <span className="col-span-2 text-mocha-900">
                  {work.authorName}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-mocha-100 pb-2">
                <span className="font-bold text-gold-800 uppercase">Category</span>
                <span className="col-span-2 text-mocha-900">
                  {work.category}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-mocha-100 pb-2">
                <span className="font-bold text-gold-800 uppercase font-mono">Edition / Version</span>
                <span className="col-span-2 font-mono font-bold text-gold-800">
                  Version {work.versionNumber || work.currentVersion || 1}
                  {work.versionLabel ? ` (${work.versionLabel})` : ''}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-mocha-100 pb-2">
                <span className="font-bold text-gold-800 uppercase">Original File</span>
                <span className="col-span-2 font-mono text-mocha-800">
                  {work.originalFilename}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold text-gold-800 uppercase">Timestamp (UTC)</span>
                <span className="col-span-2 font-mono text-mocha-800">
                  {new Date(work.registeredAt).toUTCString()}
                </span>
              </div>
            </div>

            {/* Cryptographic SHA-256 Box */}
            <div className="bg-[#F4EBE1] border border-gold-500 rounded p-3 text-center mb-6">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-gold-800 font-bold mb-1">
                Official SHA-256 Digital Fingerprint
              </span>
              <p className="font-mono text-[11px] text-mocha-950 break-all select-all leading-tight">
                {work.sha256Hash}
              </p>
            </div>

            {/* Disclaimer */}
            <p className="text-[9px] text-mocha-700 text-center leading-tight">
              Notice: This certificate constitutes verifiable digital evidence of file possession and cryptographic integrity at the stated timestamp. It does not replace statutory copyright registration with government agencies.
            </p>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-mocha-800 bg-mocha-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-mocha-300 hover:text-mocha-100 hover:bg-mocha-800 transition-colors"
          >
            Close Preview
          </button>

          {canDownload ? (
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:from-gold-400 hover:to-gold-300 shadow-md shadow-gold-500/20 hover:shadow-gold-glow transition-all"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Official Certificate PDF</span>
                </>
              )}
            </button>
          ) : !isAuthenticated ? (
            <Link
              to="/register"
              onClick={onClose}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:from-gold-400 hover:to-gold-300 shadow-md shadow-gold-500/20 hover:shadow-gold-glow transition-all"
            >
              <Sparkles className="w-4 h-4 text-mocha-950" />
              <span>Create Account to Register</span>
              <ArrowRight className="w-4 h-4 text-mocha-950" />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
