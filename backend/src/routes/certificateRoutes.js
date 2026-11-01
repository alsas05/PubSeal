const express = require('express');
const router = express.Router();
const {
  getCertificateData,
  downloadCertificatePdf,
} = require('../controllers/certificateController');

router.get('/:id', getCertificateData);
router.get('/:id/download', downloadCertificatePdf);

module.exports = router;

