const express = require("express");
const {
  verifyToken,
  requireRole,
  requireOrgAccess,
  auditLog,
} = require("../middleware/auth");
const User = require("../models/User");
const Organization = require("../models/Organization");
const Invite = require("../models/Invite");
const Task = require("../models/Task");
const { sendEmail } = require("../utils/email");
const router = express.Router();

// Apply authentication to all routes
router.use(verifyToken);

// Send invitations to new members
router.post(
  "/invite",
  requireRole(["org_admin", "sub_admin"]),
  requireOrgAccess,
  auditLog("invite_sent", "invite"),
  async (req, res) => {
    try {
      const { emails, role = "member", personalMessage } = req.body;

      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res
          .status(400)
          .json({ message: "Email addresses are required." });
      }

      if (emails.length > 50) {
        return res
          .status(400)
          .json({ message: "Cannot send more than 50 invitations at once." });
      }

      const organization = await Organization.findById(req.user.org_id);
      if (!organization || organization.status !== "active") {
        return res.status(400).json({ message: "Organization is not active." });
      }

      // Ensure settings object exists with defaults to avoid crashes
      organization.settings = organization.settings || { inviteExpiration: 7 };

      const results = [];
      const expiration = new Date();
      expiration.setDate(
        expiration.getDate() + (organization.settings?.inviteExpiration ?? 7)
      );

      for (const email of emails) {
        try {
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            results.push({
              email,
              status: "error",
              message: "Invalid email format",
            });
            continue;
          }

          // Check if user already exists
          const existingUser = await User.findOne({
            email: email.toLowerCase(),
          });
          if (existingUser) {
            results.push({
              email,
              status: "error",
              message: "User already exists",
            });
            continue;
          }

          // Check if there's already a pending invite
          const existingInvite = await Invite.findOne({
            email: email.toLowerCase(),
            org_id: req.user.org_id,
            status: "pending",
          });

          if (existingInvite) {
            results.push({
              email,
              status: "error",
              message: "Invitation already sent",
            });
            continue;
          }

          // Create new invite
          const invite = new Invite({
            org_id: req.user.org_id,
            email: email.toLowerCase(),
            role,
            expires_at: expiration,
            created_by: req.user._id,
            metadata: {
              inviterName: req.user.name,
              orgName: organization.name,
              personalMessage,
            },
          });

          await invite.save();

          // Send invitation email
          const rawToken = invite._rawToken; // set in pre-save hook
          const inviteUrl = `${process.env.FRONTEND_URL}/invite/${rawToken}`;

          // expose raw token temporarily via response for UI copy (not stored)
          invite.token = rawToken;

          await sendEmail({
            to: email,
            subject: `You're invited to join ${organization.name}`,
            template: "member-invitation",
            data: {
              inviterName: req.user.name,
              orgName: organization.name,
              inviteUrl,
              personalMessage,
              expirationDays: organization.settings.inviteExpiration || 7,
            },
          });

          results.push({
            email,
            status: "success",
            inviteId: invite._id,
            token: rawToken,
            expiresAt: invite.expires_at,
          });
        } catch (error) {
          console.error(`Error sending invite to ${email}:`, error);
          results.push({
            email,
            status: "error",
            message: "Failed to send invitation",
          });
        }
      }

      const successCount = results.filter((r) => r.status === "success").length;
      const errorCount = results.filter((r) => r.status === "error").length;

      res.json({
        message: `${successCount} invitation(s) sent successfully, ${errorCount} failed.`,
        results,
        summary: {
          total: emails.length,
          success: successCount,
          errors: errorCount,
        },
      });
    } catch (error) {
      console.error("Send invites error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

// Get organization invitations
router.get(
  "/invites",
  requireRole(["org_admin", "sub_admin"]),
  requireOrgAccess,
  async (req, res) => {
    console.log("=== GET /invites ROUTE HIT ===");
    console.log("User:", req.user);

    try {
      // Extract the actual ObjectId from org_id (handle both ObjectId and populated object)
      let userOrgId = req.user.org_id;
      if (userOrgId && typeof userOrgId === "object" && userOrgId._id) {
        userOrgId = userOrgId._id;
      }

      console.log("User org_id (extracted):", userOrgId);

      const pageNum = parseInt(req.query.page) || 1;
      const limitNum = parseInt(req.query.limit) || 10;
      const { status } = req.query;

      const query = { org_id: userOrgId };
      if (status) query.status = status;

      console.log("Query:", query);

      const invites = await Invite.find(query)
        .populate("created_by", "name email")
        .populate("accepted_by", "name email")
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .lean();

      const total = await Invite.countDocuments(query);

      console.log("Found", invites.length, "invites out of", total, "total");

      // Check and update expired invites
      const now = new Date();
      await Invite.updateMany(
        {
          org_id: userOrgId,
          status: "pending",
          expires_at: { $lt: now },
        },
        { status: "expired" }
      );

      // Do not expose token hashes; clients should only get token after create
      const safeInvites = invites.map((i) => ({
        id: i._id,
        org_id: i.org_id,
        email: i.email,
        role: i.role,
        expires_at: i.expires_at,
        status: i.status,
        created_by: i.created_by,
        accepted_by: i.accepted_by,
        accepted_at: i.accepted_at,
        metadata: i.metadata,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      }));

      res.json({
        invites: safeInvites,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
        },
      });
    } catch (error) {
      console.error("Get invites error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

// Revoke invitation
router.delete(
  "/invites/:inviteId",
  requireRole(["org_admin", "sub_admin"]),
  requireOrgAccess,
  auditLog("invite_revoked", "invite"),
  async (req, res) => {
    try {
      const { inviteId } = req.params;

      const invite = await Invite.findOne({
        _id: inviteId,
        org_id: req.user.org_id,
        status: "pending",
      });

      if (!invite) {
        return res
          .status(404)
          .json({ message: "Invitation not found or already processed." });
      }

      invite.status = "revoked";
      await invite.save();

      res.json({ message: "Invitation revoked successfully." });
    } catch (error) {
      console.error("Revoke invite error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

// Get organization members
router.get("/members", requireOrgAccess, async (req, res) => {
  console.log("=== GET /members ROUTE HIT ===");
  console.log("User ID:", req.user._id);
  console.log("User role:", req.user.role);
  console.log("User org_id type:", typeof req.user.org_id);
  console.log("User org_id value:", req.user.org_id);

  try {
    // Extract the actual ObjectId from org_id (handle both ObjectId and populated object)
    let userOrgId = req.user.org_id;
    if (userOrgId && typeof userOrgId === "object" && userOrgId._id) {
      console.log("org_id is populated object, extracting _id");
      userOrgId = userOrgId._id;
    } else if (!userOrgId) {
      console.log("❌ User has no org_id");
      return res.status(400).json({ 
        message: "User is not associated with any organization.",
        debug: {
          userId: req.user._id,
          userRole: req.user.role,
          orgId: req.user.org_id
        }
      });
    }

    console.log("User org_id (extracted):", userOrgId);

    const { page = 1, limit = 20, role, status = "active", search } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    let query = { org_id: userOrgId };
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    
    // Only filter by status if it's provided and not empty
    if (status && status !== '') {
      query.status = status;
    }

    console.log("Query:", query);

    const members = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limitNum * 1)
      .skip((pageNum - 1) * limitNum)
      .lean();

    const total = await User.countDocuments(query);

    console.log("Found", members.length, "members out of", total, "total");

    // Transform the data to match frontend expectations
    const transformedMembers = members.map(member => ({
      ...member,
      id: member._id,
      created_at: member.createdAt
    }));

    res.json({
      members: transformedMembers,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
      },
    });
  } catch (error) {
    console.error("Get members error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Internal server error.",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update member role
router.patch(
  "/members/:memberId/role",
  requireRole(["org_admin"]),
  requireOrgAccess,
  auditLog("role_changed", "user"),
  async (req, res) => {
    try {
      const { memberId } = req.params;
      const { role } = req.body;

      if (!["member", "sub_admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role." });
      }

      const member = await User.findOne({
        _id: memberId,
        org_id: req.user.org_id,
        role: { $in: ["member", "sub_admin"] },
      });

      if (!member) {
        return res.status(404).json({ message: "Member not found." });
      }

      const oldRole = member.role;
      member.role = role;
      await member.save();

      res.json({
        message: "Member role updated successfully.",
        member: {
          id: member._id,
          name: member.name,
          email: member.email,
          role: member.role,
          oldRole,
        },
      });
    } catch (error) {
      console.error("Update member role error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

// Remove member from organization
router.delete(
  "/members/:memberId",
  requireRole(["org_admin"]),
  requireOrgAccess,
  auditLog("user_deleted", "user"),
  async (req, res) => {
    try {
      const { memberId } = req.params;

      const member = await User.findOne({
        _id: memberId,
        org_id: req.user.org_id,
        role: { $in: ["member", "sub_admin"] },
      });

      if (!member) {
        return res.status(404).json({ message: "Member not found." });
      }

      // Instead of deleting, we'll deactivate the user
      member.status = "suspended";
      await member.save();

      // Update organization member count
      const organization = await Organization.findById(req.user.org_id);
      await organization.updateMemberCount();

      res.json({ message: "Member removed from organization successfully." });
    } catch (error) {
      console.error("Remove member error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

// Get organization details
router.get("/details", requireOrgAccess, async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.org_id)
      .populate("created_by", "name email")
      .populate("approvedBy", "name email");

    if (!organization) {
      return res.status(404).json({ message: "Organization not found." });
    }

    res.json({ organization });
  } catch (error) {
    console.error("Get organization details error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update organization settings
router.patch(
  "/settings",
  requireRole(["org_admin"]),
  requireOrgAccess,
  auditLog("settings_updated", "organization"),
  async (req, res) => {
    try {
      const { name, description, branding, settings } = req.body;

      const organization = await Organization.findById(req.user.org_id);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found." });
      }

      // Update allowed fields
      if (name) organization.name = name;
      if (description !== undefined) organization.description = description;
      if (branding)
        organization.branding = { ...organization.branding, ...branding };
      if (settings)
        organization.settings = { ...organization.settings, ...settings };

      await organization.save();

      res.json({
        message: "Organization settings updated successfully.",
        organization,
      });
    } catch (error) {
      console.error("Update organization settings error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

// Get organization statistics
router.get("/stats", requireOrgAccess, async (req, res) => {
  console.log("=== GET /stats ROUTE HIT ===");
  try {
    // Extract the actual ObjectId from org_id (handle both ObjectId and populated object)
    let userOrgId = req.user.org_id;
    if (userOrgId && typeof userOrgId === "object" && userOrgId._id) {
      userOrgId = userOrgId._id;
    } else if (!userOrgId) {
      console.log("❌ User has no org_id for stats");
      return res.status(400).json({ 
        message: "User is not associated with any organization." 
      });
    }

    console.log("Getting org stats for org_id:", userOrgId);

    const [
      totalMembers,
      activeMembers,
      pendingMembers,
      totalInvites,
      pendingInvites,
      completedTasks,
      activeTasks,
      overdueTasks,
      totalTasks,
      organization,
    ] = await Promise.all([
      // Members stats
      User.countDocuments({ org_id: userOrgId }),
      User.countDocuments({ org_id: userOrgId, status: "active" }),
      User.countDocuments({ org_id: userOrgId, status: "pending" }),
      // Invites stats
      Invite.countDocuments({ org_id: userOrgId }),
      Invite.countDocuments({ org_id: userOrgId, status: "pending" }),
      // Tasks stats
      Task.countDocuments({ org_id: userOrgId, status: "completed" }),
      Task.countDocuments({
        org_id: userOrgId,
        status: { $in: ["todo", "in_progress"] },
      }),
      Task.countDocuments({
        org_id: userOrgId,
        due_date: { $lt: new Date() },
        status: { $in: ["todo", "in_progress"] },
      }),
      Task.countDocuments({ org_id: userOrgId }),
      // Organization info
      Organization.findById(userOrgId),
    ]);

    // Calculate projects (for now, we'll simulate this or you can add a Project model)
    const projects = 8; // Placeholder - you can add a Project model later

    // Calculate recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log("Calculating recent activity since:", thirtyDaysAgo);
    const recentActivity = await Promise.all([
      User.countDocuments({
        org_id: userOrgId,
        createdAt: { $gte: thirtyDaysAgo },
      }),
      Task.countDocuments({
        org_id: userOrgId,
        status: "completed",
        updatedAt: { $gte: thirtyDaysAgo },
      }),
      Invite.countDocuments({
        org_id: userOrgId,
        createdAt: { $gte: thirtyDaysAgo },
      }),
    ]);

    const stats = {
      members: {
        total: totalMembers,
        active: activeMembers,
        pending: pendingMembers,
      },
      invites: {
        total: totalInvites,
        pending: pendingInvites,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        active: activeTasks,
        overdue: overdueTasks,
      },
      projects: {
        total: projects, // Placeholder
        active: Math.floor(projects * 0.8), // 80% active
      },
      organization: {
        name: organization?.name,
        status: organization?.status,
        memberCount: organization?.memberCount || activeMembers,
        createdAt: organization?.createdAt,
      },
      recentActivity: {
        newMembers: recentActivity[0],
        tasksCompleted: recentActivity[1],
        invitesSent: recentActivity[2],
      },
    };

    console.log("Organization stats:", stats);
    res.json(stats);
  } catch (error) {
    console.error("Get organization stats error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Internal server error.",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
