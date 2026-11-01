import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-mocha-900 border border-gold-400/30 flex items-center justify-center text-gold-400">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <span className="font-mono text-xs uppercase text-gold-400 tracking-wider">
          Error 404 • Lost Fragment
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-mocha-50">
          Manuscript Page Not Found
        </h1>
        <p className="text-sm text-mocha-300 max-w-md mx-auto">
          The registry folio or record you requested does not exist or has been moved to a different archive.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-medium bg-gold-500 text-mocha-950 hover:bg-gold-400 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4 text-mocha-950" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;

