const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    workId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Work',
      required: true,
      index: true,
    },
    registrationId: {
      type: String,
      required: true,
      index: true,
      uppercase: true,
    },
    versionNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    sha256Hash: {
      type: String,
      required: true,
      length: 64,
      lowercase: true,
      index: true,
    },
    issuer: {
      type: String,
      default: 'PubSeal Cryptographic Registry Authority',
    },
    issuedAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    status: {
      type: String,
      enum: ['active', 'superseded', 'revoked'],
      default: 'active',
      index: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    verificationUrl: {
      type: String,
      default: '',
    },
    digitalSignature: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ workId: 1, versionNumber: 1 });

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
