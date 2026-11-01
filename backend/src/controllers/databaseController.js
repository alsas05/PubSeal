const mongoose = require('mongoose');
const Work = require('../models/Work');
const Certificate = require('../models/Certificate');
const VerificationLog = require('../models/VerificationLog');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

// Helper: Collection model dictionary
const MODELS = {
  works: Work,
  certificates: Certificate,
  verifications: VerificationLog,
  audits: AuditLog,
  users: User,
};

// @desc    Get real-time database architecture, health, and collection metrics
// @route   GET /api/database/overview
// @access  Private
const getDatabaseOverview = async (req, res, next) => {
  try {
    const db = mongoose.connection.db;
    const isConnected = mongoose.connection.readyState === 1;

    let dbStats = {
      db: mongoose.connection.name || 'pubseal',
      collections: 0,
      objects: 0,
      avgObjSize: 0,
      dataSize: 0,
      storageSize: 0,
      indexes: 0,
    };

    let serverStatus = {
      version: 'Unknown',
      uptime: 0,
    };

    if (isConnected && db) {
      try {
        const stats = await db.stats();
        dbStats = {
          db: stats.db,
          collections: stats.collections,
          objects: stats.objects,
          avgObjSize: stats.avgObjSize || 0,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize,
          indexes: stats.indexes,
        };

        const adminDb = mongoose.connection.client.db('admin');
        const buildInfo = await adminDb.command({ buildInfo: 1 }).catch(() => null);
        if (buildInfo) {
          serverStatus.version = buildInfo.version;
        }
      } catch (statsErr) {
        console.warn('[PubSeal DB] Native stats check fallback:', statsErr.message);
      }
    }

    // Precise collection counts
    const [
      worksCount,
      certificatesCount,
      verificationsCount,
      auditsCount,
      usersCount,
    ] = await Promise.all([
      Work.countDocuments(),
      Certificate.countDocuments(),
      VerificationLog.countDocuments(),
      AuditLog.countDocuments(),
      User.countDocuments(),
    ]);

    // Calculate total versions across all works
    const versionsAgg = await Work.aggregate([
      { $unwind: '$versions' },
      { $count: 'totalVersions' },
    ]);
    const totalVersions = versionsAgg.length > 0 ? versionsAgg[0].totalVersions : worksCount;

    // Fetch recent database audit events
    const recentAuditLogs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(8)
      .lean();

    res.status(200).json({
      success: true,
      database: {
        engine: 'MongoDB',
        status: isConnected ? 'Online (Connected)' : 'Offline',
        host: mongoose.connection.host || '127.0.0.1',
        port: mongoose.connection.port || 27017,
        name: mongoose.connection.name || 'pubseal',
        serverVersion: serverStatus.version,
        metrics: {
          totalCollections: Object.keys(MODELS).length,
          totalDocuments: worksCount + certificatesCount + verificationsCount + auditsCount + usersCount,
          totalStorageBytes: dbStats.storageSize || 0,
          avgDocumentSizeBytes: Math.round(dbStats.avgObjSize || 0),
        },
        collections: [
          {
            name: 'works',
            label: 'Literary Works & Manuscripts',
            description: 'Core registered creative works, metadata, SHA-256 digests, and version arrays',
            documentCount: worksCount,
            subDocuments: { label: 'Revisions in History', count: totalVersions },
          },
          {
            name: 'certificates',
            label: 'Cryptographic Certificates',
            description: 'Official serialized archival certificates with digital seals and QR verification payloads',
            documentCount: certificatesCount,
          },
          {
            name: 'verifications',
            label: 'Verification & Integrity Logs',
            description: 'Immutable ledger of all file upload checks, token lookups, and match determinations',
            documentCount: verificationsCount,
          },
          {
            name: 'audits',
            label: 'System Audit Ledger',
            description: 'High-fidelity audit log recording all database mutations, uploads, and security events',
            documentCount: auditsCount,
          },
          {
            name: 'users',
            label: 'Author Accounts & Vaults',
            description: 'Registered authors, credentials, bios, and vault ownership anchors',
            documentCount: usersCount,
          },
        ],
        recentEvents: recentAuditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get paginated records from a specific collection with search & filter
// @route   GET /api/database/collections/:name
// @access  Private
const getCollectionRecords = async (req, res, next) => {
  try {
    const { name } = req.params;
    const model = MODELS[name.toLowerCase()];

    if (!model) {
      return res.status(404).json({
        success: false,
        message: `Collection "${name}" not found. Supported: ${Object.keys(MODELS).join(', ')}`,
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 15));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();

    const query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      if (name === 'works') {
        query.$or = [
          { title: searchRegex },
          { authorName: searchRegex },
          { registrationId: searchRegex },
          { sha256Hash: searchRegex },
          { category: searchRegex },
        ];
      } else if (name === 'certificates') {
        query.$or = [
          { certificateNumber: searchRegex },
          { registrationId: searchRegex },
          { title: searchRegex },
          { authorName: searchRegex },
          { sha256Hash: searchRegex },
        ];
      } else if (name === 'verifications') {
        query.$or = [
          { logId: searchRegex },
          { matchedRegistrationId: searchRegex },
          { searchedHash: searchRegex },
          { matchedTitle: searchRegex },
          { resultStatus: searchRegex },
        ];
      } else if (name === 'audits') {
        query.$or = [
          { action: searchRegex },
          { entityType: searchRegex },
          { entityId: searchRegex },
          { userEmail: searchRegex },
        ];
      } else if (name === 'users') {
        query.$or = [{ name: searchRegex }, { email: searchRegex }];
      }
    }

    // Dynamic column sorting
    const requestedSortBy = (req.query.sortBy || '').trim();
    const defaultSortField = name === 'audits' ? 'timestamp' : name === 'verifications' ? 'verifiedAt' : 'createdAt';
    const sortBy = /^[a-zA-Z0-9_.]+$/.test(requestedSortBy) ? requestedSortBy : defaultSortField;
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const sortCriteria = { [sortBy]: sortOrder };
    if (sortBy !== '_id') {
      sortCriteria._id = -1;
    }

    const [total, records] = await Promise.all([
      model.countDocuments(query),
      model
        .find(query)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // Redact passwordHash on users if queried
    if (name === 'users') {
      records.forEach((u) => {
        delete u.passwordHash;
      });
    }

    res.status(200).json({
      success: true,
      collection: name,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export a collection as JSON or CSV
// @route   GET /api/database/export/:name
// @access  Private
const exportCollection = async (req, res, next) => {
  try {
    const { name } = req.params;
    const model = MODELS[name.toLowerCase()];

    if (!model) {
      return res.status(404).json({
        success: false,
        message: `Collection "${name}" not found.`,
      });
    }

    const format = (req.query.format || 'json').toLowerCase();
    const records = await model.find().sort({ createdAt: -1 }).lean();

    if (name === 'users') {
      records.forEach((u) => delete u.passwordHash);
    }

    if (format === 'csv') {
      if (records.length === 0) {
        res.setHeader('Content-Type', 'text/csv');
        return res.send('No records found');
      }

      const flatRecords = records.map((r) => {
        const flat = {};
        for (const [k, v] of Object.entries(r)) {
          if (typeof v === 'object' && v !== null && !(v instanceof Date)) {
            flat[k] = JSON.stringify(v);
          } else {
            flat[k] = v;
          }
        }
        return flat;
      });

      const headers = Object.keys(flatRecords[0]);
      const csvRows = [headers.join(',')];

      for (const row of flatRecords) {
        const values = headers.map((h) => {
          const val = row[h] !== undefined ? String(row[h]) : '';
          return `"${val.replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="pubseal-${name}-${Date.now()}.csv"`
      );
      return res.send(csvRows.join('\n'));
    }

    // Default: JSON export
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="pubseal-${name}-${Date.now()}.json"`
    );
    return res.send(JSON.stringify(records, null, 2));
  } catch (error) {
    next(error);
  }
};

// @desc    Export complete full database snapshot
// @route   GET /api/database/export-all
// @access  Private
const exportFullDatabase = async (req, res, next) => {
  try {
    const [works, certificates, verifications, audits, users] = await Promise.all([
      Work.find().lean(),
      Certificate.find().lean(),
      VerificationLog.find().lean(),
      AuditLog.find().lean(),
      User.find().select('-passwordHash').lean(),
    ]);

    const backupPayload = {
      database: 'pubseal',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      exportedBy: req.user?.email || 'admin',
      summary: {
        worksCount: works.length,
        certificatesCount: certificates.length,
        verificationsCount: verifications.length,
        auditsCount: audits.length,
        usersCount: users.length,
      },
      collections: {
        works,
        certificates,
        verifications,
        audits,
        users,
      },
    };

    // Log the backup export
    const validUserId =
      req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id) ? req.user._id : null;
    await AuditLog.create({
      action: 'DATABASE_BACKUP_EXPORTED',
      entityType: 'Database',
      entityId: 'pubseal-full-backup',
      userId: validUserId,
      userEmail: req.user?.email || 'admin@pubseal.internal',
      details: backupPayload.summary,
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="pubseal-full-database-backup-${Date.now()}.json"`
    );
    return res.send(JSON.stringify(backupPayload, null, 2));
  } catch (error) {
    next(error);
  }
};

// @desc    Seed / synchronize database records if needed
// @route   POST /api/database/sync-certificates
// @access  Private
const syncCertificates = async (req, res, next) => {
  try {
    const works = await Work.find({ status: 'registered' });
    let createdCount = 0;

    for (const work of works) {
      // Create Certificate for each version if not exists
      const versions = (work.versions && work.versions.length > 0) ? work.versions : [
        {
          versionNumber: 1,
          sha256Hash: work.sha256Hash,
          originalFilename: work.originalFilename,
          registeredAt: work.registeredAt,
        }
      ];

      for (const ver of versions) {
        const certNumber = `CERT-${work.registrationId}-V${ver.versionNumber}`;
        const existing = await Certificate.findOne({ certificateNumber: certNumber });
        if (!existing) {
          const isLatest = ver.versionNumber === (work.currentVersion || 1);
          await Certificate.create({
            certificateNumber: certNumber,
            workId: work._id,
            registrationId: work.registrationId,
            versionNumber: ver.versionNumber,
            title: work.title,
            authorName: work.authorName,
            category: work.category,
            sha256Hash: ver.sha256Hash,
            status: isLatest ? 'active' : 'superseded',
            verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${work.registrationId}`,
            issuedAt: ver.registeredAt || work.registeredAt,
          });
          createdCount++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Database synchronization complete. ${createdCount} missing certificates created.`,
      synchronizedCount: createdCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get real-time database analytics and chart aggregations
// @route   GET /api/database/analytics
// @access  Private (Admin only)
const getDatabaseAnalytics = async (req, res, next) => {
  try {
    const [works, users, certificates, verifications, audits] = await Promise.all([
      Work.find().lean(),
      User.find().select('-passwordHash').lean(),
      Certificate.find().lean(),
      VerificationLog.find().lean(),
      AuditLog.find().lean(),
    ]);

    // 1. Category Distribution
    const categoryCounts = {};
    works.forEach((w) => {
      const cat = w.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const categoryDistribution = Object.entries(categoryCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: works.length > 0 ? Math.round((count / works.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 2. Registration Trend over Time (Daily)
    const timelineMap = {};
    works.forEach((w) => {
      const dateKey = new Date(w.createdAt || w.registeredAt).toISOString().split('T')[0];
      timelineMap[dateKey] = (timelineMap[dateKey] || 0) + 1;
    });
    const registrationTimeline = Object.entries(timelineMap)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 3. AI Copyright Readiness Score Metrics
    const scores = works
      .map((w) => w.copyrightReadiness?.score)
      .filter((s) => typeof s === 'number');
    const avgScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const readinessTiers = {
      exceptional: works.filter((w) => (w.copyrightReadiness?.score || 0) >= 85).length,
      strong: works.filter(
        (w) =>
          (w.copyrightReadiness?.score || 0) >= 70 && (w.copyrightReadiness?.score || 0) < 85
      ).length,
      moderate: works.filter(
        (w) =>
          (w.copyrightReadiness?.score || 0) >= 50 && (w.copyrightReadiness?.score || 0) < 70
      ).length,
      needsWork: works.filter((w) => (w.copyrightReadiness?.score || 0) < 50).length,
    };

    // 4. File Formats & MIME types
    const formatCounts = {};
    let totalStorageBytes = 0;
    works.forEach((w) => {
      let ext = 'TXT';
      if (w.originalFilename && w.originalFilename.includes('.')) {
        ext = w.originalFilename.split('.').pop().toUpperCase();
      } else if (w.mimeType) {
        if (w.mimeType.includes('pdf')) ext = 'PDF';
        else if (w.mimeType.includes('word') || w.mimeType.includes('officedocument')) ext = 'DOCX';
        else if (w.mimeType.includes('text')) ext = 'TXT';
      }
      formatCounts[ext] = (formatCounts[ext] || 0) + 1;
      totalStorageBytes += w.fileSizeBytes || 0;
    });
    const formatDistribution = Object.entries(formatCounts)
      .map(([format, count]) => ({
        format,
        count,
        percentage: works.length > 0 ? Math.round((count / works.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 5. Versioning Activity & Revision Depth
    const singleVersionWorks = works.filter(
      (w) => (w.versions?.length || w.currentVersion || 1) === 1
    ).length;
    const multiVersionWorks = works.filter(
      (w) => (w.versions?.length || w.currentVersion || 1) > 1
    ).length;
    const totalVersionsCount = works.reduce(
      (sum, w) => sum + (w.versions?.length || w.currentVersion || 1),
      0
    );
    const avgVersionsPerWork =
      works.length > 0 ? parseFloat((totalVersionsCount / works.length).toFixed(1)) : 1;

    // 6. Verification Ledger Performance
    const verificationCounts = {
      exactMatch: verifications.filter((v) => v.resultStatus === 'EXACT_MATCH').length,
      versionMatch: verifications.filter((v) => v.resultStatus === 'HISTORICAL_VERSION_MATCH')
        .length,
      noMatch: verifications.filter((v) => v.resultStatus === 'NO_MATCH').length,
    };
    const totalVerifications = verifications.length;
    const verificationSuccessRate =
      totalVerifications > 0
        ? Math.round(
            ((verificationCounts.exactMatch + verificationCounts.versionMatch) /
              totalVerifications) *
              100
          )
        : 100;

    // 7. Audit Trail Velocity
    const auditActionCounts = {};
    audits.forEach((a) => {
      auditActionCounts[a.action] = (auditActionCounts[a.action] || 0) + 1;
    });
    const auditVelocity = Object.entries(auditActionCounts)
      .map(([action, count]) => ({
        action,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // 8. User Metrics
    const userMetrics = {
      totalUsers: users.length,
      authorsWithWorks: new Set(works.map((w) => w.userId?.toString()).filter(Boolean)).size,
      avgWorksPerAuthor:
        users.length > 0 ? parseFloat((works.length / users.length).toFixed(1)) : 0,
    };

    res.status(200).json({
      success: true,
      analytics: {
        summary: {
          totalWorks: works.length,
          totalUsers: users.length,
          totalCertificates: certificates.length,
          totalVerifications: verifications.length,
          totalAudits: audits.length,
          totalStorageBytes,
          avgReadinessScore: avgScore,
          verificationSuccessRate,
          totalVersionsCount,
          avgVersionsPerWork,
        },
        categoryDistribution,
        registrationTimeline,
        readinessMetrics: {
          avgScore,
          tiers: readinessTiers,
          distribution: works.map((w) => ({
            title: w.title,
            score: w.copyrightReadiness?.score || 0,
            grade: w.copyrightReadiness?.grade || 'Standard',
          })),
        },
        formatDistribution,
        versionMetrics: {
          singleVersionWorks,
          multiVersionWorks,
          totalVersionsCount,
          avgVersionsPerWork,
        },
        verificationMetrics: {
          totalVerifications,
          successRate: verificationSuccessRate,
          breakdown: verificationCounts,
        },
        auditVelocity,
        userMetrics,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDatabaseOverview,
  getDatabaseAnalytics,
  getCollectionRecords,
  exportCollection,
  exportFullDatabase,
  syncCertificates,
};

