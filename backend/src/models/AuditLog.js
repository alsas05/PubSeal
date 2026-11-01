const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'WORK_REGISTERED',
        'VERSION_COMMITTED',
        'CERTIFICATE_GENERATED',
        'READINESS_EVALUATED',
        'VERIFICATION_PERFORMED',
        'MANUSCRIPT_DOWNLOADED',
        'DATABASE_BACKUP_EXPORTED',
        'EMAIL_VERIFIED',
        'USER_REGISTERED',
      ],
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['Work', 'WorkVersion', 'Certificate', 'Verification', 'User', 'Database'],
      index: true,
    },
    entityId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    userEmail: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;

