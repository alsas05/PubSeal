import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  MessageSquare,
  X,
  ChevronDown,
  Send,
  RotateCcw,
  Compass,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Lock,
  Binary,
  BookOpen,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  Scale,
  User,
  LogIn
} from 'lucide-react';

// Specialized Knowledge Base & Intent Matching for Sage
const SAGE_KNOWLEDGE_BASE = [
  {
    id: 'register_work',
    triggers: [
      'register',
      'upload',
      'submit',
      'new work',
      'register work',
      'add book',
      'protect novel',
      'manuscript upload',
      'how to register'
    ],
    title: 'Registering an Unpublished Work',
    response: `To register your work with PubSeal:

1. **Navigate to Register Work**: Click the button below or select 'Register Work' from the menu.
2. **Upload Your File**: Drag & drop your PDF, DOCX, or TXT file (up to 50MB).
3. **Add Details**: Enter your title, category (Novel, Poetry, Screenplay, etc.), and optional description.
4. **Instant SHA-256 Hashing**: Our server computes the raw binary fingerprint and certified timestamp.
5. **Receive Certificate**: Download your archival PDF Certificate with embedded QR code immediately!`,
    actions: [
      { label: 'Register a Work Now', path: '/register-work', icon: 'FileCheck2' },
      { label: 'View How It Works', path: '/#how-it-works', icon: 'BookOpen' }
    ]
  },
  {
    id: 'official_copyright',
    triggers: [
      'copyright',
      'official copyright',
      'us copyright office',
      'usco',
      'government',
      'legal copyright',
      'is this legal',
      'court',
      'lawsuit',
      'statutory',
      'monopoly',
      'substitute'
    ],
    title: 'PubSeal vs. Government Copyright Offices',
    response: `**Is PubSeal an official government copyright office?**

**No.** PubSeal is an independent technological evidentiary registry, not a government agency. 

• **What PubSeal Provides**: Immutable cryptographic proof (NIST FIPS 180-4 SHA-256 hash & server timestamp) establishing that you possessed this exact binary file at a certified date and time.
• **Evidentiary Value**: This serves as tamper-evident digital evidence in priority disputes, pitch meetings, and copyright claims.
• **Statutory Copyright**: If you require statutory damages or federal litigation standing (such as under 17 U.S.C. § 412 in the US), you should file with official bodies like the US Copyright Office alongside your PubSeal record.`,
    actions: [
      { label: 'Read Statutory Disclaimer', path: '/terms#statutory-disclaimer', icon: 'Scale' },
      { label: 'Explore Terms & Conditions', path: '/terms', icon: 'BookOpen' }
    ]
  },
  {
    id: 'ownership_privacy',
    triggers: [
      'ownership',
      'who owns',
      'my rights',
      'do you own',
      'intellectual property',
      'ip rights',
      'can you read',
      'vault',
      'private',
      'confidential',
      'ai training',
      'llm'
    ],
    title: '100% Author Ownership & Vault Privacy',
    response: `**You retain 100% of your rights.** 

• **Zero IP Claims**: PubSeal acquires zero copyright, publishing rights, or commercial royalties. You are the sole owner.
• **Confidential Author Vault**: Your manuscript is stored securely in your private vault. It is **never** made public, indexed by search engines, or sold.
• **Zero AI Training**: We never use manuscripts or creative drafts to train AI or large language models.
• **Public Boundary**: Only non-sensitive evidentiary metadata (Title, Author, Timestamp, and SHA-256 Hash) appears on the public verification portal.`,
    actions: [
      { label: 'Author Ownership Guarantee', path: '/terms#author-ownership', icon: 'ShieldCheck' },
      { label: 'Vault Security Policy', path: '/terms#vault-confidentiality', icon: 'Lock' }
    ]
  },
  {
    id: 'verify_documents',
    triggers: [
      'verify',
      'verification',
      'check',
      'validate',
      'certificate verify',
      'qr code',
      'lookup',
      'how to verify',
      'authenticity',
      'tamper'
    ],
    title: 'Verifying Documents & Certificates',
    response: `PubSeal offers real-time, zero-knowledge verification at **/verify**:

• **Method A (Candidate File)**: Drop an author's manuscript to recalculate its SHA-256 binary hash. If a single byte was altered, it reports NO MATCH. If identical, it confirms an EXACT CRYPTOGRAPHIC MATCH.
• **Method B (Registration ID)**: Enter any serial token (e.g. \`PUB-2026-XXXX\`) or paste a SHA-256 hash to view the public registry entry and download verification details.
• **QR Codes**: Every generated PDF certificate contains a scannable QR code linking straight to its public verification record.`,
    actions: [
      { label: 'Open Public Verification', path: '/verify', icon: 'ShieldCheck' }
    ]
  },
  {
    id: 'version_control',
    triggers: [
      'version',
      'new version',
      'revision',
      'draft',
      'edit work',
      'update file',
      'v2',
      'second draft',
      'revise'
    ],
    title: 'Document Version Control (V1, V2, V3)',
    response: `Yes! PubSeal supports **immutable multi-draft version control**:

1. Go to your **Author Dashboard** and open your work details.
2. Click **'Upload New Version'**.
3. Submit your revised draft (e.g. second revision or final proof).
4. PubSeal increments the version number, computes a unique SHA-256 hash for the revision, and issues an updated certificate while preserving all previous draft hashes in your permanent audit trail.`,
    actions: [
      { label: 'Go to Author Dashboard', path: '/dashboard', icon: 'Compass' }
    ]
  },
  {
    id: 'ai_readiness_score',
    triggers: [
      'readiness',
      'score',
      'ai score',
      'readiness score',
      'hygiene',
      'evaluation',
      'dossier',
      'statutory readiness'
    ],
    title: 'AI Copyright Readiness Score (0–100)',
    response: `The **AI Copyright Readiness Score** evaluates your manuscript's preparation for official copyright filings and literary submissions across 5 statutory pillars:

1. **Title & Front-Matter Clarity**
2. **Authorship Attribution & Chain of Custody**
3. **Document Structural Completeness**
4. **Format & Encoding Hygiene**
5. **Statutory Filing Preparedness**

You can also generate an exportable **Statutory Filing Dossier** directly from your work's details page.`,
    actions: [
      { label: 'View Works in Dashboard', path: '/dashboard', icon: 'Compass' },
      { label: 'Readiness Advisory Policy', path: '/terms#ai-score-disclaimer', icon: 'Scale' }
    ]
  },
  {
    id: 'sha256_tech',
    triggers: [
      'sha',
      'sha256',
      'hash',
      'fingerprint',
      'algorithm',
      'cryptographic',
      'deterministic',
      'fips',
      'binary'
    ],
    title: 'The NIST FIPS 180-4 SHA-256 Standard',
    response: `PubSeal relies on **SHA-256** (Secure Hash Algorithm 256-bit), standard recognized by the US National Institute of Standards and Technology (NIST):

• **Mathematical Determinism**: Identical file bytes will *always* generate the exact same 64-character hexadecimal digest.
• **Avalanche Effect**: Changing even a single comma or letter alters roughly 50% of the entire output hash.
• **Collision Resistance**: Finding two distinct manuscripts with the same SHA-256 hash is mathematically improbable with existing compute power.`,
    actions: [
      { label: 'Test File in Verification', path: '/verify', icon: 'Binary' }
    ]
  },
  {
    id: 'file_formats',
    triggers: [
      'format',
      'file type',
      'extension',
      'supported files',
      'pdf',
      'docx',
      'word',
      'txt',
      'size limit',
      'mb'
    ],
    title: 'Supported Formats & Size Limits',
    response: `PubSeal accepts the standard publishing industry file formats:

• **PDF** (\`.pdf\`) — Typeset manuscripts, galley proofs, papers
• **DOCX** (\`.docx\`) — Microsoft Word drafts and editors' revisions
• **TXT** (\`.txt\`) — Plaintext, screenplays, and poetry
• **Max Size**: Up to 50 MB per file

*Executable files (\`.exe\`, \`.bat\`, etc.) are rejected for security reasons.*`,
    actions: [
      { label: 'Register a Manuscript', path: '/register-work', icon: 'FileCheck2' }
    ]
  },
  {
    id: 'email_verification_auth',
    triggers: [
      'email',
      'otp',
      'pin',
      'code',
      'verify email',
      'login',
      'sign in',
      'social login',
      'google',
      'facebook',
      'password',
      'credentials'
    ],
    title: 'Authentication & Email Verification',
    response: `PubSeal offers enterprise-grade security for author accounts:

• **Email OTP**: Upon signup, a 6-digit verification code is dispatched to your authentic email address.
• **Social Login**: Sign in instantly using your Google or Facebook account.
• **Verification Status**: Verified authors receive a certified badge on their author profile and priority certificate downloads.`,
    actions: [
      { label: 'Verify Email', path: '/verify-email', icon: 'CheckCircle2' },
      { label: 'Sign In / Switch Account', path: '/login', icon: 'LogIn' }
    ]
  },
  {
    id: 'navigation_dashboard',
    triggers: [
      'dashboard',
      'my works',
      'vault',
      'where are my books',
      'view works',
      'my certificates',
      'download certificate'
    ],
    title: 'Author Vault & Dashboard Navigation',
    response: `Your **Author Dashboard** is your central creative command center! Here you can:

• View all registered literary works, poetry, and research.
• Download high-resolution vector PDF Certificates with golden seals.
• Check AI Copyright Readiness scores and hygiene recommendations.
• Register new revision versions (v1, v2, v3).
• Retrieve your original manuscripts from your encrypted vault.`,
    actions: [
      { label: 'Open Author Dashboard', path: '/dashboard', icon: 'Compass' }
    ]
  },
  {
    id: 'navigation_profile',
    triggers: [
      'profile',
      'account',
      'settings',
      'change password',
      'my account',
      'author details'
    ],
    title: 'Author Profile & Settings',
    response: `Manage your author identity, account email, verification status, and security preferences in your **Author Profile**.`,
    actions: [
      { label: 'Go to Profile Page', path: '/profile', icon: 'User' }
    ]
  },
  {
    id: 'navigation_terms',
    triggers: [
      'terms',
      'conditions',
      'terms of service',
      'legal',
      'privacy policy',
      'tos',
      'policy'
    ],
    title: 'Terms of Service & Legal Framework',
    response: `PubSeal's comprehensive **Terms & Conditions** outline our cryptographic evidence model, 100% author ownership covenants, vault privacy guarantees, and statutory non-government disclaimers.`,
    actions: [
      { label: 'Open Terms & Conditions', path: '/terms', icon: 'BookOpen' }
    ]
  },
  {
    id: 'greeting',
    triggers: [
      'hello',
      'hi',
      'hey',
      'greetings',
      'good morning',
      'good afternoon',
      'who are you',
      'what is sage',
      'help',
      'doubts'
    ],
    title: 'Greetings from Sage',
    response: `Greetings! I am **Sage**, your dedicated PubSeal literary navigator and guide.

I can help you:
• Understand how cryptographic SHA-256 registration protects your work
• Navigate between the Dashboard, Registration, Verification, and Profile
• Clarify questions regarding copyright vs. evidentiary proof
• Explain how to download certificates or register new revisions

What questions or doubts may I clear for you today?`,
    actions: [
      { label: 'Register a Work', path: '/register-work', icon: 'FileCheck2' },
      { label: 'Verify a Manuscript', path: '/verify', icon: 'ShieldCheck' },
      { label: 'Read Terms of Service', path: '/terms', icon: 'Scale' }
    ]
  }
];

// Helper to determine the best response
function matchUserQuery(query, user, currentPath) {
  const normalized = query.toLowerCase().trim();

  // 1. Direct match on knowledge base triggers
  let bestMatch = null;
  let highestScore = 0;

  for (const item of SAGE_KNOWLEDGE_BASE) {
    let score = 0;
    for (const trigger of item.triggers) {
      if (normalized === trigger) {
        score += 10;
      } else if (normalized.includes(trigger)) {
        score += trigger.length;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore > 0) {
    let personalizedResponse = bestMatch.response;
    if (user && bestMatch.id === 'greeting') {
      personalizedResponse = `Greetings, **${user.fullName || 'Author'}**! I am **Sage**, your PubSeal literary assistant.\n\nI can help you manage your registered works, verify documents, or answer questions regarding your digital ownership certificates.\n\nWhat would you like to explore?`;
    }
    return {
      title: bestMatch.title,
      text: personalizedResponse,
      actions: bestMatch.actions || []
    };
  }

  // 2. Intelligent Contextual Fallback
  return {
    title: 'Assisting with Your Inquiry',
    text: `I understand you have a question regarding: *"_${query}_"*. 

As your PubSeal assistant, here are the most common areas I can guide you through:
• **Registering Work**: Create immutable cryptographic proof of your manuscript before pitching or publishing.
• **Public Verification**: Verify a certificate token or candidate file's SHA-256 match in real time.
• **100% Author Ownership**: You retain full copyright and moral rights at all times.
• **Legal Standing**: Distinguishing cryptographic evidence from government copyright registrations.

Choose a quick shortcut below or feel free to rephrase your doubt!`,
    actions: [
      { label: 'Register Work', path: '/register-work', icon: 'FileCheck2' },
      { label: 'Verify Document', path: '/verify', icon: 'ShieldCheck' },
      { label: 'View Terms & Rights', path: '/terms', icon: 'Scale' }
    ]
  };
}

const SageChatbot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initial welcome message
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'sage',
      text: `Hello! I am **Sage**, your PubSeal literary navigator. 

Whether you need help registering a manuscript, understanding SHA-256 timestamps, verifying a certificate, or navigating the platform, I am here to help.`,
      actions: [
        { label: 'How to Register Work', path: '/register-work', icon: 'FileCheck2' },
        { label: 'Is this Official Copyright?', path: '/terms#statutory-disclaimer', icon: 'Scale' },
        { label: 'How Verification Works', path: '/verify', icon: 'ShieldCheck' }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Quick suggestion chips
  const quickChips = [
    { label: '📝 How to register', query: 'How do I register a new manuscript?' },
    { label: '⚖️ Is this copyright?', query: 'Does PubSeal replace official government copyright?' },
    { label: '🔒 Who owns my work?', query: 'Who owns the copyright of uploaded manuscripts?' },
    { label: '🔍 How to verify', query: 'How does manuscript verification work?' },
    { label: '📊 AI Readiness Score', query: 'What is the AI Copyright Readiness score?' },
    { label: '📁 Go to Dashboard', query: 'Take me to my author dashboard' },
    { label: '📜 Terms of Service', query: 'Show me the terms and legal disclaimers' }
  ];

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Auto-dismiss the greeting toast after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Natural assistant thinking delay (350ms)
    setTimeout(() => {
      const match = matchUserQuery(text, user, location.pathname);
      const sageMessage = {
        id: `sage-${Date.now()}`,
        sender: 'sage',
        title: match.title,
        text: match.text,
        actions: match.actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, sageMessage]);
      setIsTyping(false);
    }, 380);
  };

  const handleActionClick = (path) => {
    if (path.startsWith('/#')) {
      const hash = path.replace('/#', '');
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      navigate(path);
    }
    // On small screens, close the chat to allow user to view the page
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'sage',
        text: `Conversation refreshed. How may I guide you across PubSeal today, ${user ? user.fullName : 'Author'}?`,
        actions: [
          { label: 'Register a Work', path: '/register-work', icon: 'FileCheck2' },
          { label: 'Public Verification', path: '/verify', icon: 'ShieldCheck' },
          { label: 'Author Ownership Guarantee', path: '/terms#author-ownership', icon: 'Lock' }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end select-none">
      {/* 1. GREETING SPEECH BUBBLE TOAST (When collapsed) */}
      {!isOpen && showToast && (
        <div className="mb-3 animate-fade-in flex items-center space-x-2 p-3 sm:p-3.5 rounded-2xl bg-mocha-900/95 border border-gold-500/40 shadow-mocha-deep text-xs text-mocha-100 max-w-[270px] sm:max-w-xs backdrop-blur-md">
          <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-400/40 flex items-center justify-center text-gold-300 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 pr-1">
            <p className="font-serif font-bold text-gold-300 text-[11px] uppercase tracking-wider">
              Meet Sage • Platform Guide
            </p>
            <p className="text-[11px] text-mocha-300 leading-snug mt-0.5">
              Have doubts about copyright or registration? Ask Sage!
            </p>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="w-5 h-5 rounded-full flex items-center justify-center text-mocha-400 hover:text-mocha-100 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. CHAT WINDOW MODAL */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[410px] h-[580px] max-h-[82vh] rounded-3xl bg-mocha-950/95 border border-mocha-700/80 shadow-2xl shadow-black/80 flex flex-col overflow-hidden backdrop-blur-xl animate-fade-in">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-mocha-900 via-mocha-900/95 to-mocha-950 border-b border-mocha-800/90 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gold-500/25 to-mocha-800 border border-gold-500/40 flex items-center justify-center text-gold-300 shadow-sm">
                  <Sparkles className="w-5 h-5 text-gold-400" />
                </div>
                {/* Active status pulse */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-mocha-950 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping opacity-75" />
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-serif text-sm font-bold text-mocha-50 tracking-wide">
                    Sage
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-gold-500/15 text-gold-300 border border-gold-500/30 font-semibold uppercase">
                    PubSeal Guide
                  </span>
                </div>
                <p className="text-[11px] text-mocha-400 font-mono flex items-center space-x-1">
                  <span>Active Now</span>
                  <span>•</span>
                  <span className="truncate max-w-[140px] text-mocha-400/80">
                    {location.pathname === '/' ? 'Home' : location.pathname}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleResetChat}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-mocha-400 hover:text-gold-300 hover:bg-mocha-850/80 transition-all"
                title="Restart conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-mocha-400 hover:text-mocha-100 hover:bg-mocha-850/80 transition-all"
                title="Minimize Sage"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Suggestion Chips Carousel */}
          <div className="px-3 py-2 bg-mocha-900/60 border-b border-mocha-800/60 overflow-x-auto no-scrollbar flex items-center space-x-2 shrink-0">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.query)}
                className="px-2.5 py-1 rounded-full text-[11px] bg-mocha-850 hover:bg-mocha-800 text-mocha-300 hover:text-gold-300 border border-mocha-700/60 hover:border-gold-500/40 whitespace-nowrap transition-all shadow-sm shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                } animate-fade-in`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-gold-500/20 to-gold-400/15 border border-gold-400/35 text-mocha-50 rounded-br-none shadow-sm'
                      : 'bg-mocha-900/90 border border-mocha-700/70 text-mocha-200 rounded-bl-none shadow-mocha-deep'
                  }`}
                >
                  {/* Title if present */}
                  {msg.title && (
                    <div className="font-serif font-bold text-gold-300 text-xs pb-1 mb-1.5 border-b border-mocha-800/80 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                      <span>{msg.title}</span>
                    </div>
                  )}

                  <p className="leading-relaxed">{msg.text}</p>

                  {/* Interactive Action / Navigation Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-mocha-800/80 flex flex-wrap gap-2">
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(act.path)}
                          className="px-3 py-1.5 rounded-xl bg-gold-500/15 hover:bg-gold-500/25 text-gold-300 hover:text-gold-200 border border-gold-500/30 hover:border-gold-400 font-medium text-[11px] transition-all flex items-center space-x-1.5 shadow-sm group"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 text-gold-400 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[10px] font-mono text-mocha-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center space-x-2 text-mocha-400 p-2 rounded-xl bg-mocha-900/50 w-fit animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span className="text-[11px] font-mono text-gold-300/80">
                  Sage is contemplating...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-mocha-900/90 border-t border-mocha-800/90 flex items-center space-x-2 shrink-0"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Sage anything about PubSeal..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-mocha-950 border border-mocha-700/80 text-mocha-100 placeholder-mocha-400/60 text-xs focus:outline-none focus:border-gold-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 hover:from-gold-400 hover:to-gold-300 disabled:opacity-40 flex items-center justify-center transition-all shadow-md shadow-gold-500/20"
              title="Send question to Sage"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 3. FLOATING TRIGGER BUTTON (When collapsed or open) */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowToast(false);
        }}
        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl group ${
          isOpen
            ? 'bg-mocha-850 border border-mocha-700 text-mocha-300 hover:text-gold-300'
            : 'bg-gradient-to-br from-mocha-900 via-mocha-900 to-mocha-950 border border-gold-500/40 text-gold-300 hover:border-gold-400 shadow-gold-glow hover:scale-105'
        }`}
        title={isOpen ? 'Close Sage Assistant' : 'Ask Sage — PubSeal AI Navigator'}
      >
        {/* Ambient pulse ring when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-2xl bg-gold-500/20 animate-ping opacity-30 pointer-events-none" />
        )}

        {isOpen ? (
          <X className="w-6 h-6 transition-transform group-hover:rotate-90" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-gold-400 filter drop-shadow-[0_0_8px_rgba(203,159,84,0.6)]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-mocha-950" />
          </div>
        )}
      </button>
    </div>
  );
};

export default SageChatbot;
