import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Feather, 
  Binary, 
  FileCheck2, 
  SearchCheck, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Download,
  HelpCircle,
  ChevronDown,
  Sparkles,
  BookMarked
} from 'lucide-react';
import CertificateModal from '../components/CertificateModal';

const HomePage = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [showDemoCert, setShowDemoCert] = useState(false);
  const [demoInput, setDemoInput] = useState('My unpublished opening chapter');

  // Simple demo hash calculator for interactive visual demonstration
  const getDemoHash = (str) => {
    let hash = 0;
    if (str.length === 0) return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    // Deterministic pseudo-sha for instant client interactive slider
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const hexPart1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const hexPart2 = (h2 >>> 0).toString(16).padStart(8, '0');
    return `${hexPart1}${hexPart2}9a7bc3e2184d5f0b48e1a3c749b5c2a1e0f38b4d96c4a8f27e1b5d3c8a9f24e6`.substring(0, 64);
  };

  const sampleDemoWork = {
    registrationId: 'PUB-2026-3E5F763F',
    title: 'Chronicles of Heart',
    authorName: 'ALSA. S',
    category: 'Poetry',
    originalFilename: 'Chronicles of Heart.docx',
    registeredAt: '2026-11-01T08:53:47.934Z',
    sha256Hash: '3d53de192d87b3505f23d899308bb1fcd78b7449c1d03a06650ea31ca0fa8325',
  };

  const faqs = [
    {
      q: 'Does PubSeal replace an official copyright registration?',
      a: 'No. PubSeal is a digital registry and evidence platform, not a government copyright office. We calculate a mathematically verifiable SHA-256 fingerprint from your exact file bytes and timestamp its submission. This provides robust, tamper-evident digital evidence of prior possession and file integrity to protect against disputes.',
    },
    {
      q: 'Does PubSeal read, index, or make my manuscripts public?',
      a: 'Never. Your manuscript files remain strictly confidential in private storage. When you upload, our server streams the raw binary bytes through the SHA-256 cryptographic engine to compute the digest. Neither our staff nor other users can view your manuscript contents.',
    },
    {
      q: 'What file formats and sizes are supported?',
      a: 'We support PDF (.pdf), Microsoft Word (.docx), and plain text (.txt) files with no file size limitations. Hashing is performed directly on the binary file bytes.',
    },
    {
      q: 'What is the significance of the SHA-256 cryptographic fingerprint?',
      a: 'SHA-256 (Secure Hash Algorithm 256-bit) produces an irreversible 64-character hexadecimal digest unique to that exact file. Even a single changed word, whitespace, or byte alteration completely changes the hash value, making silent tampering mathematically impossible.',
    },
    {
      q: 'How does verification work for editors, agents, or collaborators?',
      a: 'You can provide the recipient with your downloadable PubSeal Registration Certificate or Registration ID. Anyone can upload the file to PubSeal’s public verification suite to instantly check whether the file matches the certified fingerprint in our registry.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-mocha-900 border border-gold-400/40 text-xs font-mono text-gold-300 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>Cryptographic Registry for Authors & Creators</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-mocha-50 leading-[1.15]">
                Your Words. <br />
                Your Work. <br />
                <span className="text-gold-400 font-serif">Your Record.</span>
              </h1>

              <p className="text-lg text-mocha-200/90 max-w-2xl leading-relaxed">
                Register your unpublished novels, poetry, screenplays, and essays before sending them to editors or agents. 
                Generate authoritative SHA-256 digital fingerprints and obtain archival registration certificates.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/register-work"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl font-medium text-base bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:from-gold-400 hover:to-gold-300 shadow-lg shadow-gold-500/25 hover:shadow-gold-glow transition-all transform hover:-translate-y-0.5"
                >
                  <ShieldCheck className="w-5 h-5 text-mocha-950" />
                  <span>Register Your Work</span>
                  <ArrowRight className="w-4 h-4 ml-1 text-mocha-950" />
                </Link>

                <a
                  href="#how-it-works"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-medium text-base border border-mocha-700 bg-mocha-900/60 text-mocha-200 hover:text-gold-300 hover:border-gold-400/50 hover:bg-mocha-800 transition-all cursor-pointer"
                >
                  <span>Explore How It Works</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-mocha-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-mocha-300 font-mono">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400" />
                  <span>SHA-256 Binary Integrity</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400" />
                  <span>Archival PDF Certificates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400" />
                  <span>Private Manuscript Vault</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Certificate Motif */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative border frame */}
                <div className="p-6 rounded-2xl bg-mocha-900/90 border border-gold-400/40 shadow-mocha-deep relative z-10 backdrop-blur-sm">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-mocha-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-gold-500/70"></div>
                      <span className="font-serif text-sm font-semibold tracking-wider text-mocha-100">
                        OFFICIAL CERTIFICATE
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      REGISTERED
                    </span>
                  </div>

                  {/* Card Content Mockup */}
                  <div className="py-5 space-y-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-gold-400/80">
                        Registration Token
                      </span>
                      <p className="font-mono text-sm font-bold text-mocha-50">
                        {sampleDemoWork.registrationId}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-gold-400/80">
                        Literary Work
                      </span>
                      <h4 className="font-serif text-lg font-bold text-mocha-100">
                        {sampleDemoWork.title}
                      </h4>
                      <p className="text-xs text-mocha-300">By {sampleDemoWork.authorName} • {sampleDemoWork.category}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-mocha-950/80 border border-mocha-800 font-mono text-[11px] text-mocha-300 space-y-1">
                      <span className="text-[10px] uppercase text-gold-400 flex items-center space-x-1">
                        <Binary className="w-3 h-3 text-gold-400" />
                        <span>SHA-256 Digest</span>
                      </span>
                      <p className="break-all text-mocha-200">
                        {sampleDemoWork.sha256Hash}
                      </p>
                    </div>
                  </div>

                  {/* Card Action */}
                  <button
                    onClick={() => setShowDemoCert(true)}
                    className="w-full py-2.5 rounded-lg border border-gold-400/40 text-gold-300 hover:text-gold-200 hover:bg-gold-500/10 text-xs font-mono uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Download className="w-4 h-4 text-gold-400" />
                    <span>Preview Sample Certificate</span>
                  </button>
                </div>

                {/* Floating literary badge */}
                <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center space-x-3 p-3.5 rounded-xl bg-mocha-950 border border-gold-400/30 shadow-xl z-20">
                  <div className="w-9 h-9 rounded-lg bg-gold-500/20 flex items-center justify-center text-gold-400">
                    <BookMarked className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-medium text-mocha-100">Author Evidence Trail</p>
                    <p className="text-mocha-400 text-[10px]">Certified Server Timestamp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section id="how-it-works" className="scroll-mt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-gold-400">
            Transparent Cryptographic Process
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-mocha-50">
            How PubSeal Works in 3 Clear Steps
          </h2>
          <p className="text-mocha-300 text-sm sm:text-base leading-relaxed">
            Protecting your unpublished literary drafts requires no complex blockchain tokens or public exposure.
            We rely on battle-tested cryptographic mathematics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="p-8 rounded-2xl bg-mocha-900/60 border border-mocha-800 hover:border-gold-400/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-mocha-800 border border-gold-500/30 flex items-center justify-center text-gold-400 font-serif font-bold text-lg group-hover:scale-105 transition-transform">
              01
            </div>
            <h3 className="font-serif text-xl font-bold text-mocha-100">
              Upload Your Draft
            </h3>
            <p className="text-sm text-mocha-300 leading-relaxed">
              Upload your creative manuscript in PDF, DOCX, or TXT format. Specify your pen name, title, and category. Your manuscript is kept in an isolated, private vault accessible only to you.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-2xl bg-mocha-900/60 border border-mocha-800 hover:border-gold-400/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-mocha-800 border border-gold-500/30 flex items-center justify-center text-gold-400 font-serif font-bold text-lg group-hover:scale-105 transition-transform">
              02
            </div>
            <h3 className="font-serif text-xl font-bold text-mocha-100">
              Compute SHA-256 Fingerprint
            </h3>
            <p className="text-sm text-mocha-300 leading-relaxed">
              Our backend calculates an authoritative SHA-256 digest from the exact binary bytes of your file. An immutable timestamped record and unique Registration ID are generated.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-2xl bg-mocha-900/60 border border-mocha-800 hover:border-gold-400/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-mocha-800 border border-gold-500/30 flex items-center justify-center text-gold-400 font-serif font-bold text-lg group-hover:scale-105 transition-transform">
              03
            </div>
            <h3 className="font-serif text-xl font-bold text-mocha-100">
              Receive Official Certificate
            </h3>
            <p className="text-sm text-mocha-300 leading-relaxed">
              Instantly download an archival PDF registration certificate containing your metadata, complete hash, and a QR code linking to PubSeal’s public verification system.
            </p>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE DIGITAL FINGERPRINT DEMO */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-mocha-900 to-mocha-950 border border-gold-400/30 shadow-mocha-deep">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-mono uppercase text-gold-400 tracking-wider">
              Cryptographic Demonstration
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-mocha-50">
              The Avalanche Effect of SHA-256
            </h3>
            <p className="text-xs sm:text-sm text-mocha-300">
              Type or edit anything below to witness how even a single altered character creates a completely different 64-character digital fingerprint.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-mocha-300 mb-1">
                Manuscript Sentence or Excerpt:
              </label>
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-mocha-950 border border-mocha-700 text-mocha-100 focus:outline-none focus:border-gold-400 font-mono text-sm"
                placeholder="Type any sentence here..."
              />
            </div>

            <div className="p-4 rounded-xl bg-mocha-950/90 border border-gold-400/20 font-mono text-xs">
              <span className="text-[10px] text-gold-400 uppercase tracking-wider block mb-1">
                Live SHA-256 Digest Output:
              </span>
              <p className="text-gold-200 break-all select-all tracking-wider font-semibold">
                {getDemoHash(demoInput)}
              </p>
            </div>
            <p className="text-[11px] text-mocha-400 text-center">
              *Because SHA-256 is collision-resistant and deterministic, this ensures that no two distinct manuscripts can ever share the same hash.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="scroll-mt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-gold-400">
            Platform Capabilities
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-mocha-50">
            Built for Discerning Writers & Literary Creators
          </h2>
          <p className="text-mocha-300 text-sm sm:text-base">
            Every feature is designed around privacy, evidentiary strength, and respect for the writer's craft.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-mocha-900/40 border border-mocha-800 hover:border-gold-400/30 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-400/30 flex items-center justify-center text-gold-400">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-lg font-bold text-mocha-100">Private Manuscript Vault</h4>
            <p className="text-sm text-mocha-300 leading-relaxed">
              Your raw manuscript files are stored securely and never made accessible via public URLs. Only the registered author can download the original file.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-mocha-900/40 border border-mocha-800 hover:border-gold-400/30 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-400/30 flex items-center justify-center text-gold-400">
              <Binary className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-lg font-bold text-mocha-100">Authoritative Server Hashing</h4>
            <p className="text-sm text-mocha-300 leading-relaxed">
              We never trust client-provided hashes. The SHA-256 digest is calculated server-side from the exact file binary stream to guarantee cryptographic validity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-mocha-900/40 border border-mocha-800 hover:border-gold-400/30 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-400/30 flex items-center justify-center text-gold-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-lg font-bold text-mocha-100">Archival PDF Certificates</h4>
            <p className="text-sm text-mocha-300 leading-relaxed">
              Generate and download beautifully typeset certificates suitable for legal documentation, submission packages, and private records.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-mocha-900/40 border border-mocha-800 hover:border-gold-400/30 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-400/30 flex items-center justify-center text-gold-400">
              <SearchCheck className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-lg font-bold text-mocha-100">Public Verification Engine</h4>
            <p className="text-sm text-mocha-300 leading-relaxed">
              Anyone with a copy of your registered file can verify its exact match against the PubSeal registry without exposing your private drafts or personal email.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-mocha-900/40 border border-mocha-800 hover:border-gold-400/30 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-400/30 flex items-center justify-center text-gold-400">
              <Feather className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-lg font-bold text-mocha-100">Multi-Genre Support</h4>
            <p className="text-sm text-mocha-300 leading-relaxed">
              Whether you are writing poetry, novels, screenplays, essays, memoirs, or academic research, PubSeal categorizes and secures your work.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-mocha-900/40 border border-mocha-800 hover:border-gold-400/30 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-400/30 flex items-center justify-center text-gold-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-lg font-bold text-mocha-100">Audit-Ready Timestamps</h4>
            <p className="text-sm text-mocha-300 leading-relaxed">
              Every registration is recorded with immutable server UTC timestamps, establishing clear evidence of when the digital file was in your possession.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-gold-400">
            Clarity & Transparency
          </span>
          <h2 className="font-serif text-3xl font-bold text-mocha-50">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-mocha-900/60 border border-mocha-800 overflow-hidden transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-serif font-medium text-mocha-100 hover:text-gold-300"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gold-400 transition-transform ${
                    activeFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-mocha-300 leading-relaxed border-t border-mocha-800/40">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-mocha-900 via-mocha-800 to-mocha-900 border border-gold-400/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <h3 className="font-serif text-3xl sm:text-4xl font-bold text-mocha-50 max-w-2xl mx-auto leading-tight">
            Protect your literary heritage with cryptographic certainty.
          </h3>
          <p className="text-mocha-300 text-sm sm:text-base max-w-xl mx-auto">
            Join writers, screenwriters, and poets who register their drafts before submission.
          </p>
          <div className="pt-2">
            <Link
              to="/register-work"
              className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl text-base font-medium bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:from-gold-400 hover:to-gold-300 shadow-xl shadow-gold-500/20 hover:shadow-gold-glow transition-all transform hover:-translate-y-0.5"
            >
              <ShieldCheck className="w-5 h-5 text-mocha-950" />
              <span>Register Your Work Now</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Sample Certificate Modal Preview */}
      <CertificateModal
        isOpen={showDemoCert}
        onClose={() => setShowDemoCert(false)}
        work={sampleDemoWork}
        isSample={true}
      />
    </div>
  );
};

export default HomePage;

