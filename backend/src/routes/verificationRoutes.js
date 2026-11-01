const express = require('express');
const router = express.Router();
const {
  verifyFile,
  lookupHashOrId,
} = require('../controllers/verificationController');
const { upload } = require('../middleware/uploadMiddleware');

// Public file verification
router.post('/check', upload.single('file'), verifyFile);

// Public query lookup by registrationId or SHA-256 hash
router.get('/lookup', lookupHashOrId);

module.exports = router;

