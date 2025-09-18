const mongoose = require("mongoose");
const crypto = require("crypto");

const inviteSchema = new mongoose.Schema(
  {
    org_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["member", "sub_admin"],
      default: "member",
    },
    expires_at: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "revoked"],
      default: "pending",
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accepted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    accepted_at: Date,
    metadata: {
      inviterName: String,
      orgName: String,
      personalMessage: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
inviteSchema.index({ tokenHash: 1 });
inviteSchema.index({ email: 1, org_id: 1 });
inviteSchema.index({ expires_at: 1 });
inviteSchema.index({ status: 1 });

// Generate secure token + store hash only
inviteSchema.pre("save", function (next) {
  if (!this.tokenHash) {
    const raw = crypto.randomBytes(32).toString("hex");
    this._rawToken = raw; // transient value for email composition
    this.tokenHash = crypto.createHash("sha256").update(raw).digest("hex");
  }
  next();
});

// Check if invite is expired
inviteSchema.methods.isExpired = function () {
  return this.expires_at < new Date();
};

// Mark invite as expired if past expiration date
inviteSchema.methods.checkAndUpdateExpiration = async function () {
  if (this.isExpired() && this.status === "pending") {
    this.status = "expired";
    await this.save();
    return true;
  }
  return false;
};

// Auto-expire invites (optional TTL). Comment out TTL if you want to keep history in DB.
// inviteSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Invite", inviteSchema);
