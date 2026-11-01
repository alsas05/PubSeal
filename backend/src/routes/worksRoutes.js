const express = require('express');
const router = express.Router();
const {
  createWork,
  getWorks,
  getWorkStats,
  getWorkById,
  createWorkVersion,
  downloadOriginalFile,
  deleteWork,
} = require('../controllers/worksController');
const {
  getCertificateData,
  downloadCertificatePdf,
} = require('../controllers/certificateController');
const {
  getReadiness,
  evaluateReadiness,
  getFilingDossier,
} = require('../controllers/readinessController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Work CRUD endpoints
router.post('/', protect, upload.single('file'), createWork);
router.get('/', protect, getWorks);
router.get('/stats', protect, getWorkStats);
router.get('/:id', protect, getWorkById);
router.post('/:id/versions', protect, upload.single('file'), createWorkVersion);
router.get('/:id/file', protect, downloadOriginalFile);
router.delete('/:id', protect, deleteWork);

// AI Copyright Readiness sub-endpoints
router.get('/:id/readiness', protect, getReadiness);
router.post('/:id/readiness', protect, evaluateReadiness);
router.get('/:id/readiness/dossier', protect, getFilingDossier);

// Certificate sub-endpoints
router.get('/:id/certificate', getCertificateData);
router.get('/:id/certificate/download', downloadCertificatePdf);

module.exports = router;

