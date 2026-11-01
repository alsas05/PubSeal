const express = require('express');
const router = express.Router();
const {
  getDatabaseOverview,
  getDatabaseAnalytics,
  getCollectionRecords,
  exportCollection,
  exportFullDatabase,
  syncCertificates,
} = require('../controllers/databaseController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// All database management routes are strictly restricted to Admin & Developers only
router.use(protect, requireAdmin);

// Database Overview & Stats
router.get('/overview', getDatabaseOverview);

// Database Aggregated Analytics & Charts
router.get('/analytics', getDatabaseAnalytics);

// Full Database Export Backup
router.get('/export-all', exportFullDatabase);

// Collection Records Browser (with search, pagination, sort)
router.get('/collections/:name', getCollectionRecords);

// Collection Export (JSON or CSV)
router.get('/export/:name', exportCollection);

// Sync / Seed missing certificate documents from works
router.post('/sync-certificates', syncCertificates);

module.exports = router;

