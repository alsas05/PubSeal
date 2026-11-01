const path = require('path');
const fs = require('fs');
const Work = require('../models/Work');
const Certificate = require('../models/Certificate');
const AuditLog = require('../models/AuditLog');
const { calculateFileHash } = require('../services/hashService');
const { generateRegistrationId } = require('../utils/idGenerator');
const { uploadsDir } = require('../middleware/uploadMiddleware');
const { evaluateCopyrightReadiness } = require('../services/copyrightReadinessService');

// @desc    Register a new creative work & compute SHA-256 fingerprint
// @route   POST /api/works
// @access  Private
const createWork = async (req, res, next) => {
  let uploadedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach a creative work file (.pdf, .docx, or .txt).',
      });
    }

    uploadedFilePath = req.file.path;
    const {
      title,
      category,
      description,
      authorName,
      yearCompleted,
      publicationStatus,
      natureOfAuthorship,
      isPseudonymous,
      pseudonym,
      isWorkMadeForHire,
      humanAuthorshipCertified,
      aiContentDisclosed,
      aiDisclosureDetails,
      preexistingMaterialExcluded,
    } = req.body;

    // Validate inputs
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Work title is required.' });
    }

    if (!category || !Work.CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Valid category is required. Supported: ${Work.CATEGORIES.join(', ')}`,
      });
    }

    const effectiveAuthor = (authorName && authorName.trim()) || req.user.name;

    // Calculate authoritative SHA-256 hash directly from file bytes on disk
    const sha256Hash = await calculateFileHash(uploadedFilePath);

    // Check if user has already registered this exact file
    const existingWorkBySameUser = await Work.findOne({
      ownerId: req.user._id,
      sha256Hash,
      status: 'registered',
    });

    let duplicateNotice = null;
    if (existingWorkBySameUser) {
      duplicateNotice = `Note: You previously registered this exact digital file as "${existingWorkBySameUser.title}" (${existingWorkBySameUser.registrationId}). A new distinct registration token has been generated.`;
    }

    // Generate unique Registration ID
    let registrationId = generateRegistrationId();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      const existing = await Work.findOne({ registrationId });
      if (!existing) {
        isUnique = true;
      } else {
        registrationId = generateRegistrationId();
        attempts++;
      }
    }

    const initialVersion = {
      versionNumber: 1,
      originalFilename: req.file.originalname,
      storedFilename: req.file.filename,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      sha256Hash,
      changeNotes: 'Initial registered manuscript',
      registeredAt: new Date(),
    };

    // Save work record to MongoDB
    const work = await Work.create({
      ownerId: req.user._id,
      registrationId,
      title: title.trim(),
      category,
      description: description ? description.trim() : '',
      authorName: effectiveAuthor,
      originalFilename: req.file.originalname,
      storedFilename: req.file.filename,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      sha256Hash,
      registeredAt: new Date(),
      certificateGenerated: true,
      status: 'registered',
      currentVersion: 1,
      versions: [initialVersion],
      yearCompleted: yearCompleted ? Number(yearCompleted) : new Date().getFullYear(),
      publicationStatus: publicationStatus || 'unpublished',
      natureOfAuthorship: natureOfAuthorship ? natureOfAuthorship.trim() : 'Entire text',
      isPseudonymous: isPseudonymous === 'true' || isPseudonymous === true,
      pseudonym: pseudonym ? pseudonym.trim() : '',
      isWorkMadeForHire: isWorkMadeForHire === 'true' || isWorkMadeForHire === true,
      humanAuthorshipCertified: humanAuthorshipCertified !== 'false' && humanAuthorshipCertified !== false,
      aiContentDisclosed: aiContentDisclosed === 'true' || aiContentDisclosed === true,
      aiDisclosureDetails: aiDisclosureDetails ? aiDisclosureDetails.trim() : '',
      preexistingMaterialExcluded: preexistingMaterialExcluded ? preexistingMaterialExcluded.trim() : '',
    });

    // Compute baseline AI Copyright Readiness Score
    try {
      const readiness = await evaluateCopyrightReadiness(work, {
        yearCompleted: work.yearCompleted,
        publicationStatus: work.publicationStatus,
        natureOfAuthorship: work.natureOfAuthorship,
        isPseudonymous: work.isPseudonymous,
        pseudonym: work.pseudonym,
        isWorkMadeForHire: work.isWorkMadeForHire,
        humanAuthorshipCertified: work.humanAuthorshipCertified,
        aiContentDisclosed: work.aiContentDisclosed,
        aiDisclosureDetails: work.aiDisclosureDetails,
        preexistingMaterialExcluded: work.preexistingMaterialExcluded,
      });
      work.copyrightReadiness = readiness;
      await work.save();
    } catch (evalErr) {
      console.warn('[PubSeal] Initial copyright readiness eval skipped:', evalErr.message);
    }

    // Persist official Certificate document to Database
    const certNumber = `CERT-${work.registrationId}-V1`;
    await Certificate.create({
      certificateNumber: certNumber,
      workId: work._id,
      registrationId: work.registrationId,
      versionNumber: 1,
      title: work.title,
      authorName: work.authorName,
      category: work.category,
      sha256Hash: work.sha256Hash,
      status: 'active',
      verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${work.registrationId}`,
    }).catch((certErr) => console.warn('[PubSeal DB] Auto certificate record error:', certErr.message));

    // Persist Audit Log entry to Database
    await AuditLog.create({
      action: 'WORK_REGISTERED',
      entityType: 'Work',
      entityId: work.registrationId,
      userId: req.user._id,
      userEmail: req.user.email,
      details: {
        title: work.title,
        category: work.category,
        sha256Hash: work.sha256Hash,
        version: 1,
      },
    }).catch((auditErr) => console.warn('[PubSeal DB] Auto audit log error:', auditErr.message));

    res.status(201).json({
      success: true,
      message: 'Creative work successfully registered and cryptographically fingerprinted.',
      duplicateNotice,
      work,
    });
  } catch (error) {
    // If saving fails, cleanly remove the uploaded file to prevent orphan files
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch (cleanupErr) {
        console.error('Failed to remove orphaned upload file:', cleanupErr);
      }
    }
    next(error);
  }
};

// @desc    Get all registered works for the authenticated user (with search, filter, pagination)
// @route   GET /api/works
// @access  Private
const getWorks = async (req, res, next) => {
  try {
    const { category, search, sort = 'registeredAt_desc', page = 1, limit = 10 } = req.query;

    const query = {
      ownerId: req.user._id,
      status: 'registered',
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { authorName: searchRegex },
        { registrationId: searchRegex },
        { sha256Hash: searchRegex },
      ];
    }

    // Sorting
    let sortOption = { registeredAt: -1 };
    if (sort === 'registeredAt_asc') sortOption = { registeredAt: 1 };
    else if (sort === 'title_asc') sortOption = { title: 1 };
    else if (sort === 'title_desc') sortOption = { title: -1 };
    else if (sort === 'size_desc') sortOption = { fileSize: -1 };
    else if (sort === 'size_asc') sortOption = { fileSize: 1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [totalWorks, works] = await Promise.all([
      Work.countDocuments(query),
      Work.find(query).sort(sortOption).skip(skip).limit(limitNum),
    ]);

    const totalPages = Math.ceil(totalWorks / limitNum) || 1;

    const formattedWorks = works.map((w) => {
      const obj = w.toObject ? w.toObject() : { ...w };
      if (!obj.versions || obj.versions.length === 0) {
        obj.versions = [
          {
            versionNumber: 1,
            originalFilename: obj.originalFilename,
            storedFilename: obj.storedFilename,
            mimeType: obj.mimeType,
            fileSize: obj.fileSize,
            sha256Hash: obj.sha256Hash,
            changeNotes: 'Initial registration',
            registeredAt: obj.registeredAt,
          },
        ];
        obj.currentVersion = 1;
      }
      return obj;
    });

    res.status(200).json({
      success: true,
      works: formattedWorks,
      pagination: {
        total: totalWorks,
        page: pageNum,
        limit: limitNum,
        pages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for authenticated user
// @route   GET /api/works/stats
// @access  Private
const getWorkStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [totalWorks, recentRegistrations, categoriesAgg] = await Promise.all([
      Work.countDocuments({ ownerId: userId, status: 'registered' }),
      // Works registered in the last 30 days
      Work.countDocuments({
        ownerId: userId,
        status: 'registered',
        registeredAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
      // Breakdown by category
      Work.aggregate([
        { $match: { ownerId: userId, status: 'registered' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    // Total verification count
    const verificationAgg = await Work.aggregate([
      { $match: { ownerId: userId, status: 'registered' } },
      { $group: { _id: null, totalVerifications: { $sum: '$verificationCount' } } },
    ]);

    const totalVerifications = verificationAgg.length > 0 ? verificationAgg[0].totalVerifications : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalWorks,
        recentRegistrations,
        totalVerifications,
        categories: categoriesAgg.map((c) => ({ category: c._id, count: c.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single work details by ID
// @route   GET /api/works/:id
// @access  Private
const getWorkById = async (req, res, next) => {
  try {
    const work = await Work.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
      status: 'registered',
    });

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Registered work not found or unauthorized access.',
      });
    }

    const workObj = work.toObject();
    if (!workObj.versions || workObj.versions.length === 0) {
      workObj.versions = [
        {
          versionNumber: 1,
          originalFilename: work.originalFilename,
          storedFilename: work.storedFilename,
          mimeType: work.mimeType,
          fileSize: work.fileSize,
          sha256Hash: work.sha256Hash,
          changeNotes: 'Initial registration',
          registeredAt: work.registeredAt,
        },
      ];
      workObj.currentVersion = 1;
    }

    // Auto-evaluate copyright readiness if not yet evaluated
    if (!work.copyrightReadiness || work.copyrightReadiness.score === null) {
      try {
        const readiness = await evaluateCopyrightReadiness(work);
        work.copyrightReadiness = readiness;
        await work.save();
        workObj.copyrightReadiness = readiness;
      } catch (evalErr) {
        console.warn('[PubSeal] Auto readiness eval failed in getWorkById:', evalErr.message);
      }
    }

    res.status(200).json({
      success: true,
      work: workObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new version / revision for an existing creative work
// @route   POST /api/works/:id/versions
// @access  Private (Owner only)
const createWorkVersion = async (req, res, next) => {
  let uploadedFilePath = null;
  try {
    const work = await Work.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
      status: 'registered',
    });

    if (!work) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {}
      }
      return res.status(404).json({
        success: false,
        message: 'Registered work not found or unauthorized access.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach the new manuscript version file (.pdf, .docx, or .txt).',
      });
    }

    uploadedFilePath = req.file.path;
    const { changeNotes } = req.body;

    // Calculate authoritative SHA-256 for the new version file
    const sha256Hash = await calculateFileHash(uploadedFilePath);

    // Initialize versions array if legacy document
    if (!work.versions || work.versions.length === 0) {
      work.versions = [
        {
          versionNumber: 1,
          originalFilename: work.originalFilename,
          storedFilename: work.storedFilename,
          mimeType: work.mimeType,
          fileSize: work.fileSize,
          sha256Hash: work.sha256Hash,
          changeNotes: 'Initial registration',
          registeredAt: work.registeredAt,
        },
      ];
    }

    // Check if this exact hash is already in this work's version history
    const existingVer = work.versions.find((v) => v.sha256Hash === sha256Hash);
    let duplicateNotice = null;
    if (existingVer) {
      duplicateNotice = `Notice: This file binary is identical to Version ${existingVer.versionNumber}. A new version entry has still been created with an updated timestamp.`;
    }

    const nextVersionNumber = (work.versions[work.versions.length - 1]?.versionNumber || work.versions.length) + 1;

    const newVersion = {
      versionNumber: nextVersionNumber,
      originalFilename: req.file.originalname,
      storedFilename: req.file.filename,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      sha256Hash,
      changeNotes: (changeNotes && changeNotes.trim()) || `Revision v${nextVersionNumber}`,
      registeredAt: new Date(),
    };

    work.versions.push(newVersion);
    work.currentVersion = nextVersionNumber;
    // Update top-level latest file details
    work.originalFilename = newVersion.originalFilename;
    work.storedFilename = newVersion.storedFilename;
    work.mimeType = newVersion.mimeType;
    work.fileSize = newVersion.fileSize;
    work.sha256Hash = newVersion.sha256Hash;

    await work.save();

    // Re-evaluate copyright readiness for the newly uploaded version
    try {
      const newReadiness = await evaluateCopyrightReadiness(work, {
        versionNumber: nextVersionNumber,
      });
      work.copyrightReadiness = newReadiness;
      await work.save();
    } catch (evalErr) {
      console.warn('[PubSeal] Version copyright readiness eval skipped:', evalErr.message);
    }

    // Persist new version certificate and supersede prior active ones in Database
    const newCertNumber = `CERT-${work.registrationId}-V${nextVersionNumber}`;
    await Certificate.updateMany(
      { workId: work._id, status: 'active' },
      { status: 'superseded' }
    ).catch(() => null);

    await Certificate.create({
      certificateNumber: newCertNumber,
      workId: work._id,
      registrationId: work.registrationId,
      versionNumber: nextVersionNumber,
      title: work.title,
      authorName: work.authorName,
      category: work.category,
      sha256Hash: newVersion.sha256Hash,
      status: 'active',
      verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${work.registrationId}`,
    }).catch((cErr) => console.warn('[PubSeal DB] Version certificate creation error:', cErr.message));

    await AuditLog.create({
      action: 'VERSION_COMMITTED',
      entityType: 'WorkVersion',
      entityId: `${work.registrationId}-V${nextVersionNumber}`,
      userId: req.user._id,
      userEmail: req.user.email,
      details: {
        title: work.title,
        version: nextVersionNumber,
        sha256Hash: newVersion.sha256Hash,
        changeNotes: newVersion.changeNotes,
      },
    }).catch((aErr) => console.warn('[PubSeal DB] Version audit log error:', aErr.message));

    res.status(201).json({
      success: true,
      message: `Version ${nextVersionNumber} successfully registered and cryptographically fingerprinted.`,
      duplicateNotice,
      work,
      newVersion,
    });
  } catch (error) {
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch (cleanupErr) {
        console.error('Failed to remove orphaned upload file:', cleanupErr);
      }
    }
    next(error);
  }
};

// @desc    Download original uploaded creative work file (Owner only, with version support)
// @route   GET /api/works/:id/file
// @access  Private
const downloadOriginalFile = async (req, res, next) => {
  try {
    const work = await Work.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'File not found or unauthorized access.',
      });
    }

    let targetFilename = work.storedFilename;
    let downloadName = work.originalFilename;
    let mimeType = work.mimeType;

    // Check if a specific version was requested
    if (req.query.version) {
      const verNum = parseInt(req.query.version, 10);
      if (work.versions && work.versions.length > 0) {
        const verObj = work.versions.find((v) => v.versionNumber === verNum);
        if (verObj) {
          targetFilename = verObj.storedFilename;
          downloadName = verObj.originalFilename;
          mimeType = verObj.mimeType;
        }
      }
    }

    const filePath = path.join(uploadsDir, targetFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'The physical file record is missing from vault storage.',
      });
    }

    // Set secure download headers
    res.setHeader('Content-Type', mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(downloadName)}"`
    );

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Archive or delete registered work (Soft delete)
// @route   DELETE /api/works/:id
// @access  Private
const deleteWork = async (req, res, next) => {
  try {
    const work = await Work.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Registered work not found.',
      });
    }

    // Mark as archived to preserve cryptographic audit trail, but hide from active dashboard
    work.status = 'archived';
    await work.save();

    res.status(200).json({
      success: true,
      message: 'Work archived successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWork,
  getWorks,
  getWorkStats,
  getWorkById,
  createWorkVersion,
  downloadOriginalFile,
  deleteWork,
};

