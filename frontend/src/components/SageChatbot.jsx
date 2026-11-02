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
  LogIn,
  AlertCircle,
  Heart
} from 'lucide-react';

/**
 * Human Social & Conversational Intents
 * Handles gratitude, small talk, check-ins, acknowledgments, and natural human dialogues
 */
const HUMAN_CONVERSATIONAL_INTENTS = [
  // 1. GRATITUDE & THANKS (e.g. "thank you", "thanks", "appreciate it")
  {
    id: 'gratitude',
    patterns: [
      /(thank\s*(you|u)|thanks|thx|ty|appreciate\s*(it|you|your\s*help)|grateful|many\s*thanks)/i
    ],
    getReply: (user) => {
      const authorName = user?.fullName ? `, ${user.fullName}` : '';
      const replies = [
        `You're very welcome${authorName}! 😊 Always a pleasure to help. If any other doubts pop up while writing or registering your work, I'm right here. Wishing you joyful writing! ✦`,
        `You are most welcome${authorName}! ✦ Protecting your creative writing is what I'm here for. Let me know whenever you need anything else!`,
        `Anytime at all! It's an honor to assist authors and creators. May your words flow effortlessly today! ✨`
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }
  },

  // 2. ACKNOWLEDGMENTS & UNDERSTANDING (e.g. "ok", "okay", "got it", "cool", "understood", "makes sense")
  {
    id: 'acknowledgments',
    patterns: [
      /^(ok|okay|k|alright|cool|got\s*it|understood|makes\s*sense|sounds\s*good|perfect|awesome|great|noted|sure|fine|nice|yep|yup|right)(\s*(got\s*it|cool|understood|makes\s*sense|perfect|awesome|thanks|thank\s*you))?[\s!.,:)]*$/i
    ],
    getReply: () => {
      const replies = [
        `Wonderful! I'm glad that was clear. Let me know whenever you'd like to take the next step or explore anything else. ✦`,
        `Splendid! Take your time exploring. I'm right here in your corner whenever you need a hand.`,
        `Glad that makes sense! Feel free to ask anytime inspiration strikes. ✨`
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }
  },

  // 3. CHECK-INS / HOW ARE YOU (e.g. "how are you", "how are you doing", "what's up")
  {
    id: 'how_are_you',
    patterns: [
      /(how\s*are\s*you|how\s*are\s*you\s*doing|how'?s\s*it\s*going|how\s*do\s*you\s*do|what'?s\s*up|sup)[\s!?.]*$/i
    ],
    getReply: (user) => {
      const authorName = user?.fullName ? `, ${user.fullName}` : '';
      const replies = [
        `I'm doing splendidly, thank you for asking! ☕ Just keeping an eye on our authors' vaults and certificates. How is your writing or creative journey coming along today${authorName}?`,
        `I'm feeling wonderful and inspired! Ready and eager to help. How are you doing today${authorName}? Working on any new stories or research? ✨`
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }
  },

  // 4. FAREWELL & GOODBYES (e.g. "bye", "goodbye", "see you later", "good night")
  {
    id: 'farewell',
    patterns: [
      /^(bye|goodbye|cya|see\s*you|see\s*you\s*later|talk\s*to\s*you\s*later|have\s*a\s*good\s*(day|night|evening)|good\s*night|catch\s*you\s*later)[\s!.,:)]*$/i
    ],
    getReply: () => {
      const replies = [
        `Goodbye for now! 👋 May your quill stay sharp and your drafts keep growing. I'll be right here whenever you return.`,
        `Take care! Have a wonderful day ahead. Whenever you're ready to register your next masterpiece, I'll be waiting. ✦`,
        `Good night! Rest well and dream up wonderful stories. Talk soon! 🌙`
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }
  },

  // 5. COMPLIMENTS (e.g. "you are awesome", "you're so helpful", "love this", "good job")
  {
    id: 'compliments',
    patterns: [
      /(you('re|\s*are)\s*(awesome|great|the\s*best|helpful|smart|cool|amazing|kind|sweet)|love\s*(you|this|sage)|good\s*job|nice\s*work|you\s*rock)/i
    ],
    getReply: () => {
      const replies = [
        `Aww, thank you so much! That warms my literary heart. 💫 Writing can be a solitary journey, so I'm thrilled to be here helping you protect your craft!`,
        `That is so kind of you to say! Thank you. I truly love helping authors and creators navigate PubSeal. ✦`
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }
  },

  // 6. APOLOGIES (e.g. "sorry", "my bad", "pardon")
  {
    id: 'apology',
    patterns: [
      /^(sorry|my\s*bad|i\s*apologize|excuse\s*me|pardon\s*me)[\s!.,:)]*$/i
    ],
    getReply: () => {
      return `Oh, please don't apologize at all! There are no silly questions or mistakes here. How can I help you next? 😊`;
    }
  },

  // 7. HUMOR / JOKES
  {
    id: 'humor',
    patterns: [
      /(haha|hehe|lol|lmao|tell\s*me\s*a\s*joke|joke|make\s*me\s*laugh|funny)/i
    ],
    getReply: () => {
      const jokes = [
        `Haha! Glad I could bring a smile to your desk. 😄\n\nHere's a literary one for you: *Why did the novelist sit by the radiator? Because they wanted to produce warm prose!*\n\nWhat can I help you write or protect today?`,
        `😄 *Why did the comma break up with the apostrophe? Because it was too possessive!*\n\nLet me know if there's anything about your manuscripts or certificates I can help with!`
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }
  },

  // 8. IDENTITY / ARE YOU HUMAN
  {
    id: 'identity',
    patterns: [
      /(who\s*(are\s*you|made\s*you|created\s*you)|what\s*are\s*you|are\s*you\s*(real|human|ai|a\s*bot|robot))/i
    ],
    getReply: () => {
      return `I am **Sage**, PubSeal's resident literary assistant and platform guide! 

While I am powered by code and artificial intelligence, my heart beats for authors, storytellers, and researchers. I'm here to ensure you never feel lost when registering manuscripts or proving your copyright priority.

Are you currently working on a book, script, or paper?`;
    }
  },

  // 9. AFFIRMATIONS (Yes / Sure)
  {
    id: 'affirmation',
    patterns: [
      /^(yes|yeah|yep|sure|yup|absolutely|definitely)[\s!.,:)]*$/i
    ],
    getReply: () => {
      return `Awesome! What would you like to explore next? We can register an unpublished manuscript, check out the public verification tool, or review our author ownership guarantees.`;
    },
    actions: [
      { label: 'Register a Work', path: '/register-work', icon: 'FileCheck2' },
      { label: 'Public Verification', path: '/verify', icon: 'ShieldCheck' },
      { label: 'Author Ownership Guarantee', path: '/terms#author-ownership', icon: 'Lock' }
    ]
  },

  // 10. "I DON'T UNDERSTAND" / "EXPLAIN SIMPLY"
  {
    id: 'explain_simply',
    patterns: [
      /(i\s*don'?t\s*understand|what\s*do\s*you\s*mean|confused|explain\s*simply|in\s*simple\s*(words|terms)|eli5|too\s*complicated)/i
    ],
    getReply: () => {
      return `Let me put it in plain, simple terms for you! 😊

Think of PubSeal like a **digital notary** for your writing:
1. You write a book, poem, or screenplay on your computer.
2. Before sending it to an agent, editor, or publisher, you upload it to PubSeal.
3. PubSeal creates a unique mathematical fingerprint (called a SHA-256 hash) of your exact file and stamps it with the date and millisecond.
4. You get an official certificate with a QR code.

If anyone ever tries to copy your ideas or claims they wrote it before you, you have undeniable mathematical proof that you already had that exact file before them!

Does that make it clearer? Feel free to ask about any part of it!`;
    },
    actions: [
      { label: 'How It Works Guide', path: '/#how-it-works', icon: 'BookOpen' }
    ]
  }
];

/**
 * Technical, Legal & Feature Intents for PubSeal
 */
const SAGE_INTENTS = [
  // 1. ACCOUNT CREATION & DOCUMENT REQUIREMENTS
  {
    id: 'account_documents_required',
    patterns: [
      /(create|open|sign\s*up|make|register|join).*account.*(document|id|proof|require|need|paper)/i,
      /(do\s*i\s*need|require|necessary).*(document|id|proof|paper|file).*account/i,
      /account.*(document|id|proof|papers|kyc|passport|license)/i,
      /(need|require).*(document|id|proof).*(create|open|make|register|sign\s*up)/i,
      /(sign\s*up|register|create\s*account).*what\s*(do\s*i\s*need|is\s*required|do\s*you\s*need)/i,
      /documents?.*(to\s*create|for\s*account|to\s*sign\s*up|to\s*register)/i,
      /what\s*documents?.*(need|required|necessary)/i
    ],
    title: 'Account Creation Requirements',
    answer: `**No, you do not need any documents to create an account on PubSeal!**

Creating an author account is simple, free, and requires zero paperwork:

• **What you need**:
  1. **Your Name**: Your preferred author or pen name.
  2. **An Email Address**: Where we send a 6-digit verification code (OTP).
  3. **A Password**: To secure your author login.
  *(Or sign up instantly with 1 click using Google or Facebook!)*

• **No Identity Proof**: We never ask for government IDs, passports, tax forms, or personal papers.
• **When are documents used?**: You only upload a document (like a PDF, DOCX, or TXT file) when you are ready to **register an unpublished manuscript** in your private vault to generate its cryptographic proof.`,
    actions: [
      { label: 'Create Free Account Now', path: '/register', icon: 'User' },
      { label: 'How Registration Works', path: '/#how-it-works', icon: 'BookOpen' }
    ]
  },

  // 2. PEN NAMES & AUTHOR ALIASES
  {
    id: 'pen_names',
    patterns: [
      /(pen\s*name|pseudonym|alias|fake\s*name|stage\s*name)/i,
      /(can\s*i\s*use|allowed).*(pen\s*name|pseudonym)/i,
      /(real\s*name|legal\s*name).*(required|mandatory|must\s*i\s*use)/i
    ],
    title: 'Pen Names & Author Attribution',
    answer: `**Yes, you can register under any pen name or pseudonym you prefer!**

• **Your Choice**: When signing up or registering a manuscript, you can use your pen name, collaborative collective name, or legal name.
• **On Certificates**: The archival PDF Certificate and public verification badge will display whichever author name you specify.
• **Editing Later**: You can update your author attribution at any time from your **Author Profile**.`,
    actions: [
      { label: 'Create Account', path: '/register', icon: 'User' },
      { label: 'Go to Profile', path: '/profile', icon: 'User' }
    ]
  },

  // 3. PRICING & COST
  {
    id: 'pricing_cost',
    patterns: [
      /(how\s*much|cost|price|pricing|charge|fee|fees|pay|payment|subscription|is\s*it\s*free)/i,
      /(do\s*i\s*have\s*to\s*pay|is\s*pubseal\s*free)/i
    ],
    title: 'Pricing & Account Cost',
    answer: `**Creating an account and exploring PubSeal is completely free!**

• **Author Account**: Free setup with authentic email OTP verification.
• **Cryptographic Hashing**: Instant NIST FIPS 180-4 SHA-256 fingerprinting.
• **Archival PDF Certificates**: Downloadable certificates with embedded verification QR codes.
• **Public Verification Portal**: Free, unlimited real-time verification for literary agents, publishers, and readers.`,
    actions: [
      { label: 'Sign Up for Free', path: '/register', icon: 'User' },
      { label: 'Explore Features', path: '/#features', icon: 'Sparkles' }
    ]
  },

  // 4. CAN SOMEONE STEAL MY WORK FROM THE HASH?
  {
    id: 'can_someone_steal_hash',
    patterns: [
      /(steal|reverse|reconstruct|extract|copy|read).*hash/i,
      /(can\s*someone|can\s*anyone|what\s*if\s*someone).*(steal|copy|take).*(work|book|manuscript|novel|story)/i,
      /(is\s*it\s*safe\s*to\s*share|safe\s*to\s*show).*(certificate|hash|token)/i
    ],
    title: 'Security & Hash Immutability',
    answer: `**No. It is mathematically impossible for anyone to reconstruct, read, or steal your manuscript from its SHA-256 hash.**

• **One-Way Function**: SHA-256 is strictly irreversible. You can calculate the hash from the file, but you *cannot* calculate the file from the hash.
• **Zero Text Leakage**: The hash reveals no words, characters, plots, or ideas.
• **Safe to Share**: You can proudly include your Certificate, Registration ID, and QR code in query letters to literary agents or publishers. It proves prior possession without exposing your text.`,
    actions: [
      { label: 'How Cryptographic Proof Works', path: '/#how-it-works', icon: 'Binary' },
      { label: 'Test Verification Engine', path: '/verify', icon: 'ShieldCheck' }
    ]
  },

  // 5. CAN PUBSEAL OR STAFF READ MY MANUSCRIPT?
  {
    id: 'can_pubseal_read_manuscript',
    patterns: [
      /(can|does)\s*(pubseal|you|staff|anyone|employees?|team)\s*(read|see|view|access|open).*(book|manuscript|file|story|draft)/i,
      /(is\s*my\s*book|is\s*my\s*file|is\s*my\s*manuscript)\s*(private|confidential|secret)/i,
      /who\s*can\s*(see|read|view|access)\s*(my\s*manuscript|my\s*file|my\s*book)/i
    ],
    title: 'Manuscript Privacy & Confidential Vault',
    answer: `**No. PubSeal does not publish, read, or share your private manuscripts.**

• **Author-Private Vault**: Uploaded manuscripts are stored in an isolated, private vault accessible only when you are logged into your account.
• **Automated Machine Hashing**: Our server only reads raw binary bytes in memory for milliseconds to calculate the SHA-256 fingerprint.
• **Zero Public Exposure**: The public verification portal only displays safe evidentiary facts (Title, Author Name, Timestamp, and SHA-256 Hash). The manuscript contents remain 100% private.`,
    actions: [
      { label: 'Author Ownership Guarantee', path: '/terms#author-ownership', icon: 'ShieldCheck' },
      { label: 'Vault Privacy Policy', path: '/terms#vault-confidentiality', icon: 'Lock' }
    ]
  },

  // 6. AI TRAINING & LLM SCRAPING
  {
    id: 'ai_training_policy',
    patterns: [
      /(train|scrape|feed|use).*(ai|llm|model|chatgpt|gpt|gemini).*(manuscript|book|writing|work)/i,
      /(is\s*my\s*work|are\s*my\s*books|is\s*my\s*writing)\s*used\s*(to\s*train|for\s*ai|for\s*training)/i
    ],
    title: 'Zero AI Training Covenant',
    answer: `**Never. PubSeal has a strict zero-AI training policy.**

• We **never** sell, license, scrape, or feed your manuscripts, drafts, or creative ideas into artificial intelligence or large language models.
• Your manuscripts remain your exclusive intellectual property, shielded in your private vault.`,
    actions: [
      { label: 'Read Vault Covenants', path: '/terms#vault-confidentiality', icon: 'Lock' }
    ]
  },

  // 7. WHO OWNS MY WORK?
  {
    id: 'who_owns_my_work',
    patterns: [
      /(who\s*owns|who\s*has\s*rights|do\s*you\s*own|do\s*i\s*keep|retain).*(rights?|copyright|ownership|ip)/i,
      /(give\s*up|transfer|assign).*(rights?|copyright|ownership)/i
    ],
    title: '100% Author Ownership Guarantee',
    answer: `**You retain 100% of your rights. PubSeal claims 0% ownership.**

• **You Own Everything**: All copyright, moral rights, trademark, publishing rights, and commercial royalties remain exclusively yours.
• **No Publishing Rights**: We do not publish, sell, or license your writing.
• **Machine-Only Permission**: You grant us only the automated permission necessary to calculate your SHA-256 hash and store your private backup.`,
    actions: [
      { label: 'Review Terms of Ownership', path: '/terms#author-ownership', icon: 'ShieldCheck' }
    ]
  },

  // 8. IS THIS OFFICIAL GOVERNMENT COPYRIGHT?
  {
    id: 'official_government_copyright',
    patterns: [
      /(is\s*this|does\s*this\s*replace|is\s*it).*(official|government|real|legal|usco|united\s*states).*(copyright|office|registration)/i,
      /(replace|substitute).*(copyright\s*office|government\s*filing|statutory)/i,
      /difference\s*between\s*pubseal\s*and\s*(copyright|government)/i
    ],
    title: 'PubSeal vs. Government Copyright Offices',
    answer: `**No. PubSeal is an independent technological evidentiary registry, NOT a government agency.**

• **What PubSeal Provides**: Tamper-evident cryptographic proof of **prior possession** and **document integrity** (NIST FIPS 180-4 SHA-256 hash & certified server timestamp).
• **Evidentiary Value**: This provides robust third-party digital evidence in priority disputes, pitch meetings, and copyright claims.
• **Statutory Copyright**: In countries like the US, statutory damages under 17 U.S.C. § 412 require filing with the official national office (USCO). We recommend using PubSeal during drafting and pitching, alongside government filings for commercial releases.`,
    actions: [
      { label: 'Read Statutory Disclaimer', path: '/terms#statutory-disclaimer', icon: 'Scale' },
      { label: 'Explore Terms & Conditions', path: '/terms', icon: 'BookOpen' }
    ]
  },

  // 9. IS THIS VALID IN COURT OR DISPUTES?
  {
    id: 'valid_in_court',
    patterns: [
      /(valid|admissible|hold\s*up|recognized|accepted|used).*in\s*(court|lawsuit|arbitration|legal\s*battle|dispute)/i,
      /(legal\s*proof|evidence\s*in\s*court|can\s*i\s*sue)/i,
      /(priority\s*dispute|someone\s*copies\s*me)/i
    ],
    title: 'Evidentiary Admissibility in Disputes',
    answer: `**Yes, cryptographic timestamped records serve as robust third-party digital evidence in legal and priority disputes.**

• **Proof of Prior Existence**: The certified ISO server timestamp and SHA-256 binary digest prove that an exact file existed in your possession on or before that date.
• **Objective Mathematics**: Unlike a self-mailed envelope ("poor man's copyright"), a cryptographic hash is verified by standard computer science mathematics (NIST FIPS 180-4).
• **Independent Verification**: Any attorney, judge, or arbitrator can independently verify the authenticity of your certificate at **/verify**.`,
    actions: [
      { label: 'Public Verification Portal', path: '/verify', icon: 'ShieldCheck' },
      { label: 'Evidentiary Framework', path: '/terms#evidentiary-nature', icon: 'Scale' }
    ]
  },

  // 10. UNFINISHED DRAFTS / WORK IN PROGRESS
  {
    id: 'unfinished_drafts',
    patterns: [
      /(unfinished|draft|in\s*progress|wip|incomplete|sample|chapter|outline|partial)/i,
      /(can\s*i\s*register|can\s*i\s*upload).*(draft|chapter|outline|sample|unfinished)/i
    ],
    title: 'Registering Unfinished Drafts & Samples',
    answer: `**Yes! You can register your work at any stage of creation.**

• Whether you have a rough outline, an opening chapter, a partial draft, or a finished novel, you can timestamp it immediately.
• When you write more chapters or polish your manuscript, you can use our **Version Control** feature to upload Version 2 or Version 3 while preserving the proof of your earlier draft!`,
    actions: [
      { label: 'Register a Draft Now', path: '/register-work', icon: 'FileCheck2' },
      { label: 'Go to Dashboard', path: '/dashboard', icon: 'Compass' }
    ]
  },

  // 11. EDITING / UPDATING AFTER REGISTRATION
  {
    id: 'editing_and_revisions',
    patterns: [
      /(edit|change|update|revise|new\s*draft|version|second\s*draft).*(after|already|later|registered|work)/i,
      /(can\s*i\s*change|how\s*to\s*update).*(manuscript|book|file|version)/i
    ],
    title: 'Editing Works & Version Control (v1, v2, v3)',
    answer: `**Yes! PubSeal supports Multi-Draft Version Control:**

1. Open your work from the **Author Dashboard**.
2. Click **'Upload New Version'**.
3. Select your updated draft (PDF, DOCX, or TXT).
4. PubSeal increments the version number (e.g. Version 2), computes a new SHA-256 hash for the revision, and issues an updated certificate while keeping all previous versions safely recorded.`,
    actions: [
      { label: 'Go to Author Dashboard', path: '/dashboard', icon: 'Compass' }
    ]
  },

  // 12. SUPPORTED FORMATS & SIZES
  {
    id: 'supported_formats',
    patterns: [
      /(what|which)\s*(formats?|files?|extensions?).*(support|upload|accept)/i,
      /(can\s*i\s*upload|accept).*(pdf|docx|word|txt|epub|mobi)/i,
      /(file\s*size|size\s*limit|how\s*big|max\s*size|mb)/i
    ],
    title: 'Supported Formats & Size Limits',
    answer: `PubSeal accepts the standard publishing industry file formats:

• **PDF** (\`.pdf\`) — Typeset manuscripts, galley proofs, papers
• **DOCX** (\`.docx\`) — Microsoft Word drafts and editor revisions
• **TXT** (\`.txt\`) — Plaintext, poetry, and screenplays
• **Maximum File Size**: Up to **50 MB** per manuscript file.

*(Executable files like .exe or .bat are blocked for security).*`,
    actions: [
      { label: 'Register Manuscript', path: '/register-work', icon: 'FileCheck2' }
    ]
  },

  // 13. HOW TO REGISTER A WORK
  {
    id: 'how_to_register',
    patterns: [
      /(how\s*(do\s*i|to)|steps?\s*to)\s*(register|upload|submit|protect).*(work|book|manuscript|novel|story|poem)/i,
      /register\s*(a\s*)?(work|manuscript|book|novel)/i
    ],
    title: 'How to Register a Manuscript',
    answer: `To register an unpublished work on PubSeal:

1. **Click 'Register Work'** in the navigation bar.
2. **Upload Your File**: Drag & drop your PDF, DOCX, or TXT file (up to 50MB).
3. **Add Details**: Enter your title, category (Novel, Poetry, Screenplay, etc.), and optional summary.
4. **Instant SHA-256 Hashing**: Our server computes the raw binary fingerprint and certified timestamp.
5. **Receive Certificate**: Download your high-resolution archival PDF Certificate with embedded QR code immediately!`,
    actions: [
      { label: 'Register a Work Now', path: '/register-work', icon: 'FileCheck2' },
      { label: 'View How It Works', path: '/#how-it-works', icon: 'BookOpen' }
    ]
  },

  // 14. HOW VERIFICATION WORKS
  {
    id: 'how_to_verify',
    patterns: [
      /(how\s*(do\s*i|to)|steps?\s*to)\s*(verify|check|validate).*(work|file|certificate|hash|token)/i,
      /(how\s*does\s*verification\s*work|verify\s*a\s*document|check\s*authenticity)/i
    ],
    title: 'How Public Verification Works',
    answer: `Anyone (publishers, agents, attorneys, or readers) can verify a work at **/verify**:

• **Method A — File Drop**: Drop the manuscript file to calculate its raw SHA-256 hash on our server. If identical to a registered work, it confirms an **EXACT CRYPTOGRAPHIC MATCH**.
• **Method B — Registration ID / Hash**: Enter the token (e.g. \`PUB-2026-XXXX\`) or paste the SHA-256 hash to view public verification details and download the certified record.
• **QR Code**: Scan the QR code on any PubSeal PDF Certificate with a smartphone camera to open the public verification ledger directly.`,
    actions: [
      { label: 'Open Public Verification', path: '/verify', icon: 'ShieldCheck' }
    ]
  },

  // 15. EMAIL OTP / SIGN-IN HELP
  {
    id: 'otp_verification_help',
    patterns: [
      /(didn'?t\s*get|not\s*receiv|missing|where\s*is|resend).*(otp|code|pin|email\s*code)/i,
      /(otp|verification\s*code|pin)\s*(problem|issue|help|not\s*working)/i,
      /(how\s*does|how\s*to).*(email\s*verification|social\s*login|google\s*login)/i
    ],
    title: 'Email Verification & OTP Assistance',
    answer: `If you haven't received your 6-digit email OTP:

1. **Check Spam / Junk Folder**: Sometimes automated emails land in Spam.
2. **Click Resend PIN**: On the verification screen, click *"Resend Code"* to dispatch a fresh 6-digit PIN.
3. **Verify Email Address**: Ensure your email was entered accurately without typos.
4. **Social Sign-In**: Alternatively, you can log in instantly with **Google** or **Facebook** for automatic verification without waiting for an OTP!`,
    actions: [
      { label: 'Go to Email Verification', path: '/verify-email', icon: 'CheckCircle2' },
      { label: 'Sign In / Social Login', path: '/login', icon: 'LogIn' }
    ]
  },

  // 16. AI READINESS SCORE
  {
    id: 'ai_readiness_score',
    patterns: [
      /(what\s*is|explain|how\s*is).*(readiness|ai\s*score|readiness\s*score|score\s*calculated)/i,
      /(improve\s*score|low\s*score|readiness\s*hygiene|filing\s*dossier)/i
    ],
    title: 'AI Copyright Readiness Score (0–100)',
    answer: `The **AI Copyright Readiness Score** evaluates your manuscript's preparation across 5 statutory pillars:

1. **Title & Front-Matter Clarity**
2. **Authorship Attribution & Chain of Custody**
3. **Document Structural Completeness**
4. **Format & Encoding Hygiene**
5. **Statutory Filing Preparedness**

• **Advisory Only**: A lower score does NOT invalidate your copyright or PubSeal timestamp; it simply highlights recommended formatting improvements before publishing.
• **Filing Dossier**: You can download a structured filing dossier from your work's details page.`,
    actions: [
      { label: 'Go to Dashboard', path: '/dashboard', icon: 'Compass' },
      { label: 'Readiness Terms Policy', path: '/terms#ai-score-disclaimer', icon: 'Scale' }
    ]
  },

  // 17. CAN I DELETE A REGISTERED WORK?
  {
    id: 'can_i_delete_work',
    patterns: [
      /(can\s*i\s*delete|how\s*to\s*delete|remove|erase|unpublish).*(work|manuscript|book|registration)/i
    ],
    title: 'Deleting or Managing Registered Works',
    answer: `• To preserve the cryptographic integrity of our tamper-evident ledger, timestamped registration entries are immutable.
• However, you have complete control over your private manuscript files in your **Author Vault**, and you can contact support at \`support@pubseal.com\` if you need assistance managing your registered records.`,
    actions: [
      { label: 'Author Dashboard', path: '/dashboard', icon: 'Compass' },
      { label: 'Terms & Inquiries', path: '/terms#amendments-contact', icon: 'BookOpen' }
    ]
  },

  // 18. DIRECT NAVIGATION: DASHBOARD
  {
    id: 'nav_dashboard',
    patterns: [
      /(go\s*to|open|take\s*me\s*to|where\s*is|show\s*me).*(dashboard|vault|my\s*works|my\s*books)/i,
      /^(dashboard|my\s*works|vault)$/i
    ],
    title: 'Author Vault & Dashboard',
    answer: `Opening your **Author Dashboard**! Here you can view all registered works, download certificates, check readiness scores, and manage revision drafts.`,
    actions: [
      { label: 'Open Author Dashboard', path: '/dashboard', icon: 'Compass' }
    ]
  },

  // 19. DIRECT NAVIGATION: REGISTER
  {
    id: 'nav_register',
    patterns: [
      /(go\s*to|open|take\s*me\s*to|where\s*is|show\s*me).*(register\s*work|upload\s*work|registration\s*page)/i,
      /^(register|upload|register\s*work)$/i
    ],
    title: 'Register Work Page',
    answer: `Here is the link to register your unpublished manuscript. Simply drop your PDF, DOCX, or TXT file to generate your SHA-256 fingerprint and certificate.`,
    actions: [
      { label: 'Go to Register Work', path: '/register-work', icon: 'FileCheck2' }
    ]
  },

  // 20. DIRECT NAVIGATION: VERIFY
  {
    id: 'nav_verify',
    patterns: [
      /(go\s*to|open|take\s*me\s*to|where\s*is|show\s*me).*(verify|verification|verification\s*page)/i,
      /^(verify|verification)$/i
    ],
    title: 'Public Integrity Verification',
    answer: `Opening the **Public Integrity Verification** page, where candidate manuscripts or registration IDs can be verified against our cryptographic ledger.`,
    actions: [
      { label: 'Open Public Verification', path: '/verify', icon: 'ShieldCheck' }
    ]
  },

  // 21. DIRECT NAVIGATION: PROFILE & SETTINGS
  {
    id: 'nav_profile',
    patterns: [
      /(go\s*to|open|take\s*me\s*to|where\s*is|show\s*me).*(profile|profile\s*page|account\s*settings|settings)/i,
      /(change|update|reset).*(password|email\s*address|display\s*name)/i,
      /^(profile|settings|my\s*profile)$/i
    ],
    title: 'Author Profile & Settings',
    answer: `Opening your **Author Profile & Settings**, where you can update your author details, view your verification status, or change your password.`,
    actions: [
      { label: 'Go to Profile Page', path: '/profile', icon: 'User' }
    ]
  },

  // 22. DIRECT NAVIGATION: TERMS & CONDITIONS
  {
    id: 'nav_terms',
    patterns: [
      /(go\s*to|open|take\s*me\s*to|where\s*is|show\s*me).*(terms|conditions|tos|terms\s*of\s*service|legal)/i,
      /^(terms|conditions|tos|legal)$/i
    ],
    title: 'Terms of Service & Legal Framework',
    answer: `Opening the official **Terms & Conditions**, including our 100% author ownership covenants, vault confidentiality, and statutory disclaimers.`,
    actions: [
      { label: 'Read Terms & Conditions', path: '/terms', icon: 'BookOpen' }
    ]
  },

  // 23. GREETINGS & CASUAL INQUIRIES
  {
    id: 'greeting',
    patterns: [
      /^(hello|hi|hey|greetings|good\s*morning|good\s*afternoon|good\s*evening)[\s!.]*$/i,
      /^(help|doubts|questions)[\s!.]*$/i
    ],
    title: null,
    answer: `Hello there! I am **Sage**, your dedicated PubSeal literary assistant and guide. ✦

I can help answer any questions or doubts you have, including:
• **Account Setup**: Do you need documents? *(No, none at all!)*
• **Registration**: How to upload manuscripts & generate SHA-256 fingerprints
• **Legal Standing**: Distinguishing cryptographic evidence from government copyright
• **Author Rights**: You retain 100% ownership at all times
• **Verification**: How to verify a certificate or candidate file in real time

What questions or doubts may I clear for you today?`,
    actions: [
      { label: 'Do I Need Documents to Sign Up?', path: '__query:do i need documents to create an account', icon: 'HelpCircle' },
      { label: 'Register a Work', path: '/register-work', icon: 'FileCheck2' },
      { label: 'Public Verification', path: '/verify', icon: 'ShieldCheck' }
    ]
  }
];

/**
 * Intelligent Query Matcher
 * 1. Checks human conversational and social intents first (gratitude, small talk, pleasantries)
 * 2. Checks technical, legal, and navigational doubts
 * 3. Falls back gracefully with friendly human-like assistance
 */
function findBestIntent(query, user, currentPath) {
  const trimmed = query.trim();

  // STEP 1: Check human social & conversational intents (gratitude, "thank you", "ok", "how are you", "bye", etc.)
  for (const human of HUMAN_CONVERSATIONAL_INTENTS) {
    for (const pattern of human.patterns) {
      if (pattern.test(trimmed)) {
        return {
          title: null, // Displays naturally without rigid formal banners
          text: human.getReply(user),
          actions: human.actions || []
        };
      }
    }
  }

  // Strip conversational prefixes for domain questions (e.g. "no..", "like", "actually", "wait", "i mean", "what about")
  const cleaned = trimmed
    .replace(/^(no|yes|well|actually|wait|i mean|like|hey|so|uh|um)\s*([.,;!?]+\s*|\s+)/i, '')
    .trim();

  // STEP 2: Check domain & platform intents
  for (const intent of SAGE_INTENTS) {
    for (const pattern of intent.patterns) {
      if (pattern.test(trimmed) || pattern.test(cleaned)) {
        let text = intent.answer;
        if (intent.id === 'greeting' && user) {
          text = `Greetings, **${user.fullName || 'Author'}**! I am **Sage**, your PubSeal literary navigator.\n\nI can help you manage your registered works, verify documents, or answer questions regarding your digital ownership certificates.\n\nWhat would you like to explore today?`;
        }
        return {
          title: intent.title,
          text,
          actions: intent.actions || []
        };
      }
    }
  }

  // STEP 3: Multi-keyword heuristic fallback
  const lower = cleaned.toLowerCase();

  if (lower.includes('document') && (lower.includes('create') || lower.includes('account') || lower.includes('sign') || lower.includes('need') || lower.includes('require'))) {
    const matched = SAGE_INTENTS.find((i) => i.id === 'account_documents_required');
    if (matched) return { title: matched.title, text: matched.answer, actions: matched.actions };
  }

  if (lower.includes('copyright') || lower.includes('usco') || lower.includes('government') || lower.includes('legal')) {
    const matched = SAGE_INTENTS.find((i) => i.id === 'official_government_copyright');
    if (matched) return { title: matched.title, text: matched.answer, actions: matched.actions };
  }

  if (lower.includes('verify') || lower.includes('check') || lower.includes('qr')) {
    const matched = SAGE_INTENTS.find((i) => i.id === 'how_to_verify');
    if (matched) return { title: matched.title, text: matched.answer, actions: matched.actions };
  }

  if (lower.includes('register') || lower.includes('upload') || lower.includes('submit')) {
    const matched = SAGE_INTENTS.find((i) => i.id === 'how_to_register');
    if (matched) return { title: matched.title, text: matched.answer, actions: matched.actions };
  }

  // STEP 4: Friendly Human Fallback
  return {
    title: null,
    text: `I want to make sure I give you a clear and helpful answer regarding *"_${query}_"*. 

Could you tell me a little more, or choose from one of these popular topics?
• **Account Setup**: You do **not** need any documents or ID to create a free account.
• **100% Ownership**: You retain full copyright and moral rights to all your writing.
• **Cryptographic Proof**: How SHA-256 binary hashing proves prior possession.
• **Public Verification**: Checking candidate files at **/verify**.`,
    actions: [
      { label: 'Register a Work', path: '/register-work', icon: 'FileCheck2' },
      { label: 'Public Verification', path: '/verify', icon: 'ShieldCheck' },
      { label: 'Terms & Disclaimers', path: '/terms', icon: 'Scale' }
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
      title: null,
      text: `Hello! I am **Sage**, your dedicated PubSeal literary assistant. ✦

Whether you're wondering what you need to create an account, how cryptographic timestamps protect your manuscript, or how verification works, I am here to provide direct and helpful answers. How can I help you today?`,
      actions: [
        { label: 'Do I Need Documents to Sign Up?', path: '__query:do i need documents to create an account', icon: 'HelpCircle' },
        { label: 'How to Register Work', path: '/register-work', icon: 'FileCheck2' },
        { label: 'Is this Official Copyright?', path: '/terms#statutory-disclaimer', icon: 'Scale' }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Quick suggestion chips
  const quickChips = [
    { label: '📄 Do I need documents to sign up?', query: 'Do I need any documents to create an account?' },
    { label: '⚖️ Is this official copyright?', query: 'Does PubSeal replace official government copyright?' },
    { label: '🔒 Who owns my manuscript?', query: 'Who owns the copyright of uploaded manuscripts?' },
    { label: '📝 How to register work', query: 'How do I register a new manuscript?' },
    { label: '🔍 How to verify', query: 'How does manuscript verification work?' },
    { label: '💰 Is it free?', query: 'How much does PubSeal cost?' },
    { label: '🖋️ Can I use a pen name?', query: 'Can I use a pen name or pseudonym?' },
    { label: '📁 Go to Dashboard', query: 'Take me to my author dashboard' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

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

    // Natural human conversational response delay (280ms)
    setTimeout(() => {
      const match = findBestIntent(text, user, location.pathname);
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
    }, 280);
  };

  const handleActionClick = (path) => {
    if (path.startsWith('__query:')) {
      const q = path.replace('__query:', '');
      handleSendMessage(q);
      return;
    }

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

    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'sage',
        title: null,
        text: `Conversation refreshed! How may I assist you today, ${user ? user.fullName : 'Author'}?`,
        actions: [
          { label: 'Do I Need Documents to Sign Up?', path: '__query:do i need documents to create an account', icon: 'HelpCircle' },
          { label: 'Register a Work', path: '/register-work', icon: 'FileCheck2' },
          { label: 'Public Verification', path: '/verify', icon: 'ShieldCheck' }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end select-none">
      {/* 1. GREETING SPEECH BUBBLE TOAST (When collapsed) */}
      {!isOpen && showToast && (
        <div className="mb-3 animate-fade-in flex items-center space-x-2.5 p-3 sm:p-3.5 rounded-2xl bg-mocha-900/95 border border-gold-500/40 shadow-mocha-deep text-xs text-mocha-100 max-w-[270px] sm:max-w-xs backdrop-blur-md">
          <div className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-400/40 flex items-center justify-center p-1.5 text-gold-300 shrink-0 overflow-hidden shadow-inner-gold">
            <img
              src="/PubSeal_logo_gold_tight.png"
              alt="PubSeal Angel"
              className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(203,159,84,0.6)]"
            />
          </div>
          <div className="flex-1 pr-1">
            <p className="font-serif font-bold text-gold-300 text-[11px] uppercase tracking-wider">
              Meet Sage • Platform Guide
            </p>
            <p className="text-[11px] text-mocha-300 leading-snug mt-0.5">
              Have doubts about documents or registration? Ask Sage!
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
        <div className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[420px] h-[590px] max-h-[82vh] rounded-3xl bg-mocha-950/95 border border-mocha-700/80 shadow-2xl shadow-black/80 flex flex-col overflow-hidden backdrop-blur-xl animate-fade-in">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-mocha-900 via-mocha-900/95 to-mocha-950 border-b border-mocha-800/90 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gold-500/20 via-mocha-900 to-mocha-950 border border-gold-500/40 flex items-center justify-center p-1.5 shadow-sm overflow-hidden">
                  <img
                    src="/PubSeal_logo_gold_tight.png"
                    alt="Sage PubSeal Angel Crest"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(203,159,84,0.6)]"
                  />
                </div>
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
                  <span className="truncate max-w-[150px] text-mocha-400/80">
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
                  {/* Title if present (for technical/legal knowledge items) */}
                  {msg.title && (
                    <div className="font-serif font-bold text-gold-300 text-xs pb-1 mb-1.5 border-b border-mocha-800/80 flex items-center space-x-1.5">
                      <img
                        src="/PubSeal_logo_gold_tight.png"
                        alt="Angel"
                        className="w-3.5 h-3.5 object-contain shrink-0 filter drop-shadow-[0_0_4px_rgba(203,159,84,0.5)]"
                      />
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
                <img
                  src="/PubSeal_logo_gold_tight.png"
                  alt="Sage Angel"
                  className="w-4 h-4 object-contain animate-bounce"
                />
                <span className="text-[11px] font-mono text-gold-300/80">
                  Sage is typing...
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

      {/* 3. FLOATING TRIGGER BUTTON */}
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
        {!isOpen && (
          <span className="absolute inset-0 rounded-2xl bg-gold-500/20 animate-ping opacity-30 pointer-events-none" />
        )}

        {isOpen ? (
          <X className="w-6 h-6 transition-transform group-hover:rotate-90 text-gold-300" />
        ) : (
          <div className="relative flex items-center justify-center">
            <img
              src="/PubSeal_logo_gold_tight.png"
              alt="PubSeal Angel"
              className="w-9 h-9 object-contain filter drop-shadow-[0_0_10px_rgba(203,159,84,0.75)] group-hover:scale-110 transition-transform duration-300"
            />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-mocha-950" />
          </div>
        )}
      </button>
    </div>
  );
};

export default SageChatbot;
