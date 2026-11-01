import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react';

const ALLOWED_EXTS = ['.pdf', '.docx', '.txt'];

const FileDropzone = ({ onFileSelected, selectedFile, onClear, label = 'Upload Creative Work' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    setError(null);
    if (!file) return false;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      setError(`Unsupported file format '${ext}'. Please upload a PDF, DOCX, or TXT manuscript.`);
      return false;
    }

    return true;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-3">
      {/* Hidden native input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx,.txt"
        className="hidden"
      />

      {/* Selected file preview */}
      {selectedFile ? (
        <div className="p-4 rounded-xl bg-mocha-900 border border-gold-400/40 shadow-inner-gold flex items-center justify-between transition-all">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-gold-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-mocha-100 truncate">{selectedFile.name}</p>
              <div className="flex items-center space-x-2 text-xs text-mocha-400 font-mono mt-0.5">
                <span>{formatFileSize(selectedFile.size)}</span>
                <span>•</span>
                <span className="text-gold-400 font-medium">Ready for Cryptographic Hashing</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 rounded-lg text-mocha-400 hover:text-red-400 hover:bg-mocha-800 transition-colors ml-3"
            title="Remove selected file"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        /* Dropzone area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-gold-400 bg-gold-500/10 shadow-gold-glow scale-[1.01]'
              : 'border-mocha-700/80 hover:border-gold-400/50 bg-mocha-900/40 hover:bg-mocha-900/70'
          }`}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-mocha-800/80 border border-gold-400/30 flex items-center justify-center text-gold-400 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-lg font-medium text-mocha-100 mb-1">{label}</h3>
          <p className="text-sm text-mocha-300 max-w-sm mx-auto mb-4">
            Drag and drop your manuscript here, or{' '}
            <span className="text-gold-400 underline underline-offset-2">browse files</span>
          </p>
          <div className="inline-flex items-center space-x-3 text-xs font-mono text-mocha-400 px-3 py-1.5 rounded-full bg-mocha-950/60 border border-mocha-800">
            <span>Supported: PDF, DOCX, TXT</span>
            <span>•</span>
            <span className="text-gold-400">No File Size Limit</span>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="flex items-center space-x-2 text-xs text-red-300 bg-red-950/40 border border-red-800/60 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;

