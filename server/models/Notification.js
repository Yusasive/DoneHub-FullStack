const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "approval"],
      default: "info",
    },
    read: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
