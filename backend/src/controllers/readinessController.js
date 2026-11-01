const Work = require('../models/Work');
const { evaluateCopyrightReadiness } = require('../services/copyrightReadinessService');

// @desc    Get AI Copyright Readiness Score & Evaluation for a work
// @route   GET /api/works/:id/readiness
// @access  Private (Owner only)
const getReadiness = async (req, res, next) => {
  try {
    const work = await Work.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
      status: 'registered',
    });

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work record not found in your vault.',
      });
    }

    const forceRecompute = req.query.force === 'true';

    // If already evaluated and not forced, return cached evaluation
    if (work.copyrightReadiness && work.copyrightReadiness.score !== null && !forceRecompute) {
      return res.status(200).json({
        success: true,
        readiness: work.copyrightReadiness,
      });
    }

    // Otherwise compute initial readiness
    const readinessResult = await evaluateCopyrightReadiness(work, {
      versionNumber: work.currentVersion || 1,
    });

    work.copyrightReadiness = readinessResult;
    await work.save();

    return res.status(200).json({
      success: true,
      readiness: work.copyrightReadiness,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger AI Copyright Readiness evaluation / update filing metadata
// @route   POST /api/works/:id/readiness
// @access  Private (Owner only)
const evaluateReadiness = async (req, res, next) => {
  try {
    const work = await Work.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
      status: 'registered',
    });

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work record not found in your vault.',
      });
    }

    const {
      yearCompleted,
      publicationStatus,
      dateOfPublication,
      nationOfPublication,
      natureOfAuthorship,
      isPseudonymous,
      pseudonym,
      isWorkMadeForHire,
      humanAuthorshipCertified,
      aiContentDisclosed,
      aiDisclosureDetails,
      preexistingMaterialExcluded,
      versionNumber,
    } = req.body;

    // Apply any metadata updates to the work document
    if (yearCompleted !== undefined) work.yearCompleted = Number(yearCompleted);
    if (publicationStatus !== undefined) work.publicationStatus = publicationStatus;
    if (dateOfPublication !== undefined) work.dateOfPublication = dateOfPublication;
    if (nationOfPublication !== undefined) work.nationOfPublication = nationOfPublication;
    if (natureOfAuthorship !== undefined) work.natureOfAuthorship = natureOfAuthorship;
    if (isPseudonymous !== undefined) work.isPseudonymous = Boolean(isPseudonymous);
    if (pseudonym !== undefined) work.pseudonym = pseudonym;
    if (isWorkMadeForHire !== undefined) work.isWorkMadeForHire = Boolean(isWorkMadeForHire);
    if (humanAuthorshipCertified !== undefined) work.humanAuthorshipCertified = Boolean(humanAuthorshipCertified);
    if (aiContentDisclosed !== undefined) work.aiContentDisclosed = Boolean(aiContentDisclosed);
    if (aiDisclosureDetails !== undefined) work.aiDisclosureDetails = aiDisclosureDetails;
    if (preexistingMaterialExcluded !== undefined) work.preexistingMaterialExcluded = preexistingMaterialExcluded;

    // Run evaluation with the updated inputs
    const targetVersion = versionNumber ? Number(versionNumber) : (work.currentVersion || 1);
    const readinessResult = await evaluateCopyrightReadiness(work, {
      ...req.body,
      versionNumber: targetVersion,
    });

    work.copyrightReadiness = readinessResult;
    await work.save();

    return res.status(200).json({
      success: true,
      message: 'Copyright readiness re-evaluated successfully.',
      readiness: work.copyrightReadiness,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download or get formal Copyright Filing Dossier (Form TX / eCO format)
// @route   GET /api/works/:id/readiness/dossier
// @access  Private (Owner only)
const getFilingDossier = async (req, res, next) => {
  try {
    const work = await Work.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
      status: 'registered',
    });

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work record not found in your vault.',
      });
    }

    if (!work.copyrightReadiness || work.copyrightReadiness.score === null) {
      const readinessResult = await evaluateCopyrightReadiness(work);
      work.copyrightReadiness = readinessResult;
      await work.save();
    }

    const dossier = work.copyrightReadiness.filingDossier;

    // Optional text file download
    if (req.query.format === 'txt') {
      const textOutput = `================================================================================
PUBSEAL FORMAL COPYRIGHT REGISTRATION DOSSIER
Statutory Preparation Sheet for U.S. Copyright Office (eCO Form TX) / National Registries
================================================================================

1. TITLE OF WORK
--------------------------------------------------------------------------------
Title:                    ${dossier.workTitle}
Alternative Titles:       ${dossier.alternativeTitles}
Nature of Work:           ${dossier.natureOfWork}

2. COMPLETION & PUBLICATION
--------------------------------------------------------------------------------
Year of Completion:       ${dossier.yearCompleted || 'Not Specified'}
Publication Status:       ${dossier.publicationStatus}
Date of 1st Publication:  ${dossier.dateOfPublication}
Nation of 1st Publication:${dossier.nationOfPublication}

3. AUTHOR & CLAIMANT INFORMATION
--------------------------------------------------------------------------------
Name of Author:           ${dossier.authorName}
Nature of Authorship:     ${dossier.natureOfAuthorship}
Pseudonymous Work:        ${dossier.isPseudonymous ? `Yes (Pseudonym: "${dossier.pseudonym}")` : 'No'}
Work Made for Hire:       ${dossier.isWorkMadeForHire ? 'Yes' : 'No'}
Human Authorship:         ${dossier.humanAuthorshipCertified ? 'Certified Human Author' : 'Uncertified'}

4. AI DISCLOSURE & LIMITATION OF CLAIM (USCO 2023 Guidelines)
--------------------------------------------------------------------------------
AI Material Statement:    ${dossier.aiDisclosureStatement}
Material Excluded:        ${dossier.materialExcluded}

5. DEPOSIT COPY & STATUTORY NOTICE RECOMMENDATIONS
--------------------------------------------------------------------------------
Recommended Format:       ${dossier.recommendedDepositFormat}

Statutory Notice to Insert on Title / Colophon Page:
${dossier.formattedStatutoryNotice}

6. CRYPTOGRAPHIC EVIDENCE ANCHOR (PUBSEAL REGISTRY)
--------------------------------------------------------------------------------
${dossier.pubsealEvidenceTrail}

================================================================================
Generated by PubSeal AI Copyright Readiness System.
PubSeal provides cryptographic proof of existence and binary integrity.
This dossier prepares you for formal statutory filing with governmental copyright authorities.
================================================================================
`;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="PubSeal-Copyright-Dossier-${work.registrationId}.txt"`
      );
      return res.send(textOutput);
    }

    return res.status(200).json({
      success: true,
      dossier,
      readiness: {
        score: work.copyrightReadiness.score,
        grade: work.copyrightReadiness.grade,
        evaluatedAt: work.copyrightReadiness.evaluatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReadiness,
  evaluateReadiness,
  getFilingDossier,
};

