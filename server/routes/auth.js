const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { generateToken, verifyToken, auditLog } = require("../middleware/auth");
const User = require("../models/User");
const Organization = require("../models/Organization");
const Invite = require("../models/Invite");
const Notification = require("../models/Notification");
const { sendEmail } = require("../utils/email");
const router = express.Router();

// Rate limiting for sensitive operations (disabled in development)
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 5 : 1000, // 5 in production, 1000 in development
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === "production" ? 3 : 100, // 3 in production, 100 in development
  message: "Too many password reset attempts, please try again later.",
});

// Register Organization Admin
router.post("/signup-org-admin", async (req, res) => {
  console.log("=== ORG ADMIN SIGNUP ROUTE HIT ===", new Date().toISOString());
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers);
  try {
    const { name, email, orgName, orgDescription, industry } = req.body;

    console.log("Extracted fields:", {
      name,
      email,
      orgName,
      orgDescription,
      industry,
    });

    // Validation
    if (!name || !email || !orgName || !industry) {
      console.log("Required field validation failed");
      return res.status(400).json({
        message: "Name, email, organization name, and industry are required.",
      });
    }
    console.log("Required field validation passed");

    // Check if user already exists
    console.log("Checking if user exists with email:", email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists!");
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }
    console.log("User does not exist, proceeding");

    // Check if organization name is taken
    console.log("Checking if organization exists with name:", orgName);
    const existingOrg = await Organization.findOne({ name: orgName });
    if (existingOrg) {
      console.log("Organization already exists!");
      return res
        .status(400)
        .json({ message: "Organization name is already taken." });
    }
    console.log("Organization name is available, proceeding");

    // Create organization first (pending approval)
    const organization = new Organization({
      name: orgName,
      description: orgDescription,
      industry,
      created_by: null, // Will be updated after user creation
      status: "pending",
    });

    const savedOrg = await organization.save();

    // Create user (pending approval)
    const user = new User({
      name,
      email,
      password: "temp-password", // Will be set during approval
      role: "org_admin",
      org_id: savedOrg._id,
      status: "pending",
    });

    // Generate email verification token
    user.generateEmailVerificationToken();
    const savedUser = await user.save();

    // Update organization with created_by
    savedOrg.created_by = savedUser._id;
    await savedOrg.save();

    // Send notification to system admins
    try {
      const systemAdmins = await User.find({
        role: "system_admin",
        status: "active",
      });

      for (const admin of systemAdmins) {
        // Create notification in database
        await Notification.create({
          user_id: admin._id,
          org_id: savedOrg._id,
          title: "New Organization Admin Request",
          message: `${name} has requested admin access for "${orgName}" (${industry} industry)`,
          type: "approval",
          actionUrl: "/admin/requests",
        });

        // Send email notification
        await sendEmail({
          to: admin.email,
          subject: "New Organization Admin Request",
          template: "admin-approval-request",
          data: {
            adminName: admin.name,
            requestorName: name,
            requestorEmail: email,
            orgName: orgName,
            industry: industry,
            approvalUrl: `${process.env.FRONTEND_URL}/admin/requests`,
          },
        });
      }
      console.log("System admin notifications sent successfully");
    } catch (emailError) {
      console.warn(
        "Failed to send system admin notifications:",
        emailError.message
      );
    }

    // Send confirmation to requestor
    try {
      await sendEmail({
        to: email,
        subject: "Organization Admin Request Submitted",
        template: "org-admin-request-confirmation",
        data: {
          name,
          orgName,
        },
      });
      console.log("Confirmation email sent successfully");
    } catch (emailError) {
      console.warn("Failed to send confirmation email:", emailError.message);
    }

    res.status(201).json({
      message:
        "Organization admin request submitted successfully. You will receive an email notification once approved.",
      requestId: savedUser._id,
    });
  } catch (error) {
    console.error("=== ORG ADMIN SIGNUP ERROR ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Register Member with Invite Token
router.post(
  "/signup-member",
  auditLog("user_created", "user"),
  async (req, res) => {
    try {
      const { token, name, email, password } = req.body;

      // Validation
      if (!token || !name || !email || !password) {
        return res.status(400).json({
          message: "Token, name, email, and password are required.",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters long.",
        });
      }

      // Find and validate invite (hash the token and match by tokenHash)
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const invite = await Invite.findOne({ tokenHash, status: "pending" })
        .populate("org_id")
        .populate("created_by");

      if (!invite) {
        return res
          .status(400)
          .json({ message: "Invalid or expired invitation token." });
      }

      // Check if invite is expired
      if (invite.isExpired()) {
        invite.status = "expired";
        await invite.save();
        return res.status(400).json({ message: "Invitation has expired." });
      }

      // Check if email matches invite
      if (invite.email !== email.toLowerCase()) {
        return res
          .status(400)
          .json({ message: "Email does not match the invitation." });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User with this email already exists." });
      }

      // Create user
      const user = new User({
        name,
        email,
        password,
        role: invite.role,
        org_id: invite.org_id._id,
        status: "active",
        emailVerified: true,
      });

      const savedUser = await user.save();

      // Update invite status
      invite.status = "accepted";
      invite.accepted_by = savedUser._id;
      invite.accepted_at = new Date();
      await invite.save();

      // Update organization member count
      await invite.org_id.updateMemberCount();

      // Generate JWT token
      const jwtToken = generateToken(savedUser._id);

      // Send welcome email
      await sendEmail({
        to: email,
        subject: `Welcome to ${invite.org_id.name}!`,
        template: "member-welcome",
        data: {
          name,
          orgName: invite.org_id.name,
          inviterName: invite.created_by.name,
          loginUrl: `${process.env.FRONTEND_URL}/login`,
        },
      });

      res.status(201).json({
        message: "Account created successfully!",
        token: jwtToken,
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role,
          org_id: savedUser.org_id,
          status: savedUser.status,
        },
      });
    } catch (error) {
      console.error("Member signup error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

// Login
router.post(
  "/login",
  authLimiter,
  auditLog("user_login", "user"),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required." });
      }

      // Find user
      const user = await User.findOne({ email }).populate("org_id");
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      // Check account status
      if (user.status !== "active") {
        return res.status(401).json({
          message: "Account is not active. Please contact support.",
          status: user.status,
        });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = generateToken(user._id);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          org_id: user.org_id,
          status: user.status,
          emailVerified: user.emailVerified,
          lastLogin: user.lastLogin,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

// Get current user
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("org_id")
      .select("-password");

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        org_id: user.org_id,
        status: user.status,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Forgot Password
router.post("/forgot-password", passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        message:
          "If an account with that email exists, we have sent password reset instructions.",
      });
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Password Reset Request - DoneHub",
      template: "password-reset",
      data: {
        name: user.name,
        resetUrl,
        expirationMinutes: 10,
      },
    });

    res.json({
      message:
        "If an account with that email exists, we have sent password reset instructions.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Reset Password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired password reset token." });
    }

    // Update password and clear reset token
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: "Password Reset Successful - DoneHub",
      template: "password-reset-success",
      data: {
        name: user.name,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
      },
    });

    res.json({
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Logout (client-side token removal, but we can log it)
router.post(
  "/logout",
  verifyToken,
  auditLog("user_logout", "user"),
  (req, res) => {
    res.json({ message: "Logged out successfully" });
  }
);

// Verify invite token
router.get("/verify-invite/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Hash incoming token to match stored tokenHash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const invite = await Invite.findOne({ tokenHash, status: "pending" })
      .populate("org_id", "name")
      .populate("created_by", "name");

    if (!invite) {
      return res.status(404).json({ message: "Invalid invitation token." });
    }

    if (invite.isExpired()) {
      invite.status = "expired";
      await invite.save();
      return res.status(400).json({ message: "Invitation has expired." });
    }

    res.json({
      valid: true,
      invite: {
        email: invite.email,
        orgName: invite.org_id.name,
        inviterName: invite.created_by.name,
        role: invite.role,
        expiresAt: invite.expires_at,
      },
    });
  } catch (error) {
    console.error("Verify invite error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
