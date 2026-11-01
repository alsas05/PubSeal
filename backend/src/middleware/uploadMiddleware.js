const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Allowed extensions and mimetypes for creative literary works
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniquePrefix = `work-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    cb(null, `${uniquePrefix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new Error(`Unsupported file type '${ext}'. Only PDF, DOCX, and TXT files are accepted for registration.`),
      false
    );
  }

  // Accept file
  cb(null, true);
};

// Multer configuration with no file size restriction
const upload = multer({
  storage,
  fileFilter,
});

module.exports = {
  upload,
  uploadsDir,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
};

