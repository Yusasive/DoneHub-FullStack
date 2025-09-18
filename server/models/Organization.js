const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    industry: {
      type: String,
      enum: [
        "technology",
        "healthcare",
        "finance",
        "education",
        "retail",
        "manufacturing",
        "other",
      ],
      required: true,
    },
    branding: {
      logo: String,
      primaryColor: {
        type: String,
        default: "#3B82F6",
      },
      secondaryColor: {
        type: String,
        default: "#6366F1",
      },
    },
    settings: {
      allowSelfRegistration: {
        type: Boolean,
        default: false,
      },
      requireEmailVerification: {
        type: Boolean,
        default: true,
      },
      inviteExpiration: {
        type: Number,
        default: 7, // days
      },
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "rejected", "needs_info"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
    rejectionReason: String,
    memberCount: {
      type: Number,
      default: 0,
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "basic", "premium", "enterprise"],
        default: "free",
      },
      expiresAt: Date,
      features: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
organizationSchema.index({ name: 1 });
organizationSchema.index({ status: 1 });
organizationSchema.index({ created_by: 1 });
organizationSchema.index({ industry: 1 });

// Update member count when users are added/removed
organizationSchema.methods.updateMemberCount = async function () {
  const User = require("./User");
  const count = await User.countDocuments({
    org_id: this._id,
    status: "active",
  });
  this.memberCount = count;
  await this.save();
  return count;
};

module.exports = mongoose.model("Organization", organizationSchema);
