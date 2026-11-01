const mongoose = require('mongoose');

const verificationLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
    },
    verificationType: {
      type: String,
      enum: ['file_upload', 'token_lookup', 'hash_lookup'],
      required: true,
      index: true,
    },
    searchedQuery: {
      type: String,
      trim: true,
      default: '',
    },
    searchedHash: {
      type: String,
      length: 64,
      lowercase: true,
      default: null,
      index: true,
    },
    resultStatus: {
      type: String,
      enum: ['EXACT_MATCH', 'HISTORICAL_VERSION_MATCH', 'NO_MATCH'],
      required: true,
      index: true,
    },
    matchedWorkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Work',
      default: null,
    },
    matchedRegistrationId: {
      type: String,
      default: null,
      index: true,
    },
    matchedTitle: {
      type: String,
      default: null,
    },
    matchedAuthor: {
      type: String,
      default: null,
    },
    matchedVersion: {
      type: Number,
      default: null,
    },
    isLatestVersion: {
      type: Boolean,
      default: true,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: '',
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

verificationLogSchema.index({ verifiedAt: -1 });

const VerificationLog = mongoose.model('VerificationLog', verificationLogSchema);

module.exports = VerificationLog;

