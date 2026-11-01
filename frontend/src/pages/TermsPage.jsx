import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  FileCheck2,
  Binary,
  AlertTriangle,
  Scale,
  Sparkles,
  Printer,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  CheckCircle2,
  Mail,
  HelpCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';

const sections = [
  { id: 'acceptance', title: '1. Acceptance of Terms & Eligibility' },
  { id: 'evidentiary-nature', title: '2. Cryptographic Evidentiary Registry' },
  { id: 'statutory-disclaimer', title: '3. Non-Government & Statutory Disclaimer' },
  { id: 'author-ownership', title: '4. 100% Author Ownership & Zero IP Claims' },
  { id: 'vault-confidentiality', title: '5. Manuscript Vault & Confidentiality' },
  { id: 'ai-score-disclaimer', title: '6. AI Copyright Readiness Score Advisory' },
  { id: 'account-security', title: '7. Account Security & OTP Verification' },
  { id: 'acceptable-use', title: '8. Originality Warranty & Acceptable Use' },
  { id: 'certificates-ledger', title: '9. Archival Certificates & Public Ledger' },
  { id: 'liability', title: '10. Limitation of Liability & Dispute Jurisdiction' },
  { id: 'amendments-contact', title: '11. Amendments & Legal Contact' },
];

const TermsPage = () => {
  const [activeSection, setActiveSection] = useState('acceptance');

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-mocha-950 text-mocha-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gold-500/[0.03] rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-mocha-800/80 pb-6">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-mono text-mocha-400 hover:text-gold-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-gold-400" />
            <span>Return to PubSeal Registry</span>
          </Link>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono bg-mocha-900 border border-gold-500/30 text-gold-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
              Effective Date: November 1, 2026 • v2.4
            </span>
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-mocha-900 hover:bg-mocha-850 text-mocha-200 hover:text-gold-300 border border-mocha-700 hover:border-gold-500/40 transition-all shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-gold-400" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-400/30 text-gold-300 text-xs font-mono uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-gold-400" />
            <span>Official Legal Framework & User Agreement</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-mocha-50 tracking-tight leading-tight">
            Terms & Conditions of Service
          </h1>

          <p className="text-sm sm:text-base text-mocha-300/90 leading-relaxed font-light">
            Please read these terms carefully before creating an author account or registering manuscripts with PubSeal. 
            By utilizing our cryptographic registry, you enter into a legally binding agreement governing evidentiary registration, 
            vault privacy, intellectual property retention, and verification certificates.
          </p>
        </div>

        {/* 4 Core Pillars Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1 */}
          <div className="p-5 rounded-2xl bg-mocha-900/70 border border-mocha-800 hover:border-gold-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-sm font-bold text-mocha-100">100% Author Ownership</h3>
            <p className="text-xs text-mocha-400 leading-relaxed">
              You retain all intellectual property, copyright, moral, and publishing rights. PubSeal claims 0% ownership of your manuscript.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-5 rounded-2xl bg-mocha-900/70 border border-mocha-800 hover:border-gold-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <Binary className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-sm font-bold text-mocha-100">Cryptographic Evidence</h3>
            <p className="text-xs text-mocha-400 leading-relaxed">
              We compute deterministic NIST FIPS 180-4 SHA-256 hashes and certified timestamps to establish immutable prior possession.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-5 rounded-2xl bg-mocha-900/70 border border-mocha-800 hover:border-gold-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-sm font-bold text-mocha-100">Confidential Vault</h3>
            <p className="text-xs text-mocha-400 leading-relaxed">
              Manuscripts remain confidential in your private author vault. They are never published, indexed, shared, or used to train AI models.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-5 rounded-2xl bg-mocha-900/70 border border-mocha-800 hover:border-gold-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-sm font-bold text-mocha-100">Evidentiary Platform</h3>
            <p className="text-xs text-mocha-400 leading-relaxed">
              PubSeal is an independent technological registry, not a government copyright office. It does not replace statutory copyright filings.
            </p>
          </div>
        </div>

        {/* Main Content Layout with Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
          {/* Sticky Table of Contents (Desktop Sidebar) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
            <div className="p-5 rounded-2xl bg-mocha-900/80 border border-mocha-800 shadow-mocha-deep backdrop-blur-sm space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-mocha-800">
                <BookOpen className="w-4 h-4 text-gold-400" />
                <h3 className="font-serif text-sm font-bold text-mocha-100 uppercase tracking-wider">
                  Table of Contents
                </h3>
              </div>

              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between group ${
                      activeSection === section.id
                        ? 'bg-gold-500/15 text-gold-300 font-medium border border-gold-500/30 pl-4'
                        : 'text-mocha-400 hover:text-mocha-200 hover:bg-mocha-850/60'
                    }`}
                  >
                    <span className="truncate">{section.title}</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                        activeSection === section.id
                          ? 'text-gold-400 translate-x-0.5'
                          : 'text-mocha-600 group-hover:text-mocha-400'
                      }`}
                    />
                  </button>
                ))}
              </nav>

              <div className="pt-3 border-t border-mocha-800">
                <div className="p-3 rounded-xl bg-mocha-950/80 border border-mocha-800/80 space-y-2">
                  <p className="text-[11px] font-mono text-gold-400 font-semibold uppercase">
                    Need Clarification?
                  </p>
                  <p className="text-xs text-mocha-400 leading-relaxed">
                    Have questions regarding our cryptographic integrity model or legal terms? Reach our support team.
                  </p>
                  <a
                    href="mailto:support@pubseal.com"
                    className="inline-flex items-center space-x-1.5 text-xs text-gold-400 hover:text-gold-300 font-medium transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>support@pubseal.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Full Terms Prose Content (Right Column) */}
          <div className="lg:col-span-8 space-y-10">
            {/* ========================================================= */}
            {/* SECTION 1: ACCEPTANCE OF TERMS                            */}
            {/* ========================================================= */}
            <section
              id="acceptance"
              className="p-6 sm:p-8 rounded-3xl bg-mocha-900/60 border border-mocha-800/80 shadow-mocha-deep space-y-5 scroll-mt-24"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-mocha-800">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-gold-500/15 text-gold-300 border border-gold-500/30">
                  Section 01
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-mocha-50">
                  1. Acceptance of Terms & Author Eligibility
                </h2>
              </div>

              <div className="prose prose-invert max-w-none text-sm text-mocha-300/90 leading-relaxed space-y-4">
                <p>
                  Welcome to <strong>PubSeal Digital Registry</strong> (&quot;PubSeal&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). 
                  These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;Author&quot;, &quot;Creator&quot;, &quot;User&quot;, or &quot;you&quot;) 
                  and PubSeal, governing your access to and use of our website, web application, digital registry, verification APIs, and archival certificates (collectively, the &quot;Platform&quot;).
                </p>
                <p>
                  By creating an account, completing email verification, uploading manuscripts, or accessing any service provided by PubSeal, 
                  you express your unequivocal agreement to be bound by these Terms and our Privacy Policy. If you do not agree with any part of these Terms, 
                  you must immediately discontinue use of the Platform.
                </p>
                <div className="p-4 rounded-xl bg-mocha-950/70 border border-mocha-800 text-xs text-mocha-300 space-y-2">
                  <h4 className="font-serif font-bold text-gold-400 uppercase tracking-wide">
                    Eligibility Requirements
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-mocha-400">
                    <li>You must be at least 13 years of age (or the minimum age of digital consent in your jurisdiction).</li>
                    <li>If registering on behalf of a publishing house, literary estate, academic institution, or studio, you warrant that you have full legal authority to bind that entity.</li>
                    <li>You agree to provide true, accurate, and current information during registration and email verification.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* SECTION 2: CRYPTOGRAPHIC NATURE                           */}
            {/* ========================================================= */}
            <section
              id="evidentiary-nature"
              className="p-6 sm:p-8 rounded-3xl bg-mocha-900/60 border border-mocha-800/80 shadow-mocha-deep space-y-5 scroll-mt-24"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-mocha-800">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-gold-500/15 text-gold-300 border border-gold-500/30">
                  Section 02
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-mocha-50">
                  2. Cryptographic Evidentiary Registry
                </h2>
              </div>

              <div className="prose prose-invert max-w-none text-sm text-mocha-300/90 leading-relaxed space-y-4">
                <p>
                  PubSeal operates an immutable, cryptographic evidence registry designed to help creators establish verifiable digital proof 
                  of <strong>prior possession</strong> and <strong>document integrity</strong>.
                </p>
                <div className="space-y-3">
                  <h4 className="font-serif text-sm font-bold text-mocha-100 flex items-center space-x-2">
                    <Binary className="w-4 h-4 text-gold-400" />
                    <span>NIST FIPS 180-4 SHA-256 Fingerprint Generation</span>
                  </h4>
                  <p>
                    Upon manuscript submission, PubSeal processes the raw binary byte stream of your file on secure server infrastructure 
                    and calculates a 256-bit cryptographic digest following the <strong>NIST FIPS 180-4 Secure Hash Standard (SHA-256)</strong>. 
                    This calculation is strictly deterministic: even an alteration of a single comma, character, or byte in the manuscript produces an entirely distinct hexadecimal hash.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-serif text-sm font-bold text-mocha-100 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gold-400" />
                    <span>Certified Server Timestamping</span>
                  </h4>
                  <p>
                    Every registered work is bound to an immutable ISO 8601 server timestamp recorded at the exact millisecond of upload completion. 
                    This establishes conclusive evidentiary proof that a specific, identical binary file was in your custody at or before that recorded point in time.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gold-950/20 border border-gold-500/30 text-xs text-gold-200/90 flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Evidentiary Value:</strong> In legal or literary priority disputes, cryptographic timestamps and binary hashes serve 
                    as objective, mathematically provable third-party digital evidence demonstrating that your work existed prior to contested later dates.
                  </p>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* SECTION 3: STATUTORY DISCLAIMER                           */}
            {/* ========================================================= */}
            <section
              id="statutory-disclaimer"
              className="p-6 sm:p-8 rounded-3xl bg-mocha-900/60 border border-mocha-800/80 shadow-mocha-deep space-y-5 scroll-mt-24"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-mocha-800">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Section 03
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-mocha-50">
                  3. Non-Government & Statutory Copyright Disclaimer
                </h2>
              </div>

              <div className="prose prose-invert max-w-none text-sm text-mocha-300/90 leading-relaxed space-y-4">
                <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200/90 space-y-3">
                  <div className="flex items-center space-x-2.5 text-amber-300 font-serif font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>IMPORTANT STATUTORY COPYRIGHT NOTICE</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    <strong>PubSeal is NOT an official government copyright office.</strong> We are not affiliated with, endorsed by, or operated by 
                    the United States Copyright Office (USCO), the UK Intellectual Property Office (UKIPO), the World Intellectual Property Organization (WIPO), 
                    or any other national or international government registry.
                  </p>
                </div>

                <p>
                  <strong>No Statutory Monopoly Granted:</strong> A PubSeal Certificate of Digital Registration records cryptographic possession and time of receipt; 
                  it does not constitute an official grant of statutory copyright monopoly, patent, or trademark by any governmental authority.
                </p>
                <p>
                  <strong>Statutory Damages & Legal Standing:</strong> In certain jurisdictions (such as the United States under 17 U.S.C. § 412), statutory damages 
                  and recovery of attorney fees in copyright litigation require timely registration with the official national copyright office. 
                  PubSeal does not replace statutory copyright filings, judicial determinations of copyright validity, or mandatory sovereign deposit requirements.
                </p>
                <p>
                  Creators are advised to use PubSeal as an instantaneous evidentiary layer during drafting, pitching, and query rounds, 
                  and to pursue official statutory government registration when preparing for public commercial distribution where statutory remedies are sought.
                </p>
              </div>
            </section>

            {/* ========================================================= */}
            {/* SECTION 4: AUTHOR OWNERSHIP                               */}
            {/* ========================================================= */}
            <section
              id="author-ownership"
              className="p-6 sm:p-8 rounded-3xl bg-mocha-900/60 border border-mocha-800/80 shadow-mocha-deep space-y-5 scroll-mt-24"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-mocha-800">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-gold-500/15 text-gold-300 border border-gold-500/30">
                  Section 04
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-mocha-50">
                  4. 100% Author Ownership & Zero IP Claims
                </h2>
              </div>

              <div className="prose prose-invert max-w-none text-sm text-mocha-300/90 leading-relaxed space-y-4">
                <p>
                  <strong>You retain 100% of your intellectual property at all times.</strong> PubSeal was established to defend creators, not to expropriate their rights.
                </p>
                <div className="p-4 rounded-xl bg-mocha-950/70 border border-mocha-800 space-y-3">
                  <h4 className="font-serif text-sm font-bold text-gold-400">Our Explicit IP Covenants:</h4>
                  <ul className="space-y-2 text-xs text-mocha-300">
                    <li className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Zero Rights Claimed:</strong> PubSeal claims zero copyright, trademark, moral rights, patent rights, or commercial equity in any manuscript, outline, draft, or file registered on the Platform.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>No Publishing or Sublicensing:</strong> We do not publish, serialize, distribute, syndicate, or license your written work to any third party.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Strict Machine-Only License:</strong> You grant PubSeal only the limited, non-exclusive, automated machine permissions strictly necessary to execute the service: namely, calculating SHA-256 hashes, generating verification certificates, conducting automated AI structural scans upon your request, and maintaining encrypted backup in your private vault.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* SECTION 5: MANUSCRIPT VAULT & PRIVACY                     */}
            {/* ========================================================= */}
            <section
              id="vault-confidentiality"
              className="p-6 sm:p-8 rounded-3xl bg-mocha-900/60 border border-mocha-800/80 shadow-mocha-deep space-y-5 scroll-mt-24"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-mocha-800">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-gold-500/15 text-gold-300 border border-gold-500/30">
                  Section 05
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-mocha-50">
                  5. Manuscript Vault Confidentiality & Data Protection
                </h2>
              </div>

              <div className="prose prose-invert max-w-none text-sm text-mocha-300/90 leading-relaxed space-y-4">
                <p>
                  Every manuscript file uploaded to PubSeal is stored inside an <strong>Author-Private Vault</strong> accessible solely by your authenticated credentials.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-mocha-950 border border-mocha-800 space-y-2">
                    <div className="flex items-center space-x-2 text-gold-400 font-medium text-xs font-mono">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Zero Search Indexing</span>
                    </div>
                    <p className="text-xs text-mocha-400">
                      Manuscripts are excluded from web crawlers, search engines (Google, Bing), and public directory listings.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-mocha-950 border border-mocha-800 space-y-2">
                    <div className="flex items-center space-x-2 text-gold-400 font-medium text-xs font-mono">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Zero AI Training Exclusion</span>
                    </div>
                    <p className="text-xs text-mocha-400">
                      We never use your manuscripts, drafts, or creative assets to train foundational large language models or generative AI systems.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-mocha-400">
                  <strong>Public Verification Boundary:</strong> The public verification ledger and QR code verification links expose <em>only</em> non-sensitive cryptographic metadata: 
                  the Registration ID, Author Name, Title, Work Category, Registration Timestamp, and SHA-256 binary hash. The actual text, pages, and manuscript contents remain strictly private and unexposed.
                </p>
              </div>
            </section>

            {/* ========================================================= */}
            {/* SECTION 6: AI READINESS SCORE                             */}
            {/* ========================================================= */}
            <section
              id="ai-score-disclaimer"
              className="p-6 sm:p-8 rounded-3xl bg-mocha-900/60 border border-mocha-800/80 shadow-mocha-deep space-y-5 scroll-mt-24"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-mocha-800">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-gold-500/15 text-gold-300 border border-gold-500/30">
                  Section 06
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-mocha-50">
                  6. AI Copyright Readiness Score Advisory Disclaimer
                </h2>
              </div>

              <div className="prose prose-invert max-w-none text-sm text-mocha-300/90 leading-relaxed space-y-4">
                <p>
                  PubSeal provides an automated <strong>AI Copyright Readiness Score (0–100)</strong> and manuscript hygiene analysis powered by machine learning algorithms.
                </p>
                <div className="p-4 rounded-xl bg-mocha-950/70 border border-mocha-800 text-xs text-mocha-300 space-y-2">
                  <h4 className="font-serif font-bold text-gold-400 uppercase tracking-wide">
                    Informational & Heuristic Tool Only
                  </h4>
                  <p>
                    The AI Readiness evaluation inspects mechanical and structural attributes of your document (such as title page clarity, 
                    author attribution, structural chapter flow, front-matter completeness, and formatting standards).
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-mocha-400">
                    <li>The AI Readiness Score is an automated advisory checklist, <strong>not legal advice</strong> or an official judicial ruling.</li>
                    <li>A high score does not guarantee copyrightability under statutory law or ensure immunity from copyright infringement claims.</li>
                    <li>A lower score reflects document hygiene recommendations and does not invalidate your statutory ownership or PubSeal cryptographic timestamp.</li>
                    <li>No attorney-client relationship is formed through the use of PubSeal or any of its automated evaluation engines.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* SECTION 7: ACCOUNT SECURITY & OTP                         */}
            {/* ========================================================= */}
            <section
              id="account-security"
              className="p-6 sm:p-8 rounded-3xl bg-mocha-900/60 border border-mocha-800/80 shadow-mocha-deep space-y-5 scroll-mt-24"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-mocha-800">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-gold-500/15 text-gold-300 border border-gold-500/30">
                  Section 07
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-mocha-50">
                  7. Account Security, Email Verification & Credentials
                </h2>
              </div>

              <div className="prose prose-invert max-w-none text-sm text-mocha-300/90 leading-relaxed space-y-4">
                <p>
                  To preserve registry integrity and prevent fraudulent attribution, PubSeal requires authentic email verification via a 6-digit One-Time Passcode (OTP).
                </p>
                <div className="space-y-3">
                  <h4 className="font-serif text-sm font-bold text-mocha-100">Author Obligations:</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-mocha-400">
                    <li><strong>Safeguarding Credentials:</strong> You are solely responsible for maintaining the confidentiality of your password and active session tokens.</li>
                    <li><strong>Accurate Email Access:</strong> You must maintain control of the email address linked to your account, as it serves as the primary cryptographic recovery and identity anchor.</li>
                    <li><strong>Social Authentication:</strong> When authenticating via Google or Facebook social sign-in, you agree that PubSeal may receive your verified primary email address and full name to create and anchor your author record.</li>
                    <li><strong>Unauthorized Access:</strong> You agree to immediately notify PubSeal of any suspected compromise, unauthorized access, or security breach involving your account.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* SECTION 8: ACCEPTABLE USE & ORIGINALITY                   */}
            {/* ========================================================= */}
            <section
              id="acceptable-use"
              className="p-6 sm:p-8 rounded-3xl bg-mocha-900/60 border border-mocha-800/80 shadow-mocha-deep space-y-5 scroll-mt-24"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-mocha-800">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-gold-500/15 text-gold-300 border border-gold-500/30">
                  Section 08
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-mocha-50">
                  8. Originality Warranty & Acceptable Use Policy
                </h2>
              </div>

              <div className="prose prose-invert max-w-none text-sm text-mocha-300/90 leading-relaxed space-y-4">
                <p>
                  PubSeal is engineered for legitimate writers, researchers, and creators. By registering any work, you represent and warrant that:
                </p>
                <div className="p-4 rounded-xl bg-mocha-950/70 border border-mocha-800 space-y-2 text-xs">
                  <h4 className="font-serif font-bold text-gold-400 uppercase tracking-wide">
                    Author Representations & Warranties
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-mocha-300">
                    <li>You are the sole author and owner of the work, or you have explicit authorized written permission from the copyright proprietor to register it.</li>
                    <li>The uploaded material does not infringe upon any third-party copyright, trademark, trade secret, or moral right.</li>
                    <li>The work is not plagiarized from existing published or unpublished literature.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif text-sm font-bold text-red-400">Strictly Prohibited Conduct:</h4>
                  <p className="text-xs text-mocha-400">You may not upload, transmit, or register files containing:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-mocha-400">
                    <li>Malicious code, computer viruses, Trojan horses, ransomware, or corrupt payloads.</li>
                    <li>Unlawful, defamatory, obscene, harassing, or terrorist content.</li>
                    <li>Files designed to overwhelm, denial-of-service, or disrupt PubSeal server infrastructure.</li>
                    <li>Fraudulent attempts to register works authored by other living or historical persons under false pretenses.</li>
                  </ul>
                  <p className="text-xs text-mocha-400 pt-2">
                    Violations of this section will result in immediate termination of account privileges, revocation of certificates, and potential referral to relevant law enforcement bodies.
                  </p>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* SECTION 9: ARCHIVAL CERTIFICATES                          */}
            {/* ========================================================= */}
            <section
              id="certificates-ledger"
              className="p-6 sm:p-8 rounded-3xl bg-mocha-900/60 border border-mocha-800/80 shadow-mocha-deep space-y-5 scroll-mt-24"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-mocha-800">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-gold-500/15 text-gold-300 border border-gold-500/30">
                  Section 09
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-mocha-50">
                  9. Archival Certificates & Public Verification Ledger
                </h2>
              </div>

              <div className="prose prose-invert max-w-none text-sm text-mocha-300/90 leading-relaxed space-y-4">
                <p>
                  Upon registration, PubSeal generates a high-resolution, archival-grade <strong>Certificate of Digital Registration</strong> bearing:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-mocha-300">
                  <li className="p-2.5 rounded-lg bg-mocha-950 border border-mocha-800 flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>Unique Registry Serial (e.g. PUB-2026-XXXX)</span>
                  </li>
                  <li className="p-2.5 rounded-lg bg-mocha-950 border border-mocha-800 flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>NIST FIPS 180-4 SHA-256 Digest</span>
                  </li>
                  <li className="p-2.5 rounded-lg bg-mocha-950 border border-mocha-800 flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>ISO 8601 Certified Server Timestamp</span>
                  </li>
                  <li className="p-2.5 rounded-lg bg-mocha-950 border border-mocha-800 flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>Direct Verification QR Code</span>
                  </li>
                </ul>

                <p>
                  <strong>Independent Public Verification:</strong> Third parties (such as literary agents, publishers, copyright attorneys, or adjudicators) 
                  may access <code className="text-gold-300 bg-mocha-950 px-1.5 py-0.5 rounded text-xs font-mono">/verify</code> to verify any certificate token 
                  or upload candidate manuscript files. The verification engine recalculates the SHA-256 binary hash in real time to confirm or deny exact bitwise parity 
                  without disclosing any portion of the original private manuscript.
                </p>
              </div>
            </section>

            {/* ========================================================= */}
            {/* SECTION 10: LIMITATION OF LIABILITY                       */}
            {/* ========================================================= */}
            <section
              id="liability"
              className="p-6 sm:p-8 rounded-3xl bg-mocha-900/60 border border-mocha-800/80 shadow-mocha-deep space-y-5 scroll-mt-24"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-mocha-800">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-gold-500/15 text-gold-300 border border-gold-500/30">
                  Section 10
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-mocha-50">
                  10. Limitation of Liability, Indemnity & Dispute Jurisdiction
                </h2>
              </div>

              <div className="prose prose-invert max-w-none text-sm text-mocha-300/90 leading-relaxed space-y-4">
                <p>
                  <strong>Disclaimer of Warranties:</strong> The Platform, certificates, and hash calculations are provided on an &quot;as is&quot; and &quot;as available&quot; basis. 
                  While PubSeal utilizes robust, enterprise-grade cryptographic standards and redundant cloud databases, we do not warrant that service will be uninterrupted, 
                  completely error-free, or invulnerable to catastrophic unforeseen external threats.
                </p>
                <div className="p-4 rounded-xl bg-mocha-950/70 border border-mocha-800 text-xs text-mocha-400 space-y-2">
                  <h4 className="font-serif font-bold text-gold-400 uppercase tracking-wide">
                    Limitation of Liability
                  </h4>
                  <p>
                    To the maximum extent permitted by applicable law, in no event shall PubSeal, its officers, employees, or technological partners be liable for:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Indirect, incidental, punitive, special, or consequential damages.</li>
                    <li>Loss of anticipated royalties, publishing contracts, profits, goodwill, or manuscript data.</li>
                    <li>The judicial admissibility, evidentiary weight, or legal outcome of any copyright infringement lawsuit or arbitration.</li>
                  </ul>
                  <p className="pt-1">
                    Our cumulative liability to you for any claim arising out of or related to these Terms or the Platform shall not exceed the greater of the fees paid by you to PubSeal in the past twelve (12) months or \$50.00 USD.
                  </p>
                </div>

                <p>
                  <strong>Indemnification:</strong> You agree to defend, indemnify, and hold harmless PubSeal and its affiliates from and against any third-party claims, 
                  damages, liabilities, or legal expenses arising from your violation of these Terms or infringement of any third party&apos;s intellectual property rights.
                </p>
              </div>
            </section>

            {/* ========================================================= */}
            {/* SECTION 11: AMENDMENTS & CONTACT                          */}
            {/* ========================================================= */}
            <section
              id="amendments-contact"
              className="p-6 sm:p-8 rounded-3xl bg-mocha-900/60 border border-mocha-800/80 shadow-mocha-deep space-y-5 scroll-mt-24"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-mocha-800">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-gold-500/15 text-gold-300 border border-gold-500/30">
                  Section 11
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-mocha-50">
                  11. Amendments, Severability & Legal Inquiries
                </h2>
              </div>

              <div className="prose prose-invert max-w-none text-sm text-mocha-300/90 leading-relaxed space-y-4">
                <p>
                  <strong>Amendments:</strong> PubSeal reserves the right to revise or update these Terms to reflect technical improvements, 
                  statutory shifts, or new security capabilities. When material modifications occur, we will post the updated effective date and provide 
                  prominent notification on the Platform. Continued use after revisions constitutes binding acceptance of modified terms.
                </p>
                <p>
                  <strong>Severability:</strong> If any provision of these Terms is deemed unlawful, void, or unenforceable by a court of competent jurisdiction, 
                  that provision shall be deemed severable and shall not affect the validity and enforceability of any remaining provisions.
                </p>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-mocha-900 to-mocha-950 border border-gold-500/30 space-y-3">
                  <h4 className="font-serif text-base font-bold text-gold-300">
                    Official Inquiries & Support
                  </h4>
                  <p className="text-xs text-mocha-300 leading-relaxed">
                    For questions regarding these Terms, registry records, or evidentiary certifications:
                  </p>
                  <div className="space-y-1.5 text-xs font-mono text-mocha-300">
                    <p>• <strong>Legal Department:</strong> <a href="mailto:legal@pubseal.com" className="text-gold-400 hover:text-gold-300 underline">legal@pubseal.com</a></p>
                    <p>• <strong>Registry Verification Help:</strong> <a href="mailto:support@pubseal.com" className="text-gold-400 hover:text-gold-300 underline">support@pubseal.com</a></p>
                    <p>• <strong>Platform:</strong> PubSeal Digital Ownership Registry</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-mocha-900 via-mocha-900/90 to-mocha-950 border border-gold-500/30 shadow-mocha-deep flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-xl font-bold text-mocha-50">
              Ready to Secure Your Manuscript?
            </h3>
            <p className="text-xs text-mocha-300">
              Register your unpublished literature in seconds with cryptographic SHA-256 timestamps.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl font-medium text-xs bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:from-gold-400 hover:to-gold-300 shadow-gold-glow transition-all"
            >
              Create Author Account
            </Link>
            <Link
              to="/verify"
              className="px-5 py-2.5 rounded-xl font-medium text-xs bg-mocha-950 hover:bg-mocha-850 text-gold-300 border border-gold-500/40 transition-all"
            >
              Verify Existing Work
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

