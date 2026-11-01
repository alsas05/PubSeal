import React, { useState, useEffect } from 'react';
import {
  Database,
  FileText,
  ShieldCheck,
  SearchCheck,
  History,
  Users,
  Search,
  Download,
  RefreshCw,
  Eye,
  Check,
  Copy,
  Loader2,
  AlertCircle,
  Activity,
  CheckCircle2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Menu,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  BarChart3,
  Table,
} from 'lucide-react';
import { adminDatabaseApi } from '../services/api';
import HashBadge from '../components/HashBadge';
import AdminSidebar from '../components/AdminSidebar';
import AdminAnalyticsPage from './AdminAnalyticsPage';

const COLLECTIONS = [
  { id: 'works', label: 'Works & Manuscripts', icon: FileText, color: 'text-gold-400' },
  { id: 'certificates', label: 'Certificates Ledger', icon: ShieldCheck, color: 'text-emerald-400' },
  { id: 'verifications', label: 'Verification Ledger', icon: SearchCheck, color: 'text-blue-400' },
  { id: 'audits', label: 'Audit Trail', icon: History, color: 'text-purple-400' },
  { id: 'users', label: 'Author Accounts', icon: Users, color: 'text-amber-400' },
];

export default function AdminStudioPage() {
  // Mobile Sidebar Toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Active View: 'analytics' or 'tables'
  const [activeView, setActiveView] = useState('analytics');

  // Database Overview State
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [activeCollection, setActiveCollection] = useState('works');

  // Collection Data State
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Sorting state (per user request: "as a table or sort")
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Inspector & Export state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [copiedRecord, setCopiedRecord] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  // Sorting Handler
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Load Database Overview
  const fetchOverview = async () => {
    try {
      setLoadingOverview(true);
      const res = await adminDatabaseApi.getOverview();
      if (res.data.success) {
        setOverview(res.data.database);
      }
    } catch (err) {
      console.error('Failed to load database overview:', err);
    } finally {
      setLoadingOverview(false);
    }
  };

  // Load Collection Records
  const fetchRecords = async () => {
    try {
      setLoadingRecords(true);
      const res = await adminDatabaseApi.getCollection(activeCollection, {
        page,
        limit: 12,
        search,
        sortBy,
        sortOrder,
      });
      if (res.data.success) {
        setRecords(res.data.records || []);
        setTotalRecords(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load collection records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Set default sort field on collection switch
  useEffect(() => {
    setPage(1);
    if (activeCollection === 'audits') {
      setSortBy('timestamp');
    } else if (activeCollection === 'verifications') {
      setSortBy('verifiedAt');
    } else if (activeCollection === 'certificates') {
      setSortBy('issuedAt');
    } else {
      setSortBy('createdAt');
    }
    setSortOrder('desc');
  }, [activeCollection]);

  useEffect(() => {
    fetchRecords();
  }, [activeCollection, page, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Export collection handler
  const handleExport = async (format) => {
    try {
      setExporting(true);
      const res = await adminDatabaseApi.exportCollection(activeCollection, format);
      const blob = new Blob([res.data], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pubseal-${activeCollection}-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Unable to export collection.');
    } finally {
      setExporting(false);
    }
  };

  // Full Database Backup handler
  const handleExportAll = async () => {
    try {
      setExporting(true);
      const res = await adminDatabaseApi.exportAll();
      const blob = new Blob([res.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pubseal-full-database-backup-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Full database backup failed:', err);
      alert('Unable to export full database snapshot.');
    } finally {
      setExporting(false);
    }
  };

  // Sync certificates
  const handleSync = async () => {
    try {
      setSyncing(true);
      setSyncMessage(null);
      const res = await adminDatabaseApi.syncCertificates();
      if (res.data.success) {
        setSyncMessage(res.data.message);
        fetchOverview();
        fetchRecords();
        setTimeout(() => setSyncMessage(null), 4000);
      }
    } catch (err) {
      console.error('Sync failed:', err);
      alert('Failed to sync certificates.');
    } finally {
      setSyncing(false);
    }
  };

  // Copy document JSON helper
  const handleCopyDoc = (doc) => {
    navigator.clipboard.writeText(JSON.stringify(doc, null, 2));
    setCopiedRecord(true);
    setTimeout(() => setCopiedRecord(false), 2000);
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Sort Header Helper Component
  const SortHeader = ({ field, label, align = 'left' }) => {
    const isCurrent = sortBy === field;
    return (
      <th
        onClick={() => handleSort(field)}
        className={`py-3.5 px-4 cursor-pointer select-none transition-colors hover:text-gold-300 ${
          align === 'right' ? 'text-right' : 'text-left'
        } ${isCurrent ? 'text-gold-300 font-bold bg-mocha-900/60' : 'text-mocha-400'}`}
        title={`Click to sort by ${label} (${isCurrent && sortOrder === 'asc' ? 'Descending' : 'Ascending'})`}
      >
        <div className={`inline-flex items-center space-x-1.5 ${align === 'right' ? 'justify-end w-full' : ''}`}>
          <span>{label}</span>
          {isCurrent ? (
            sortOrder === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 text-mocha-600 hover:text-mocha-300 opacity-60 shrink-0" />
          )}
        </div>
      </th>
    );
  };

  const activeColConfig = COLLECTIONS.find((c) => c.id === activeCollection) || COLLECTIONS[0];
  const ActiveIcon = activeColConfig.icon;

  return (
    <div className="min-h-screen flex">
      {/* 1. LEFT SIDE PANEL */}
      <AdminSidebar
        collections={COLLECTIONS}
        activeCollection={activeCollection}
        setActiveCollection={setActiveCollection}
        activeView={activeView}
        setActiveView={setActiveView}
        overview={overview}
        loadingOverview={loadingOverview}
        fetchOverview={fetchOverview}
        handleSync={handleSync}
        syncing={syncing}
        handleExportAll={handleExportAll}
        exporting={exporting}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        totalRecords={totalRecords}
      />

      {/* 2. MAIN CONTENT AREA (Offset by left side panel) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Sticky Top Header Bar with View Switcher */}
        <header className="sticky top-0 z-30 bg-mocha-950/95 backdrop-blur-md border-b border-mocha-800/80 px-4 sm:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Sidebar Toggle & Title */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-mocha-800 bg-mocha-900 text-mocha-300 hover:text-gold-300 transition-colors"
                title="Toggle Left Side Panel"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2.5">
                {activeView === 'analytics' ? (
                  <>
                    <span className="p-1.5 rounded-lg bg-gold-500/10 border border-gold-400/30 text-gold-400">
                      <BarChart3 className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-mocha-100 leading-tight">
                        Analytics & Insights
                      </h2>
                      <span className="text-[10px] font-mono text-mocha-400">
                        Executive statistical distributions & trend graphs
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <ActiveIcon className={`w-5 h-5 ${activeColConfig.color}`} />
                    <div>
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-mocha-100 leading-tight">
                        {activeColConfig.label}
                      </h2>
                      <span className="text-[10px] font-mono text-mocha-400">
                        Collection: <strong className="text-gold-300">pubseal.{activeCollection}</strong> ({totalRecords} records)
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* View Switcher & Action Controls */}
            <div className="flex items-center space-x-2.5 shrink-0">
              {/* Primary View Switcher Pills */}
              <div className="flex items-center p-1 rounded-xl bg-mocha-900 border border-mocha-800 text-xs font-mono">
                <button
                  onClick={() => setActiveView('analytics')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    activeView === 'analytics'
                      ? 'bg-gold-500/20 text-gold-300 font-bold border border-gold-400/40 shadow-sm'
                      : 'text-mocha-400 hover:text-mocha-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Analytics</span>
                </button>
                <button
                  onClick={() => setActiveView('tables')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    activeView === 'tables'
                      ? 'bg-gold-500/20 text-gold-300 font-bold border border-gold-400/40 shadow-sm'
                      : 'text-mocha-400 hover:text-mocha-200'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Records Table</span>
                </button>
              </div>

              {/* Table Export Actions (Visible in Tables view) */}
              {activeView === 'tables' && (
                <div className="flex items-center space-x-1.5 pl-2 border-l border-mocha-800/80">
                  <span className="hidden md:inline text-[11px] font-mono text-mocha-400 mr-1">Export:</span>
                  <button
                    onClick={() => handleExport('json')}
                    disabled={exporting}
                    className="px-2.5 py-1.5 rounded-lg border border-mocha-700 bg-mocha-900 text-xs font-mono text-mocha-200 hover:text-gold-300 hover:border-gold-400/40 transition-colors"
                    title="Download collection as JSON"
                  >
                    .JSON
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={exporting}
                    className="px-2.5 py-1.5 rounded-lg border border-mocha-700 bg-mocha-900 text-xs font-mono text-mocha-200 hover:text-gold-300 hover:border-gold-400/40 transition-colors"
                    title="Download collection as CSV spreadsheet"
                  >
                    .CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-8 space-y-6 flex-1">
          {activeView === 'analytics' ? (
            <AdminAnalyticsPage />
          ) : (
            <>
              {syncMessage && (
                <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-200 flex items-center space-x-2.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{syncMessage}</span>
                </div>
              )}

          {/* 3. Live Database Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-mocha-900/60 border border-mocha-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-mocha-400 uppercase">
                <span>Database Engine</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="font-serif text-xl font-bold text-emerald-400">
                {overview?.status || 'Online'}
              </div>
              <span className="text-[11px] font-mono text-mocha-400 block truncate">
                {overview?.engine || 'MongoDB'} • {overview?.host || '127.0.0.1'}:{overview?.port || 27017}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-mocha-900/60 border border-mocha-800/80 space-y-1.5">
              <span className="text-[10px] font-mono text-mocha-400 uppercase tracking-wider block">
                Total Documents
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="font-serif text-xl font-bold text-gold-300">
                  {overview?.metrics?.totalDocuments?.toLocaleString() || 0}
                </span>
                <span className="text-xs font-mono text-mocha-400">records</span>
              </div>
              <span className="text-[11px] font-mono text-mocha-400 block">
                Across 5 collections
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-mocha-900/60 border border-mocha-800/80 space-y-1.5">
              <span className="text-[10px] font-mono text-mocha-400 uppercase tracking-wider block">
                Storage Size
              </span>
              <div className="font-serif text-xl font-bold text-mocha-100">
                {formatBytes(overview?.metrics?.totalStorageBytes)}
              </div>
              <span className="text-[11px] font-mono text-mocha-400 block">
                Avg {overview?.metrics?.avgDocumentSizeBytes || 0} B/doc
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-mocha-900/60 border border-mocha-800/80 space-y-1.5">
              <span className="text-[10px] font-mono text-mocha-400 uppercase tracking-wider block">
                Database Name
              </span>
              <div className="font-mono text-lg font-bold text-gold-300 truncate">
                {overview?.name || 'pubseal'}
              </div>
              <span className="text-[11px] font-mono text-mocha-400 block">
                MongoDB {overview?.serverVersion ? `v${overview.serverVersion}` : 'Server'}
              </span>
            </div>
          </div>

          {/* 4. Controls: Search Bar & Active Sort Pill */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-mocha-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search across ${activeColConfig.label} (ID, hash, title, author)...`}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-mocha-900/80 border border-mocha-700 text-xs text-mocha-100 placeholder-mocha-500 focus:outline-none focus:border-gold-400"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono text-mocha-400 shrink-0">
              <span>Sorted by:</span>
              <span className="px-2.5 py-1 rounded-lg bg-mocha-950 border border-mocha-800 text-gold-300 flex items-center space-x-1 font-semibold">
                <span>{sortBy}</span>
                <span>({sortOrder.toUpperCase()})</span>
              </span>
            </div>
          </div>

          {/* 5. Main Records Data Table with Interactive Sorting */}
          <div className="rounded-3xl bg-mocha-900/70 border border-mocha-700/80 overflow-hidden shadow-mocha-deep backdrop-blur-sm">
            {loadingRecords ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
                <span className="text-xs font-mono text-mocha-400">Loading {activeCollection} from MongoDB...</span>
              </div>
            ) : records.length === 0 ? (
              <div className="py-20 text-center space-y-2">
                <Database className="w-10 h-10 text-mocha-600 mx-auto" />
                <h3 className="font-serif text-base text-mocha-200">No records found</h3>
                <p className="text-xs text-mocha-400">
                  {search ? 'No documents matched your search filter.' : `No documents currently in collection "${activeCollection}".`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-mocha-950/80 border-b border-mocha-800 text-[11px] font-mono uppercase text-mocha-400 tracking-wider">
                    {activeCollection === 'works' && (
                      <tr>
                        <SortHeader field="title" label="Work Title & Author" />
                        <SortHeader field="registrationId" label="Registration Token" />
                        <SortHeader field="category" label="Category" />
                        <SortHeader field="currentVersion" label="Current Version" />
                        <SortHeader field="sha256Hash" label="SHA-256 Digest" />
                        <SortHeader field="copyrightReadiness.score" label="Readiness" />
                        <SortHeader field="createdAt" label="Registered Date" />
                        <th className="py-3.5 px-4 text-right">Inspect</th>
                      </tr>
                    )}

                    {activeCollection === 'certificates' && (
                      <tr>
                        <SortHeader field="certificateNumber" label="Certificate Serial" />
                        <SortHeader field="registrationId" label="Work Token" />
                        <SortHeader field="versionNumber" label="Version" />
                        <SortHeader field="title" label="Title & Author" />
                        <SortHeader field="sha256Hash" label="SHA-256 Fingerprint" />
                        <SortHeader field="status" label="Status" />
                        <SortHeader field="issuedAt" label="Issued At" />
                        <th className="py-3.5 px-4 text-right">Inspect</th>
                      </tr>
                    )}

                    {activeCollection === 'verifications' && (
                      <tr>
                        <SortHeader field="logId" label="Audit Log ID" />
                        <SortHeader field="verificationType" label="Check Type" />
                        <SortHeader field="resultStatus" label="Result Determination" />
                        <SortHeader field="matchedRegistrationId" label="Matched Token" />
                        <SortHeader field="searchedHash" label="Searched Digest" />
                        <SortHeader field="ipAddress" label="Client IP" />
                        <SortHeader field="verifiedAt" label="Verified At" />
                        <th className="py-3.5 px-4 text-right">Inspect</th>
                      </tr>
                    )}

                    {activeCollection === 'audits' && (
                      <tr>
                        <SortHeader field="action" label="Action Event" />
                        <SortHeader field="entityType" label="Entity Type" />
                        <SortHeader field="entityId" label="Entity ID" />
                        <SortHeader field="userEmail" label="Author / User" />
                        <SortHeader field="timestamp" label="Timestamp" />
                        <th className="py-3.5 px-4 text-right">Inspect</th>
                      </tr>
                    )}

                    {activeCollection === 'users' && (
                      <tr>
                        <SortHeader field="name" label="Author Full Name" />
                        <SortHeader field="email" label="Email Address" />
                        <SortHeader field="_id" label="Account ID" />
                        <SortHeader field="role" label="Account Role" />
                        <SortHeader field="createdAt" label="Joined Date" />
                        <th className="py-3.5 px-4 text-right">Inspect</th>
                      </tr>
                    )}
                  </thead>

                  <tbody className="divide-y divide-mocha-800/60 font-mono">
                    {records.map((doc) => (
                      <tr
                        key={doc._id}
                        onClick={() => setSelectedRecord(doc)}
                        className="hover:bg-mocha-950/60 cursor-pointer transition-colors group"
                      >
                        {/* Collection: WORKS */}
                        {activeCollection === 'works' && (
                          <>
                            <td className="py-3.5 px-4 font-sans font-medium text-mocha-100">
                              <span className="block font-serif text-sm font-bold text-mocha-100 group-hover:text-gold-300 transition-colors">
                                {doc.title}
                              </span>
                              <span className="text-[11px] text-mocha-400">By {doc.authorName}</span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-gold-300">{doc.registrationId}</td>
                            <td className="py-3.5 px-4 font-sans text-mocha-300">{doc.category}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-gold-500/15 text-gold-300 border border-gold-400/30">
                                v{doc.currentVersion || 1}.0 ({doc.versions?.length || 1})
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <HashBadge hash={doc.sha256Hash} truncate={true} showLabel={false} />
                            </td>
                            <td className="py-3.5 px-4">
                              {doc.copyrightReadiness?.score !== undefined ? (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    doc.copyrightReadiness.score >= 85
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                      : 'bg-gold-500/15 text-gold-300 border-gold-400/30'
                                  }`}
                                >
                                  {doc.copyrightReadiness.score}%
                                </span>
                              ) : (
                                <span className="text-mocha-500">N/A</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-mocha-400 text-[11px]">
                              {new Date(doc.createdAt || doc.registeredAt).toLocaleDateString()}
                            </td>
                          </>
                        )}

                        {/* Collection: CERTIFICATES */}
                        {activeCollection === 'certificates' && (
                          <>
                            <td className="py-3.5 px-4 font-bold text-gold-300">{doc.certificateNumber}</td>
                            <td className="py-3.5 px-4 text-mocha-200">{doc.registrationId}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-mocha-800 text-mocha-200">
                                v{doc.versionNumber}.0
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-sans text-mocha-200 truncate max-w-[200px]">
                              {doc.title}
                            </td>
                            <td className="py-3.5 px-4">
                              <HashBadge hash={doc.sha256Hash} truncate={true} showLabel={false} />
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                                  doc.status === 'active'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-mocha-800 text-mocha-400 border border-mocha-700'
                                }`}
                              >
                                {doc.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-mocha-400 text-[11px]">
                              {new Date(doc.issuedAt || doc.createdAt).toLocaleDateString()}
                            </td>
                          </>
                        )}

                        {/* Collection: VERIFICATIONS */}
                        {activeCollection === 'verifications' && (
                          <>
                            <td className="py-3.5 px-4 text-gold-300 font-bold">{doc.logId}</td>
                            <td className="py-3.5 px-4 uppercase text-[10px] text-mocha-300">
                              {doc.verificationType}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  doc.resultStatus === 'EXACT_MATCH'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : doc.resultStatus === 'HISTORICAL_VERSION_MATCH'
                                    ? 'bg-gold-500/20 text-gold-300 border border-gold-400/30'
                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                }`}
                              >
                                {doc.resultStatus}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-mocha-200">
                              {doc.matchedRegistrationId || 'N/A'}
                            </td>
                            <td className="py-3.5 px-4">
                              {doc.searchedHash ? (
                                <HashBadge hash={doc.searchedHash} truncate={true} showLabel={false} />
                              ) : (
                                <span className="text-mocha-500">Query text</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-mocha-400">{doc.ipAddress}</td>
                            <td className="py-3.5 px-4 text-mocha-400 text-[11px]">
                              {new Date(doc.verifiedAt).toLocaleTimeString()}
                            </td>
                          </>
                        )}

                        {/* Collection: AUDITS */}
                        {activeCollection === 'audits' && (
                          <>
                            <td className="py-3.5 px-4 font-bold text-gold-300">{doc.action}</td>
                            <td className="py-3.5 px-4 text-mocha-300">{doc.entityType}</td>
                            <td className="py-3.5 px-4 text-mocha-200">{doc.entityId}</td>
                            <td className="py-3.5 px-4 text-mocha-400">{doc.userEmail || 'System / Anonymous'}</td>
                            <td className="py-3.5 px-4 text-mocha-400 text-[11px]">
                              {new Date(doc.timestamp).toLocaleString()}
                            </td>
                          </>
                        )}

                        {/* Collection: USERS */}
                        {activeCollection === 'users' && (
                          <>
                            <td className="py-3.5 px-4 font-sans font-bold text-mocha-100">{doc.name}</td>
                            <td className="py-3.5 px-4 text-gold-300">{doc.email}</td>
                            <td className="py-3.5 px-4 text-mocha-400 truncate max-w-[120px]">{doc._id}</td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  doc.role === 'admin'
                                    ? 'bg-gold-500/20 text-gold-300 border border-gold-400/40'
                                    : 'bg-mocha-800 text-mocha-300 border border-mocha-700'
                                }`}
                              >
                                {doc.role || 'user'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-mocha-400 text-[11px]">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </td>
                          </>
                        )}

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecord(doc);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-mocha-950 border border-mocha-700 text-mocha-300 hover:text-gold-300 hover:border-gold-400/40 transition-colors inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-mocha-800 bg-mocha-950/60 font-mono text-xs">
                <span className="text-mocha-400">
                  Showing page {page} of {totalPages} ({totalRecords.toLocaleString()} documents)
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-mocha-700 bg-mocha-900 text-mocha-300 hover:text-mocha-100 disabled:opacity-40 transition-all"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-mocha-700 bg-mocha-900 text-mocha-300 hover:text-mocha-100 disabled:opacity-40 transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
            </>
          )}
        </main>
      </div>

      {/* 6. MODAL: Raw Document JSON Inspector */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-mocha-950 border border-gold-400/50 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-mocha-800 bg-mocha-900/80">
              <div className="flex items-center space-x-2.5">
                <Database className="w-5 h-5 text-gold-400" />
                <div>
                  <h3 className="font-serif text-lg font-medium text-mocha-100">
                    MongoDB Document Inspector: {activeCollection}
                  </h3>
                  <span className="text-[11px] font-mono text-mocha-400">
                    Document _id: <strong className="text-mocha-200">{selectedRecord._id}</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-mocha-400 hover:text-mocha-100 hover:bg-mocha-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Document JSON Viewer */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-mocha-400">
                  Collection: <strong className="text-gold-300">pubseal.{activeCollection}</strong>
                </span>
                <button
                  onClick={() => handleCopyDoc(selectedRecord)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-mocha-900 border border-mocha-700 text-xs text-mocha-300 hover:text-gold-300 transition-colors"
                >
                  {copiedRecord ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Document JSON</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Raw JSON</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-mocha-900 border border-mocha-800 text-xs font-mono text-gold-200 overflow-x-auto select-all leading-relaxed max-h-[50vh]">
                {JSON.stringify(selectedRecord, null, 2)}
              </pre>
            </div>

            <div className="px-6 py-3.5 border-t border-mocha-800 bg-mocha-900/60 flex items-center justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl text-xs text-mocha-300 hover:text-mocha-100 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
