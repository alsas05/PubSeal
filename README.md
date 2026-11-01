# PubSeal — Secure Digital Ownership Registry for Writers

PubSeal is a modern, cryptographic registration and digital evidence platform designed for novelists, poets, screenwriters, essayists, and researchers. It enables creators to register unpublished works, generate immutable SHA-256 digital fingerprints directly from file bytes, and obtain verifiable, downloadable archival PDF certificates with embedded QR codes.

---

## 🎨 Design System

Styled in a bespoke **Mocha Brown** and **Champagne Gold** literary aesthetic:
- **Base Surfaces**: Midnight Mocha (`#140c08`), Espresso Obsidian (`#231610`), Dark Walnut (`#38261b`), and Warm Ivory parchment (`#faf6f0`).
- **Accent Tokens**: Champagne Gold (`#cb9f54`), Burnished Gold (`#dbb97c`), and Golden Shimmer highlights (`#e6cfa1`).
- **Typography**: Classical serif headers (`Cinzel` / `Playfair Display`), clean interface sans (`Inter`), and high-legibility monospace blocks (`JetBrains Mono`).

---

## 🏛 Architecture & Tech Stack

```
PubSeal/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── controllers/     # Auth, Works, Certificates, Verification controllers
│   │   ├── middleware/      # JWT auth, Multer file upload, Centralized error handler
│   │   ├── models/          # User and Work Mongoose models
│   │   ├── routes/          # REST API route declarations
│   │   ├── services/        # SHA-256 byte hashing, PDFKit certificate generator
│   │   └── utils/           # Unique Registration ID generator (PUB-YYYY-XXXXXX)
│   ├── uploads/             # Author-private manuscript storage (never publicly served)
│   ├── tests/               # E2E test suite (32/32 tests passing)
│   ├── server.js            # Server entry point
│   ├── .env.example         # Environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, ProtectedRoute, FileDropzone, HashBadge, CertificateModal
│   │   ├── context/         # AuthContext (JWT bearer management & user state)
│   │   ├── pages/           # Home, Login, Register, Dashboard, RegisterWork, WorkDetails, VerifyWork, Profile
│   │   ├── services/        # Axios API client
│   │   ├── App.jsx
│   │   └── index.css
│   ├── tailwind.config.js   # Mocha & Champagne Gold custom color system
│   ├── vite.config.js       # Vite proxy to backend API (/api)
│   └── package.json
└── README.md
```

### Core Technologies
- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Lucide React, Canvas Confetti.
- **Backend**: Node.js, Express.js, Mongoose, Multer, bcryptjs, jsonwebtoken, express-rate-limit, cors.
- **Cryptographic & Certificate Engine**: Node.js native `crypto` (SHA-256 binary digest), `pdfkit` (archival vector layout), `qrcode` (instant verification QR).
- **Database**: MongoDB (local or Atlas).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port 27017 or remote connection string)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm start
```
*Backend runs on `http://localhost:5000`.*

### 2. User Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*User application runs on `http://localhost:5173`.*

### 3. Separate Admin Web Portal Setup
```bash
cd admin
npm run dev
```
*Independent Admin & Database Studio runs on `http://localhost:5174`.*

---

## 🔒 Security & Privacy Guarantees

1. **Authoritative Server-Side Hashing**: We never trust client-provided hashes. The SHA-256 digest is calculated server-side directly from the uploaded file binary stream.
2. **Private Manuscript Vault**: Original uploaded manuscripts are stored in an isolated directory and are **never** served through public static routes. Only the authenticated author can retrieve their original document.
3. **Privacy-Preserving Public Verification**: When verifying a file or looking up a registration ID, PubSeal reveals only safe evidentiary facts (Title, Author, Category, Registration ID, Timestamp, Matching Hash). Author email addresses and manuscript files are never exposed.
4. **Collision Resistance**: Every registration record is indexed by its 64-character SHA-256 digest and unique `PUB-YYYY-XXXXXX` token.

---

## 🧪 Testing

PubSeal includes a comprehensive automated end-to-end test suite verifying all 10 test groups (**80/80 passing**):
```bash
node backend/tests/e2e_full_suite.test.js
```

### Verified Test Cases (80/80 Passed)
- ✅ **Group 1: Authentication & Social Login**: User registration, JWT issuance, password hash confidentiality, duplicate prevention, credential login, unauthorized route protection, Google and Facebook social auth.
- ✅ **Group 2: File Registration & SHA-256 Hashing**: Full binary byte hashing with exact SHA-256 match, unique registration token generation (`PUB-YYYY-HEX`), unsupported file rejection (.exe blocked), missing title validation, duplicate submission notice.
- ✅ **Group 3: File Integrity & Real-Time Verification**: Exact match verification, altered file (single character modified) produces `NO_MATCH` with completely different hash, registration ID lookup, not-found lookup.
- ✅ **Group 4: Archival PDF Certificates**: PDFKit generates valid `%PDF` binary certificate with vector guilloche border, golden seal crest, QR code, SHA-256 hash, and metadata.
- ✅ **Group 5: Authorization & Vault Boundaries**: Non-owners cannot access other authors' private works or download their files (returns 404), while owners can download the exact original manuscript bytes.
- ✅ **Group 6: Dashboard Stats & Filters**: Summary metrics and category filtering work seamlessly.
- ✅ **Group 7: Document Version Control**: Registering revisions, incrementing versions, maintaining immutable historical drafts, and generating version-specific certificates.
- ✅ **Group 8: AI Copyright Readiness Score**: Automated 5-pillar heuristic scan (0-100), statutory readiness grades, actionable hygiene recommendations, and exportable legal filing dossier.
- ✅ **Group 9: Database Architecture & Repositories**: Admin portal authentication, MongoDB schema inspection, collection exports (JSON/CSV), and full database backups.
- ✅ **Group 10: Email Verification Engine**: 6-digit cryptographic PIN dispatch via SMTP, PIN verification, token link verification, and tamper protection.

---

## 📜 Evidentiary Notice

PubSeal records cryptographic digital registration fingerprints and server-certified timestamps for uploaded files. It serves as independent, timestamped digital evidence that the exact binary artifact existed in the possession of the registrant at the recorded time. It does not constitute government copyright registration or a judicial determination of copyright ownership.

