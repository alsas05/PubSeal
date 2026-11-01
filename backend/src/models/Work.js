const mongoose = require('mongoose');

const CATEGORIES = [
  'Novel',
  'Poetry',
  'Short Story',
  'Screenplay',
  'Essay',
  'Academic Writing',
  'Stage Play',
  'Memoir',
  'Other',
];

const versionSchema = new mongoose.Schema(
  {
    versionNumber: {
      type: Number,
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
      trim: true,
    },
    storedFilename: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    sha256Hash: {
      type: String,
      required: true,
      length: 64,
      lowercase: true,
    },
    changeNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  { _id: true }
);

const workSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner reference is required'],
      index: true,
    },
    registrationId: {
      type: String,
      required: [true, 'Registration ID is required'],
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Work title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a supported category',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    authorName: {
      type: String,
      required: [true, 'Author/Creator name is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    originalFilename: {
      type: String,
      required: [true, 'Original filename is required'],
      trim: true,
    },
    storedFilename: {
      type: String,
      required: [true, 'Stored filename reference is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    sha256Hash: {
      type: String,
      required: [true, 'SHA-256 hash is required'],
      index: true,
      length: 64,
      lowercase: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    certificateGenerated: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['registered', 'archived'],
      default: 'registered',
    },
    verificationCount: {
      type: Number,
      default: 0,
    },
    lastVerifiedAt: {
      type: Date,
      default: null,
    },
    currentVersion: {
      type: Number,
      default: 1,
    },
    versions: [versionSchema],

    // Statutory Copyright Filing Metadata
    yearCompleted: {
      type: Number,
      min: 1900,
      max: 2100,
      default: () => new Date().getFullYear(),
    },
    publicationStatus: {
      type: String,
      enum: ['unpublished', 'published'],
      default: 'unpublished',
    },
    dateOfPublication: {
      type: String,
      default: '',
    },
    nationOfPublication: {
      type: String,
      default: 'United States',
    },
    natureOfAuthorship: {
      type: String,
      default: 'Entire text',
      trim: true,
      maxlength: 200,
    },
    isPseudonymous: {
      type: Boolean,
      default: false,
    },
    pseudonym: {
      type: String,
      trim: true,
      default: '',
    },
    isWorkMadeForHire: {
      type: Boolean,
      default: false,
    },
    humanAuthorshipCertified: {
      type: Boolean,
      default: true,
    },
    aiContentDisclosed: {
      type: Boolean,
      default: false,
    },
    aiDisclosureDetails: {
      type: String,
      trim: true,
      default: '',
    },
    preexistingMaterialExcluded: {
      type: String,
      trim: true,
      default: '',
    },

    // AI Copyright Readiness Score & Statutory Evaluation
    copyrightReadiness: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      grade: {
        type: String,
        enum: ['Ready for Filing', 'Good Preparation', 'Needs Review', 'Incomplete', null],
        default: null,
      },
      evaluatedAt: {
        type: Date,
        default: null,
      },
      versionEvaluated: {
        type: Number,
        default: 1,
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
      },
      engine: {
        type: String,
        default: 'pubseal-statutory-ai',
      },
      summary: {
        type: String,
        default: '',
      },
      breakdown: {
        authorshipClaim: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 25 },
          status: { type: String, default: 'pending' },
          details: { type: String, default: '' },
        },
        titleMetadata: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 20 },
          status: { type: String, default: 'pending' },
          details: { type: String, default: '' },
        },
        statutoryNoticeDeposit: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 20 },
          status: { type: String, default: 'pending' },
          details: { type: String, default: '' },
        },
        humanAuthorshipAiDisclosure: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 20 },
          status: { type: String, default: 'pending' },
          details: { type: String, default: '' },
        },
        publicationStatusCompleteness: {
          score: { type: Number, default: 0 },
          maxScore: { type: Number, default: 15 },
          status: { type: String, default: 'pending' },
          details: { type: String, default: '' },
        },
      },
      recommendations: [
        {
          id: String,
          category: String,
          severity: { type: String, enum: ['critical', 'recommended', 'optional'] },
          title: String,
          description: String,
          actionKey: String,
          completed: { type: Boolean, default: false },
        },
      ],
      checklist: [
        {
          id: String,
          label: String,
          completed: { type: Boolean, default: false },
          guidance: String,
        },
      ],
      manuscriptMetrics: {
        wordCount: { type: Number, default: 0 },
        characterCount: { type: Number, default: 0 },
        estimatedPages: { type: Number, default: 0 },
        detectedNotice: { type: Boolean, default: false },
        detectedTitleInFrontMatter: { type: Boolean, default: false },
        detectedStructure: { type: Boolean, default: false },
        detectedAiArtifacts: { type: Boolean, default: false },
      },
      filingDossier: {
        workTitle: { type: String, default: '' },
        alternativeTitles: { type: String, default: '' },
        natureOfWork: { type: String, default: '' },
        yearCompleted: { type: Number, default: null },
        publicationStatus: { type: String, default: 'Unpublished' },
        dateOfPublication: { type: String, default: 'N/A (Unpublished work)' },
        nationOfPublication: { type: String, default: '' },
        authorName: { type: String, default: '' },
        natureOfAuthorship: { type: String, default: 'Entire text' },
        isPseudonymous: { type: Boolean, default: false },
        pseudonym: { type: String, default: '' },
        isWorkMadeForHire: { type: Boolean, default: false },
        humanAuthorshipCertified: { type: Boolean, default: true },
        aiDisclosureStatement: { type: String, default: '' },
        materialExcluded: { type: String, default: 'None' },
        recommendedDepositFormat: { type: String, default: 'PDF/A paginated deposit copy' },
        formattedStatutoryNotice: { type: String, default: '' },
        pubsealEvidenceTrail: { type: String, default: '' },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Composite indexes for fast queries
workSchema.index({ ownerId: 1, registeredAt: -1 });
workSchema.index({ sha256Hash: 1, status: 1 });
workSchema.index({ 'versions.sha256Hash': 1 });

const Work = mongoose.model('Work', workSchema);
Work.CATEGORIES = CATEGORIES;

module.exports = Work;

