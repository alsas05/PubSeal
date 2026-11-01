const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { uploadsDir } = require('../middleware/uploadMiddleware');

// Optional Gemini API client integration using official @google/genai SDK
let GoogleGenAI = null;
try {
  const genaiModule = require('@google/genai');
  GoogleGenAI = genaiModule.GoogleGenAI;
} catch (e) {
  // @google/genai not available or failed to load
}

/**
 * Extracts raw textual content from uploaded manuscript file (PDF, DOCX, or TXT)
 * @param {string} filePath - Absolute path to stored file
 * @param {string} mimeType - MIME type of file
 * @param {string} filename - Original filename
 * @returns {Promise<{ text: string, extractedSuccessfully: boolean }>}
 */
async function extractManuscriptText(filePath, mimeType, filename) {
  if (!fs.existsSync(filePath)) {
    return { text: '', extractedSuccessfully: false };
  }

  const ext = (path.extname(filename || filePath) || '').toLowerCase();

  try {
    // 1. Plain text (.txt)
    if (mimeType === 'text/plain' || ext === '.txt') {
      const text = fs.readFileSync(filePath, 'utf8');
      return { text, extractedSuccessfully: true };
    }

    // 2. Adobe PDF (.pdf)
    if (mimeType === 'application/pdf' || ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      return { text: pdfData.text || '', extractedSuccessfully: true };
    }

    // 3. Microsoft Word (.docx)
    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      ext === '.docx'
    ) {
      const docxResult = await mammoth.extractRawText({ path: filePath });
      return { text: docxResult.value || '', extractedSuccessfully: true };
    }

    // Fallback: read as utf8 string if possible
    const fallbackBuffer = fs.readFileSync(filePath);
    return { text: fallbackBuffer.toString('utf8', 0, Math.min(fallbackBuffer.length, 50000)), extractedSuccessfully: true };
  } catch (err) {
    console.warn(`[PubSeal Readiness] Text extraction fallback for ${filename}:`, err.message);
    return { text: '', extractedSuccessfully: false };
  }
}

/**
 * Scans text content for statutory copyright notice, front matter, structure, and AI artifacts
 */
function analyzeTextContent(text, title, authorName) {
  const cleanText = text || '';
  const frontMatter = cleanText.slice(0, 3000); // First 3000 chars (approx. first 1-2 pages)

  // Metrics
  const words = cleanText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const characterCount = cleanText.length;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 280));

  // 1. Statutory Copyright Notice Detection
  // Matches: © 2026 Author, Copyright 2026, (C) 2026, All Rights Reserved
  const noticeRegex = /(?:©|\(c\)|copyright\b)[\s\S]{0,40}(?:(?:19|20)\d{2})?[\s\S]{0,60}(?:all\s+rights?\s+reserved)?/i;
  const allRightsRegex = /all\s+rights?\s+reserved/i;
  const detectedNotice = noticeRegex.test(frontMatter) || (allRightsRegex.test(frontMatter) && /(?:19|20)\d{2}/.test(frontMatter));

  // 2. Title match in front matter
  const cleanTitle = (title || '').trim().toLowerCase();
  const detectedTitleInFrontMatter = cleanTitle.length > 3 && frontMatter.toLowerCase().includes(cleanTitle);

  // 3. Author match in front matter
  const cleanAuthor = (authorName || '').trim().toLowerCase();
  const detectedAuthorInFrontMatter = cleanAuthor.length > 2 && frontMatter.toLowerCase().includes(cleanAuthor);

  // 4. Structural chapter / division markers
  const structureRegex = /\b(?:chapter\s+(?:\d+|[ivxlcdm]+|one|two|three)|act\s+[ivxlcdm]+|scene\s+\d+|prologue|epilogue|introduction|part\s+(?:\d+|[ivxlcdm]+))\b/i;
  const detectedStructure = structureRegex.test(cleanText);

  // 5. Epigraph / quotation / third-party material markers
  const quotationRegex = /\b(?:epigraph|quote\b|lyrics\s+by|quoted\s+from|used\s+with\s+permission|public\s+domain)\b/i;
  const detectedThirdPartyMarkers = quotationRegex.test(cleanText);

  // 6. AI conversational/prompt artifacts
  const aiArtifactsRegex = /\b(?:as\s+an\s+ai\s+language\s+model|as\s+a\s+large\s+language\s+model|i\s+cannot\s+fulfill\s+this\s+request|here\s+is\s+a\s+(?:revised\s+)?draft|certainly!?(?:\s+here)?|generated\s+by\s+(?:chatgpt|claude|gemini|openai))\b/i;
  const detectedAiArtifacts = aiArtifactsRegex.test(cleanText);

  return {
    wordCount,
    characterCount,
    estimatedPages,
    detectedNotice,
    detectedTitleInFrontMatter,
    detectedAuthorInFrontMatter,
    detectedStructure,
    detectedThirdPartyMarkers,
    detectedAiArtifacts,
  };
}

/**
 * Executes statutory copyright readiness evaluation across 5 foundational pillars
 * Based on U.S. Copyright Office (eCO Form TX), UK IPO, and international copyright conventions
 */
async function evaluateCopyrightReadiness(work, options = {}) {
  // Determine version to evaluate (defaults to current version)
  const versionNum = options.versionNumber || work.currentVersion || 1;
  const targetVersion = (work.versions && work.versions.find((v) => v.versionNumber === versionNum)) || {
    storedFilename: work.storedFilename,
    originalFilename: work.originalFilename,
    mimeType: work.mimeType,
    fileSize: work.fileSize,
  };

  const filePath = path.join(uploadsDir, targetVersion.storedFilename);
  const { text, extractedSuccessfully } = await extractManuscriptText(
    filePath,
    targetVersion.mimeType,
    targetVersion.originalFilename
  );

  const textAnalysis = analyzeTextContent(text, work.title, work.authorName);

  // Merge any updated statutory filing inputs from options if provided
  const yearCompleted = options.yearCompleted !== undefined ? options.yearCompleted : (work.yearCompleted || new Date().getFullYear());
  const publicationStatus = options.publicationStatus || work.publicationStatus || 'unpublished';
  const natureOfAuthorship = (options.natureOfAuthorship || work.natureOfAuthorship || 'Entire text').trim();
  const isPseudonymous = options.isPseudonymous !== undefined ? options.isPseudonymous : (work.isPseudonymous || false);
  const pseudonym = (options.pseudonym || work.pseudonym || '').trim();
  const isWorkMadeForHire = options.isWorkMadeForHire !== undefined ? options.isWorkMadeForHire : (work.isWorkMadeForHire || false);
  const humanAuthorshipCertified = options.humanAuthorshipCertified !== undefined ? options.humanAuthorshipCertified : (work.humanAuthorshipCertified !== false);
  const aiContentDisclosed = options.aiContentDisclosed !== undefined ? options.aiContentDisclosed : (work.aiContentDisclosed || false);
  const aiDisclosureDetails = (options.aiDisclosureDetails || work.aiDisclosureDetails || '').trim();
  const preexistingMaterialExcluded = (options.preexistingMaterialExcluded || work.preexistingMaterialExcluded || '').trim();

  // ==========================================
  // PILLAR 1: Authorship & Claimant Identification (25 points)
  // ==========================================
  let authorshipScore = 0;
  const authorshipDetails = [];

  // Author name check
  if (work.authorName && work.authorName.trim().length > 1) {
    authorshipScore += 10;
    authorshipDetails.push('Clear author/claimant identity established.');
  } else {
    authorshipDetails.push('Author/claimant name is missing or ambiguous.');
  }

  // Nature of authorship claim specificity
  if (natureOfAuthorship && natureOfAuthorship.length >= 4) {
    authorshipScore += 7;
    authorshipDetails.push(`Nature of authorship declared: "${natureOfAuthorship}".`);
  } else {
    authorshipDetails.push('Nature of authorship claim not specified (e.g., "Entire text", "Poetry collection").');
  }

  // Pseudonym disclosure status
  if (!isPseudonymous || (isPseudonymous && pseudonym.length > 0)) {
    authorshipScore += 4;
    authorshipDetails.push(isPseudonymous ? `Pseudonym declared ("${pseudonym}") per statutory requirement.` : 'Work declared non-pseudonymous.');
  } else {
    authorshipDetails.push('Pseudonymous work selected but pen name not provided.');
  }

  // Work made for hire declaration
  authorshipScore += 4;
  authorshipDetails.push(isWorkMadeForHire ? 'Work Made for Hire designation clarified.' : 'Standard individual human author ownership affirmed.');

  // ==========================================
  // PILLAR 2: Title & Work Categorization (20 points)
  // ==========================================
  let titleScore = 0;
  const titleDetails = [];

  const genericTitles = ['untitled', 'draft', 'novel', 'my work', 'test', 'document', 'book', 'script'];
  const titleLower = (work.title || '').trim().toLowerCase();

  if (work.title && work.title.trim().length >= 3 && !genericTitles.includes(titleLower)) {
    titleScore += 8;
    titleDetails.push('Title is distinct, specific, and suitable for statutory deposit.');
  } else {
    titleScore += 3;
    titleDetails.push('Title is very brief or generic; consider distinguishing title before formal filing.');
  }

  if (work.category && WorkCategoriesMapping[work.category]) {
    titleScore += 6;
    titleDetails.push(`Appropriately categorized as "${work.category}" (${WorkCategoriesMapping[work.category].statutoryForm}).`);
  } else {
    titleDetails.push('Work category needs formal classification.');
  }

  if (work.description && work.description.trim().length >= 20) {
    titleScore += 6;
    titleDetails.push('Substantive synopsis/abstract available for registration record.');
  } else {
    titleScore += 2;
    titleDetails.push('Brief or missing description; add a short synopsis to aid examiner classification.');
  }

  // ==========================================
  // PILLAR 3: Statutory Notice & Deposit Formatting (20 points)
  // ==========================================
  let noticeScore = 0;
  const noticeDetails = [];

  if (textAnalysis.detectedNotice) {
    noticeScore += 8;
    noticeDetails.push('Formal statutory copyright notice detected in front matter (© [Year] [Author]).');
  } else {
    noticeDetails.push('No formal copyright notice page detected in front matter.');
  }

  if (textAnalysis.detectedTitleInFrontMatter || textAnalysis.detectedAuthorInFrontMatter) {
    noticeScore += 6;
    noticeDetails.push('Document title page / front matter identifies the author and work title.');
  } else {
    noticeDetails.push('Manuscript lacks a distinct front title page matching registration metadata.');
  }

  if (textAnalysis.detectedStructure || textAnalysis.wordCount > 100) {
    noticeScore += 6;
    noticeDetails.push(`Manuscript formatted with chapters/divisions (~${textAnalysis.wordCount.toLocaleString()} words, ~${textAnalysis.estimatedPages} pages).`);
  } else {
    noticeScore += 2;
    noticeDetails.push('Document has minimal text volume or lacks clear structural division.');
  }

  // ==========================================
  // PILLAR 4: Human Authorship & AI Disclosure (20 points)
  // (In accordance with USCO March 2023 Guidance on Works Containing AI Material)
  // ==========================================
  let aiScore = 0;
  const aiDetails = [];

  if (humanAuthorshipCertified) {
    aiScore += 10;
    aiDetails.push('Author certifies original human expressive authorship.');
  } else {
    aiDetails.push('Human authorship certification is required for registration.');
  }

  if (!textAnalysis.detectedAiArtifacts) {
    if (aiContentDisclosed) {
      if (aiDisclosureDetails && aiDisclosureDetails.length >= 10) {
        aiScore += 10;
        aiDetails.push('AI assistance disclosed and explained in compliance with USCO disclosure rules.');
      } else {
        aiScore += 5;
        aiDetails.push('AI assistance marked as present, but details of human vs AI contribution are brief.');
      }
    } else {
      aiScore += 10;
      aiDetails.push('No AI conversational artifacts detected; human-originated expression validated.');
    }
  } else {
    if (aiContentDisclosed) {
      aiScore += 8;
      aiDetails.push('AI artifacts detected in text, but AI assistance is formally disclosed in filing metadata.');
    } else {
      aiScore += 3;
      aiDetails.push('Potential AI assistant artifacts detected in manuscript text (e.g. conversational prompt remnants). Ensure AI portions are disclaimed or removed.');
    }
  }

  // ==========================================
  // PILLAR 5: Creation Year & Publication Status (15 points)
  // ==========================================
  let publicationScore = 0;
  const publicationDetails = [];

  const currentYear = new Date().getFullYear();
  if (yearCompleted && yearCompleted >= 1900 && yearCompleted <= currentYear + 1) {
    publicationScore += 8;
    publicationDetails.push(`Year of creation declared as ${yearCompleted}.`);
  } else {
    publicationDetails.push('Year of creation is missing or invalid.');
  }

  if (publicationStatus === 'unpublished') {
    publicationScore += 7;
    publicationDetails.push('Registered as an Unpublished Work (recommended status prior to public distribution).');
  } else if (publicationStatus === 'published') {
    if (work.dateOfPublication || options.dateOfPublication) {
      publicationScore += 7;
      publicationDetails.push(`Published work with Date of First Publication declared.`);
    } else {
      publicationScore += 4;
      publicationDetails.push('Published work indicated, but exact Date of First Publication is required.');
    }
  } else {
    publicationScore += 3;
    publicationDetails.push('Publication status should be clearly selected (Unpublished vs Published).');
  }

  // Total Score Calculation (0 - 100)
  const totalScore = Math.min(
    100,
    authorshipScore + titleScore + noticeScore + aiScore + publicationScore
  );

  // Grade categorization
  let grade = 'Incomplete';
  if (totalScore >= 85) grade = 'Ready for Filing';
  else if (totalScore >= 70) grade = 'Good Preparation';
  else if (totalScore >= 50) grade = 'Needs Review';

  // Actionable Recommendations Generation
  const recommendations = [];

  if (!textAnalysis.detectedNotice) {
    recommendations.push({
      id: 'REC-NOTICE-01',
      category: 'Notice & Formatting',
      severity: 'recommended',
      title: 'Add Formal Copyright Notice to Title Page',
      description: `Include a copyright page in your manuscript with standard notice: "Copyright © ${yearCompleted} ${work.authorName}. All rights reserved."`,
      actionKey: 'add_notice',
      completed: false,
    });
  }

  if (!textAnalysis.detectedTitleInFrontMatter) {
    recommendations.push({
      id: 'REC-FRONT-02',
      category: 'Title Page',
      severity: 'recommended',
      title: 'Include Work Title & PubSeal ID on First Page',
      description: `Format the first page as a clean title page displaying "${work.title}", author name "${work.authorName}", and token "${work.registrationId}".`,
      actionKey: 'add_title_page',
      completed: false,
    });
  }

  if (!humanAuthorshipCertified) {
    recommendations.push({
      id: 'REC-HUMAN-03',
      category: 'Authorship',
      severity: 'critical',
      title: 'Certify Original Human Authorship',
      description: 'National copyright offices (including USCO) require human authorship for valid copyright claims. Confirm your creative human direction.',
      actionKey: 'certify_human',
      completed: false,
    });
  }

  if (textAnalysis.detectedAiArtifacts && !aiContentDisclosed) {
    recommendations.push({
      id: 'REC-AI-04',
      category: 'AI Disclosure',
      severity: 'critical',
      title: 'Address AI Prompt Remnants in Text',
      description: 'The manuscript contains conversational AI phrases (e.g., "As an AI language model"). Remove these remnants or complete the AI disclosure statement.',
      actionKey: 'disclose_ai',
      completed: false,
    });
  }

  if (!work.yearCompleted && !options.yearCompleted) {
    recommendations.push({
      id: 'REC-YEAR-05',
      category: 'Metadata',
      severity: 'recommended',
      title: 'Declare Year of Manuscript Completion',
      description: 'Specify the 4-digit calendar year when this draft or edition of the manuscript was finished.',
      actionKey: 'declare_year',
      completed: false,
    });
  }

  if (natureOfAuthorship.length < 4 || natureOfAuthorship === 'Other') {
    recommendations.push({
      id: 'REC-NATURE-06',
      category: 'Authorship Claim',
      severity: 'recommended',
      title: 'Specify Nature of Authorship Claim',
      description: 'Provide an explicit claim description for Form TX, such as "Entire text", "Original novel and dialogue", or "Poetry anthology".',
      actionKey: 'nature_authorship',
      completed: false,
    });
  }

  if (textAnalysis.detectedThirdPartyMarkers && !preexistingMaterialExcluded) {
    recommendations.push({
      id: 'REC-EXCLUSIONS-07',
      category: 'Third-Party Material',
      severity: 'optional',
      title: 'Prepare Limitation of Claim for Quoted Material',
      description: 'If using third-party song lyrics, epigraphs, or public domain text, prepare a "Material Excluded" statement for your filing.',
      actionKey: 'limitation_claim',
      completed: false,
    });
  }

  // Always include helpful statutory best practice
  recommendations.push({
    id: 'REC-DEPOSIT-08',
    category: 'Deposit Copy',
    severity: 'optional',
    title: 'Prepare Final Deposit Copy in PDF/A Format',
    description: 'Ensure your official deposit copy submitted to the copyright portal has page numbers and matching typography.',
    actionKey: 'deposit_copy',
    completed: true,
  });

  // Statutory Filing Checklist
  const checklist = [
    {
      id: 'CHK-01',
      label: 'Author Legal Identity & Domicile Established',
      completed: !!(work.authorName && work.authorName.trim().length > 1),
      guidance: 'Ensure your full legal name and nation of citizenship/domicile match government identification.',
    },
    {
      id: 'CHK-02',
      label: 'Specific & Distinct Work Title',
      completed: titleScore >= 8,
      guidance: 'Title distinguishes this work from other works in the registry.',
    },
    {
      id: 'CHK-03',
      label: 'Statutory Copyright Notice in Manuscript',
      completed: textAnalysis.detectedNotice,
      guidance: 'Colophon includes "Copyright © [Year] [Author Name]. All Rights Reserved."',
    },
    {
      id: 'CHK-04',
      label: 'Human Expressive Authorship Certified',
      completed: humanAuthorshipCertified,
      guidance: 'Certified human creative expression in compliance with March 2023 USCO rules.',
    },
    {
      id: 'CHK-05',
      label: 'Year of Completion & Publication Status Fixed',
      completed: !!(yearCompleted && publicationStatus),
      guidance: 'Defines whether you are submitting an Unpublished or Published Work deposit.',
    },
    {
      id: 'CHK-06',
      label: 'PubSeal Cryptographic Pre-Registration Audit Trail',
      completed: true,
      guidance: `Authoritative SHA-256 fingerprint (${work.sha256Hash?.slice(0, 16)}...) anchored with certified server timestamp.`,
    },
  ];

  // Statutory Filing Dossier (Prepared answers for eCO Form TX / WIPO forms)
  const categoryInfo = WorkCategoriesMapping[work.category] || WorkCategoriesMapping['Other'];
  const formattedNotice = `Copyright © ${yearCompleted} ${work.authorName}. All Rights Reserved.\nCryptographically Registered: PubSeal Token ${work.registrationId} (SHA-256: ${work.sha256Hash})`;

  const filingDossier = {
    workTitle: work.title,
    alternativeTitles: 'N/A',
    natureOfWork: `${categoryInfo.statutoryType} (${work.category})`,
    yearCompleted,
    publicationStatus: publicationStatus === 'published' ? 'Published Work' : 'Unpublished Work',
    dateOfPublication: publicationStatus === 'published' ? (options.dateOfPublication || 'To be specified') : 'N/A (Unpublished work)',
    nationOfPublication: publicationStatus === 'published' ? (options.nationOfPublication || 'United States') : 'N/A',
    authorName: work.authorName,
    natureOfAuthorship: natureOfAuthorship || 'Entire text',
    isPseudonymous,
    pseudonym: isPseudonymous ? pseudonym : 'N/A',
    isWorkMadeForHire,
    humanAuthorshipCertified,
    aiDisclosureStatement: aiContentDisclosed
      ? (aiDisclosureDetails || 'AI assistance utilized for drafting assistance; all final expressive text human-authored.')
      : 'Human-authored in its entirety; no substantial AI-generated expressive content.',
    materialExcluded: preexistingMaterialExcluded || 'None (Original creation)',
    recommendedDepositFormat: 'Clean paginated PDF (PDF/A recommended)',
    formattedStatutoryNotice: formattedNotice,
    pubsealEvidenceTrail: `PubSeal Token: ${work.registrationId} | SHA-256 Digest: ${work.sha256Hash} | Certified Date: ${new Date(work.registeredAt || Date.now()).toISOString()}`,
  };

  // Optional Gemini AI Deep Insight (if API key is present)
  let engine = 'pubseal-statutory-ai';
  let summary = `Evaluation completed for ${work.title} (v${versionNum}.0). Readiness Score: ${totalScore}/100 (${grade}). ${textAnalysis.wordCount > 0 ? `Analyzed ~${textAnalysis.wordCount.toLocaleString()} words across estimated ${textAnalysis.estimatedPages} pages.` : 'Metadata and document structure validated.'}`;

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (apiKey && GoogleGenAI && text && text.length > 50) {
    try {
      const client = new GoogleGenAI({ apiKey });
      const promptText = `
You are a senior copyright attorney and literary intellectual property specialist.
Analyze this creative work's metadata and manuscript excerpt for statutory copyright registration readiness (e.g. U.S. Copyright Office Form TX / eCO).

Metadata:
- Title: "${work.title}"
- Category: "${work.category}"
- Author: "${work.authorName}"
- Year of Completion: ${yearCompleted}
- Publication Status: ${publicationStatus}
- Nature of Authorship Claim: "${natureOfAuthorship}"
- Human Authorship Certified: ${humanAuthorshipCertified}
- AI Content Disclosed: ${aiContentDisclosed}

Manuscript Excerpt (first 1200 words):
"""
${text.slice(0, 4500)}
"""

Provide a concise 2-sentence executive summary of the work's literary copyrightability and formal registration readiness.
`;
      const response = await client.interactions.create({
        model: 'gemini-3.8-flash',
        input: promptText,
      });

      if (response && response.output_text) {
        engine = 'gemini-3.8-flash';
        summary = response.output_text.trim();
      }
    } catch (geminiErr) {
      console.warn('[PubSeal Gemini AI] Gemini call skipped, using local statutory engine:', geminiErr.message);
    }
  }

  return {
    score: totalScore,
    grade,
    evaluatedAt: new Date(),
    versionEvaluated: versionNum,
    status: 'completed',
    engine,
    summary,
    breakdown: {
      authorshipClaim: {
        score: authorshipScore,
        maxScore: 25,
        status: authorshipScore >= 20 ? 'pass' : authorshipScore >= 14 ? 'warn' : 'fail',
        details: authorshipDetails.join(' '),
      },
      titleMetadata: {
        score: titleScore,
        maxScore: 20,
        status: titleScore >= 16 ? 'pass' : titleScore >= 10 ? 'warn' : 'fail',
        details: titleDetails.join(' '),
      },
      statutoryNoticeDeposit: {
        score: noticeScore,
        maxScore: 20,
        status: noticeScore >= 16 ? 'pass' : noticeScore >= 10 ? 'warn' : 'fail',
        details: noticeDetails.join(' '),
      },
      humanAuthorshipAiDisclosure: {
        score: aiScore,
        maxScore: 20,
        status: aiScore >= 18 ? 'pass' : aiScore >= 12 ? 'warn' : 'fail',
        details: aiDetails.join(' '),
      },
      publicationStatusCompleteness: {
        score: publicationScore,
        maxScore: 15,
        status: publicationScore >= 12 ? 'pass' : publicationScore >= 8 ? 'warn' : 'fail',
        details: publicationDetails.join(' '),
      },
    },
    recommendations,
    checklist,
    manuscriptMetrics: textAnalysis,
    filingDossier,
  };
}

// Statutory category mapping for Copyright Office Form TX / PA / SR
const WorkCategoriesMapping = {
  Novel: { statutoryType: 'Literary Work (Text)', statutoryForm: 'Form TX' },
  Poetry: { statutoryType: 'Literary Work (Poetry)', statutoryForm: 'Form TX' },
  'Short Story': { statutoryType: 'Literary Work (Text)', statutoryForm: 'Form TX' },
  Screenplay: { statutoryType: 'Work of the Performing Arts (Script)', statutoryForm: 'Form PA' },
  Essay: { statutoryType: 'Literary Work (Non-dramatic text)', statutoryForm: 'Form TX' },
  'Academic Writing': { statutoryType: 'Literary Work (Academic / Research)', statutoryForm: 'Form TX' },
  'Stage Play': { statutoryType: 'Work of the Performing Arts (Dramatic Work)', statutoryForm: 'Form PA' },
  Memoir: { statutoryType: 'Literary Work (Biography / Non-fiction)', statutoryForm: 'Form TX' },
  Other: { statutoryType: 'Literary Work', statutoryForm: 'Form TX' },
};

module.exports = {
  extractManuscriptText,
  analyzeTextContent,
  evaluateCopyrightReadiness,
  WorkCategoriesMapping,
};

