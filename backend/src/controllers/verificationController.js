const fs = require('fs');
const Work = require('../models/Work');
const VerificationLog = require('../models/VerificationLog');
const AuditLog = require('../models/AuditLog');
const { calculateFileHash } = require('../services/hashService');

// @desc    Verify an uploaded document against the cryptographic registry
// @route   POST /api/verification/check
// @access  Public / Optional Auth
const verifyFile = async (req, res, next) => {
  let uploadedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a file to verify.',
      });
    }

    uploadedFilePath = req.file.path;

    // Authoritatively calculate SHA-256 from raw uploaded bytes
    const calculatedHash = await calculateFileHash(uploadedFilePath);

    // Promptly remove temporary verification file to keep disk space and privacy clean
    if (fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
        uploadedFilePath = null;
      } catch (err) {
        console.warn('Could not remove temporary verification file:', err);
      }
    }

    // Search for registered work with exact matching SHA-256 hash (in current or historical versions)
    const matchingWork = await Work.findOne({
      $or: [
        { sha256Hash: calculatedHash },
        { 'versions.sha256Hash': calculatedHash },
      ],
      status: 'registered',
    }).sort({ registeredAt: -1 });

    if (matchingWork) {
      // Increment verification audit counter
      matchingWork.verificationCount = (matchingWork.verificationCount || 0) + 1;
      matchingWork.lastVerifiedAt = new Date();
      await matchingWork.save();

      let matchedVersion = null;
      if (matchingWork.versions && matchingWork.versions.length > 0) {
        matchedVersion = matchingWork.versions.find((v) => v.sha256Hash === calculatedHash);
      }

      const versionNumber = matchedVersion ? matchedVersion.versionNumber : (matchingWork.currentVersion || 1);
      const isLatest = versionNumber === (matchingWork.currentVersion || 1);
      const originalFilename = matchedVersion ? matchedVersion.originalFilename : matchingWork.originalFilename;
      const registeredAt = matchedVersion ? matchedVersion.registeredAt : matchingWork.registeredAt;
      const changeNotes = matchedVersion?.changeNotes || '';

      // Persist verification audit log to MongoDB Database
      const logId = 'VERIFY-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      await VerificationLog.create({
        logId,
        verificationType: 'file_upload',
        searchedHash: calculatedHash,
        resultStatus: isLatest ? 'EXACT_MATCH' : 'HISTORICAL_VERSION_MATCH',
        matchedWorkId: matchingWork._id,
        matchedRegistrationId: matchingWork.registrationId,
        matchedTitle: matchingWork.title,
        matchedAuthor: matchingWork.authorName,
        matchedVersion: versionNumber,
        isLatestVersion: isLatest,
        ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'] || '',
      }).catch((vErr) => console.warn('[PubSeal DB] Verification log error:', vErr.message));

      await AuditLog.create({
        action: 'VERIFICATION_PERFORMED',
        entityType: 'Verification',
        entityId: logId,
        userId: req.user?._id || null,
        details: {
          resultStatus: isLatest ? 'EXACT_MATCH' : 'HISTORICAL_VERSION_MATCH',
          registrationId: matchingWork.registrationId,
          versionNumber,
          hash: calculatedHash,
        },
      }).catch(() => null);

      return res.status(200).json({
        success: true,
        match: true,
        result: 'EXACT_MATCH',
        calculatedHash,
        version: {
          versionNumber,
          isLatest,
          changeNotes,
        },
        work: {
          registrationId: matchingWork.registrationId,
          title: matchingWork.title,
          authorName: matchingWork.authorName,
          category: matchingWork.category,
          registeredAt,
          sha256Hash: calculatedHash,
          originalFilename,
          currentVersion: matchingWork.currentVersion || 1,
          totalVersions: matchingWork.versions?.length || 1,
        },
        message: isLatest
          ? `Exact Cryptographic Match! The uploaded file is bit-for-bit identical to Version ${versionNumber} (Latest).`
          : `Exact Cryptographic Match! The uploaded file is bit-for-bit identical to Version ${versionNumber} (Historical revision; current latest is Version ${matchingWork.currentVersion || 1}).`,
      });
    } else {
      // Record NO_MATCH verification check in Database
      const logId = 'VERIFY-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      await VerificationLog.create({
        logId,
        verificationType: 'file_upload',
        searchedHash: calculatedHash,
        resultStatus: 'NO_MATCH',
        ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'] || '',
      }).catch(() => null);

      return res.status(200).json({
        success: true,
        match: false,
        result: 'NO_MATCH',
        calculatedHash,
        message: 'No matching record was found in the PubSeal registry for this digital fingerprint.',
        explanation:
          'Even a single changed punctuation mark, whitespace, formatting variation, or byte revision will produce a completely different SHA-256 hash.',
      });
    }
  } catch (error) {
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch (e) {}
    }
    next(error);
  }
};

// @desc    Verify by Registration ID or SHA-256 Hash query
// @route   GET /api/verification/lookup
// @access  Public
const lookupHashOrId = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a Registration ID (PUB-...) or 64-character SHA-256 hash.',
      });
    }

    const cleanQuery = query.trim();

    const work = await Work.findOne({
      $or: [
        { registrationId: cleanQuery.toUpperCase() },
        { sha256Hash: cleanQuery.toLowerCase() },
        { 'versions.sha256Hash': cleanQuery.toLowerCase() },
      ],
      status: 'registered',
    });

    if (!work) {
      return res.status(200).json({
        success: true,
        found: false,
        message: 'No record matching the provided Registration ID or SHA-256 hash was found.',
      });
    }

    // Determine if the query matched a specific version
    let matchedVersionNumber = work.currentVersion || 1;
    if (work.versions && work.versions.length > 0) {
      const v = work.versions.find((ver) => ver.sha256Hash === cleanQuery.toLowerCase());
      if (v) matchedVersionNumber = v.versionNumber;
    }

    // Persist lookup audit in Database
    const logId = 'VERIFY-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    await VerificationLog.create({
      logId,
      verificationType: cleanQuery.startsWith('PUB-') ? 'token_lookup' : 'hash_lookup',
      searchedQuery: cleanQuery,
      searchedHash: cleanQuery.length === 64 ? cleanQuery.toLowerCase() : null,
      resultStatus: 'EXACT_MATCH',
      matchedWorkId: work._id,
      matchedRegistrationId: work.registrationId,
      matchedTitle: work.title,
      matchedAuthor: work.authorName,
      matchedVersion: matchedVersionNumber,
      ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
    }).catch(() => null);

    res.status(200).json({
      success: true,
      found: true,
      work: {
        registrationId: work.registrationId,
        title: work.title,
        authorName: work.authorName,
        category: work.category,
        registeredAt: work.registeredAt,
        sha256Hash: work.sha256Hash,
        originalFilename: work.originalFilename,
        currentVersion: work.currentVersion || 1,
        matchedVersionNumber,
        versions: (work.versions && work.versions.length > 0)
          ? work.versions.map((v) => ({
              versionNumber: v.versionNumber,
              originalFilename: v.originalFilename,
              fileSize: v.fileSize,
              sha256Hash: v.sha256Hash,
              changeNotes: v.changeNotes,
              registeredAt: v.registeredAt,
              isLatest: v.versionNumber === (work.currentVersion || 1),
            }))
          : [
              {
                versionNumber: 1,
                originalFilename: work.originalFilename,
                fileSize: work.fileSize,
                sha256Hash: work.sha256Hash,
                changeNotes: 'Initial registration',
                registeredAt: work.registeredAt,
                isLatest: true,
              },
            ],
      },
      message: 'Verified Registration Record Found.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyFile,
  lookupHashOrId,
};
