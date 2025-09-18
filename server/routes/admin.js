const express = require("express");
const { verifyToken, requireRole, auditLog } = require("../middleware/auth");
const User = require("../models/User");
const Organization = require("../models/Organization");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");
const { sendEmail } = require("../utils/email");
const router = express.Router();

// Apply authentication and system admin role requirement to all routes
router.use(verifyToken);
router.use(requireRole("system_admin"));

// Get pending organization admin requests
router.get("/requests", async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "pending" } = req.query;

    const requests = await User.find({
      role: "org_admin",
      status,
    })
      .populate("org_id", "name description industry")
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({
      role: "org_admin",
      status,
    });

    res.json({
      requests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Approve organization admin request
router.post("/approve/:userId", async (req, res) => {
  console.log("--- APPROVAL ROUTE HIT ---", new Date().toISOString());
  console.log("Request Params:", req.params);
  console.log("Request Body:", req.body);
  try {
    const { userId } = req.params;
    const { welcomeMessage } = req.body;

    console.log("Looking for user with ID:", userId);
    // Find the pending user and organization
    const user = await User.findById(userId).populate("org_id");
    console.log("Found user:", user ? "YES" : "NO");
    if (!user) {
      console.log("User not found - returning 404");
      return res.status(404).json({ message: "User not found." });
    }

    console.log("User status:", user.status);
    if (user.status !== "pending") {
      console.log("User is not pending - returning 400");
      return res
        .status(400)
        .json({ message: "User is not in pending status." });
    }

    console.log("User role:", user.role);
    if (user.role !== "org_admin") {
      console.log("User is not org_admin - returning 400");
      return res
        .status(400)
        .json({ message: "User is not an organization admin." });
    }

    const organization = user.org_id;
    console.log("Organization found:", organization ? "YES" : "NO");
    console.log("Organization status:", organization?.status);
    if (!organization || organization.status !== "pending") {
      console.log("Organization not found or not pending - returning 400");
      return res
        .status(400)
        .json({ message: "Organization not found or not pending." });
    }
    console.log("All validations passed, proceeding with approval");

    // Generate a temporary password for the user
    const tempPassword = Math.random().toString(36).slice(-12);
    user.password = tempPassword;
    user.status = "active";
    user.emailVerified = true;
    await user.save();

    // Approve the organization
    organization.status = "active";
    organization.approvedBy = req.user._id;
    organization.approvedAt = new Date();
    await organization.save();

    // Send approval email with login credentials
    try {
      await sendEmail({
        to: user.email,
        subject: "Organization Admin Request Approved!",
        template: "org-admin-approved",
        data: {
          name: user.name,
          orgName: organization.name,
          email: user.email,
          tempPassword,
          loginUrl: `${process.env.FRONTEND_URL}/login`,
          welcomeMessage:
            welcomeMessage ||
            "Welcome to DoneHub! Your organization has been approved.",
          approverName: req.user.name,
        },
      });
      console.log("Approval email sent successfully");
    } catch (emailError) {
      console.warn("Failed to send approval email:", emailError.message);
    }

    // Create notification for the approved user
    try {
      await Notification.create({
        user_id: user._id,
        org_id: organization._id,
        title: "Organization Request Approved!",
        message: `Your organization "${organization.name}" has been approved. You can now log in with your temporary password.`,
        type: "success",
        actionUrl: "/login",
      });
      console.log("Approval notification created successfully");
    } catch (notificationError) {
      console.warn(
        "Failed to create approval notification:",
        notificationError.message
      );
    }

    res.json({
      message: "Organization admin request approved successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
      organization: {
        id: organization._id,
        name: organization.name,
        status: organization.status,
      },
    });
  } catch (error) {
    console.error("Approve request error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Reject organization admin request
router.post(
  "/reject/:userId",
  auditLog("org_rejected", "organization"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res
          .status(400)
          .json({ message: "Rejection reason is required." });
      }

      // Find the pending user and organization
      const user = await User.findById(userId).populate("org_id");
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (user.status !== "pending") {
        return res
          .status(400)
          .json({ message: "User is not in pending status." });
      }

      const organization = user.org_id;

      // Update user and organization status
      user.status = "rejected";
      await user.save();

      if (organization) {
        organization.status = "rejected";
        organization.rejectionReason = reason;
        organization.approvedBy = req.user._id;
        organization.approvedAt = new Date();
        await organization.save();
      }

      // Send rejection email
      await sendEmail({
        to: user.email,
        subject: "Organization Admin Request Update",
        template: "org-admin-rejected",
        data: {
          name: user.name,
          orgName: organization?.name || "Your organization",
          reason,
          supportEmail: process.env.SUPPORT_EMAIL || "support@donehub.com",
        },
      });

      res.json({
        message: "Organization admin request rejected.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          status: user.status,
        },
      });
    } catch (error) {
      console.error("Reject request error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

// Request more info for organization admin request
router.post(
  "/request-info/:userId",
  auditLog("org_needs_info", "organization"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { questions } = req.body; // string or array of strings

      // Find the pending user and organization
      const user = await User.findById(userId).populate("org_id");
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (user.status !== "pending") {
        return res
          .status(400)
          .json({ message: "User is not in pending status." });
      }

      const organization = user.org_id;
      if (organization) {
        organization.status = "needs_info";
        organization.approvedBy = req.user._id;
        await organization.save();
      }

      await sendEmail({
        to: user.email,
        subject: "Additional Information Requested - DoneHub",
        template: "org-admin-request-more-info",
        data: {
          name: user.name,
          orgName: organization?.name || "your organization",
          questions: Array.isArray(questions)
            ? questions.join("\n- ")
            : questions,
          replyTo: process.env.SUPPORT_EMAIL || "support@donehub.com",
        },
      });

      res.json({
        message: "Requested additional information from organization admin.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          status: user.status,
        },
        organization: {
          id: organization?._id,
          name: organization?.name,
          status: organization?.status,
        },
      });
    } catch (error) {
      console.error("Request info error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

// Get all users
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;

    let query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .populate("org_id", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get system statistics
router.get("/stats", async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      totalOrgs,
      activeOrgs,
      pendingOrgs,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ status: "pending" }),
      Organization.countDocuments(),
      Organization.countDocuments({ status: "active" }),
      Organization.countDocuments({ status: "pending" }),
      AuditLog.find()
        .populate("user_id", "name email")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        pending: pendingUsers,
      },
      organizations: {
        total: totalOrgs,
        active: activeOrgs,
        pending: pendingOrgs,
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get all organizations
router.get("/organizations", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const organizations = await Organization.find(query)
      .populate("created_by", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Organization.countDocuments(query);

    res.json({
      organizations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get organizations error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get audit logs
router.get("/audit-logs", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      userId,
      orgId,
      startDate,
      endDate,
    } = req.query;

    let query = {};
    if (action) query.action = action;
    if (userId) query.user_id = userId;
    if (orgId) query.org_id = orgId;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .populate("user_id", "name email")
      .populate("org_id", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AuditLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
