const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    org_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    action: {
      type: String,
      required: true,
      enum: [
        "user_created",
        "user_updated",
        "user_deleted",
        "user_login",
        "user_logout",
        "org_created",
        "org_updated",
        "org_approved",
        "org_rejected",
        "org_needs_info",
        "invite_sent",
        "invite_accepted",
        "invite_revoked",
        "task_created",
        "task_updated",
        "task_completed",
        "task_deleted",
        "settings_updated",
        "role_changed",
        "password_changed",
      ],
    },
    resource_type: {
      type: String,
      enum: ["user", "organization", "invite", "task", "settings"],
    },
    resource_id: mongoose.Schema.Types.ObjectId,
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip_address: String,
    user_agent: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
auditLogSchema.index({ user_id: 1, createdAt: -1 });
auditLogSchema.index({ org_id: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource_type: 1, resource_id: 1 });

// TTL index to automatically delete old logs after 1 year
auditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
