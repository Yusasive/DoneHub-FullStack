const jwt = require("jsonwebtoken");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    console.log("=== verifyToken middleware ===");
    console.log("Headers:", req.headers.authorization);

    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.log("No token provided");
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    console.log("Token found, verifying...");
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    console.log("Token decoded:", decoded);

    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log("User not found for token");
      return res
        .status(401)
        .json({ message: "Invalid token. User not found." });
    }

    if (user.status !== "active") {
      console.log("User status is not active:", user.status);
      return res.status(401).json({ message: "Account is not active." });
    }

    console.log("User authenticated successfully:", {
      id: user._id,
      email: user.email,
      role: user.role,
      org_id: user.org_id,
      status: user.status,
    });

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    }
    res.status(401).json({ message: "Invalid token." });
  }
};

// Check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Insufficient permissions.",
        required: allowedRoles,
        current: userRole,
      });
    }

    next();
  };
};

// Check if user belongs to organization
const requireOrgAccess = async (req, res, next) => {
  try {
    console.log("=== requireOrgAccess middleware ===");
    if (!req.user || typeof req.user !== 'object') {
      console.log("No user in request or user is not an object");
      return res.status(401).json({ message: "Authentication required." });
    }
    if (!('org_id' in req.user) || !req.user.org_id) {
      console.log("User has no org_id assigned");
      return res.status(403).json({ 
        message: "No organization assigned to your account.",
        debug: {
          userId: req.user._id,
          userRole: req.user.role,
          orgId: req.user.org_id
        }
      });
    }
    // System admins have access to all organizations
    if (req.user.role === "system_admin") {
      console.log("System admin - allowing access");
      return next();
    }
    // Extract the actual ObjectId from org_id (handle both ObjectId and populated object)
    let userOrgId = req.user.org_id;
    if (userOrgId && typeof userOrgId === "object") {
      // If org_id is a Mongoose ObjectId, convert to string
      if (userOrgId._id) {
        console.log("org_id is populated object, extracting _id");
        userOrgId = userOrgId._id;
      } else if (userOrgId.toHexString) {
        userOrgId = userOrgId.toHexString();
      }
    }
    if (!userOrgId) {
      console.log("Extracted org_id is undefined");
      return res.status(403).json({ message: "No valid organization found for user." });
    }
    console.log("User org_id (extracted):", userOrgId);
    // For org_admin and members, they can access their own organization data
    // If no orgId is specified in params, use the user's org_id
    const orgId = req.params.orgId || req.body.org_id || userOrgId;
    console.log("orgId from params/body:", req.params.orgId || req.body.org_id);
    console.log("Final orgId:", orgId);
    // If no orgId specified, they're accessing their own org (which is allowed)
    if (!orgId || String(userOrgId) === String(orgId)) {
      console.log("Org access granted - user accessing own organization");
      return next();
    }
    // If a different orgId is specified, deny access (unless system_admin)
    console.log("Org access denied - user trying to access different organization");
    console.log("User org_id:", String(userOrgId));
    console.log("Requested org_id:", String(orgId));
    return res.status(403).json({ message: "Access denied to this organization." });
  } catch (error) {
    console.error("requireOrgAccess error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Error checking organization access." });
  }
};

// Audit log middleware
const auditLog = (action, resourceType) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const logData = {
          user_id: req.user?._id,
          org_id: req.user?.org_id,
          action,
          resource_type: resourceType,
          resource_id: req.params.id || req.body._id,
          details: {
            method: req.method,
            url: req.originalUrl,
            body: req.method !== "GET" ? req.body : undefined,
          },
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.get("User-Agent"),
        };

        // Create audit log asynchronously
        AuditLog.create(logData).catch((err) => {
          console.error("Failed to create audit log:", err);
        });
      }

      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = {
  generateToken,
  verifyToken,
  requireRole,
  requireOrgAccess,
  auditLog,
};
