const Work = require('../models/Work');
const { generateCertificateBuffer } = require('../services/certificateService');

// @desc    Get certificate data / preview
// @route   GET /api/works/:id/certificate
// @access  Private / Public lookup
const getCertificateData = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check by Mongo ID or Registration ID
    let work = null;
    if (id.startsWith('PUB-')) {
      work = await Work.findOne({ registrationId: id, status: 'registered' });
    } else {
      work = await Work.findOne({ _id: id, status: 'registered' });
    }

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Registration certificate record not found.',
      });
    }

    let certificateWork = work.toObject ? work.toObject() : { ...work };
    let versionLabel = `Version ${work.currentVersion || 1}`;

    if (req.query.version) {
      const verNum = parseInt(req.query.version, 10);
      if (work.versions && work.versions.length > 0) {
        const verObj = work.versions.find((v) => v.versionNumber === verNum);
        if (verObj) {
          certificateWork.versionNumber = verObj.versionNumber;
          certificateWork.originalFilename = verObj.originalFilename;
          certificateWork.sha256Hash = verObj.sha256Hash;
          certificateWork.registeredAt = verObj.registeredAt;
          certificateWork.fileSize = verObj.fileSize;
          certificateWork.changeNotes = verObj.changeNotes;
          versionLabel = `Version ${verObj.versionNumber}${verObj.versionNumber === work.currentVersion ? ' (Latest)' : ''}`;
        }
      }
    } else {
      certificateWork.versionNumber = work.currentVersion || 1;
      versionLabel = `Version ${work.currentVersion || 1} (Latest)`;
    }

    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendBaseUrl}/verify?token=${work.registrationId}`;

    res.status(200).json({
      success: true,
      certificate: {
        registrationId: work.registrationId,
        title: work.title,
        authorName: work.authorName,
        category: work.category,
        registeredAt: certificateWork.registeredAt,
        sha256Hash: certificateWork.sha256Hash,
        originalFilename: certificateWork.originalFilename,
        versionNumber: certificateWork.versionNumber,
        versionLabel,
        verificationUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate & download official PDF certificate
// @route   GET /api/works/:id/certificate/download
// @access  Public / Private
const downloadCertificatePdf = async (req, res, next) => {
  try {
    const { id } = req.params;

    let work = null;
    if (id.startsWith('PUB-')) {
      work = await Work.findOne({ registrationId: id, status: 'registered' });
    } else {
      work = await Work.findOne({ _id: id, status: 'registered' });
    }

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found for certificate generation.',
      });
    }

    let certificateWork = work.toObject ? work.toObject() : { ...work };

    if (req.query.version) {
      const verNum = parseInt(req.query.version, 10);
      if (work.versions && work.versions.length > 0) {
        const verObj = work.versions.find((v) => v.versionNumber === verNum);
        if (verObj) {
          certificateWork.versionNumber = verObj.versionNumber;
          certificateWork.originalFilename = verObj.originalFilename;
          certificateWork.sha256Hash = verObj.sha256Hash;
          certificateWork.registeredAt = verObj.registeredAt;
          certificateWork.fileSize = verObj.fileSize;
          certificateWork.changeNotes = verObj.changeNotes;
        }
      }
    } else {
      certificateWork.versionNumber = work.currentVersion || 1;
    }

    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendBaseUrl}/verify?token=${work.registrationId}`;

    const pdfBuffer = await generateCertificateBuffer(certificateWork, verificationUrl);

    const safeFilename = `PubSeal-Certificate-${work.registrationId}-v${certificateWork.versionNumber || 1}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeFilename}"`
    );

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCertificateData,
  downloadCertificatePdf,
};

