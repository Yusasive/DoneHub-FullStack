const mongoose = require("mongoose");
const User = require("../models/User");
const Organization = require("../models/Organization");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/donehub"
);

async function diagnoseAndFixOrgAdmin() {
  try {
    console.log("🔍 Diagnosing org_admin users...\n");

    // Find all org_admin users
    const orgAdmins = await User.find({ role: "org_admin" }).populate("org_id");

    console.log(`Found ${orgAdmins.length} org_admin users:`);
    console.log("=".repeat(50));

    for (const admin of orgAdmins) {
      console.log(`\n👤 User: ${admin.name} (${admin.email})`);
      console.log(`   ID: ${admin._id}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Status: ${admin.status}`);
      console.log(`   Org ID: ${admin.org_id || "MISSING ❌"}`);

      if (admin.org_id) {
        console.log(`   Organization: ${admin.org_id.name || "Unknown"}`);
        console.log(`   Org Status: ${admin.org_id.status || "Unknown"}`);
      }
    }

    // Find organizations without admins
    console.log("\n\n🏢 Checking organizations...");
    console.log("=".repeat(50));

    const organizations = await Organization.find({});

    for (const org of organizations) {
      const adminCount = await User.countDocuments({
        org_id: org._id,
        role: "org_admin",
      });

      console.log(`\n🏢 Organization: ${org.name}`);
      console.log(`   ID: ${org._id}`);
      console.log(`   Status: ${org.status}`);
      console.log(`   Admin Count: ${adminCount}`);

      if (adminCount === 0) {
        console.log("   ⚠️  NO ADMIN ASSIGNED!");
      }
    }

    // Find the most recent org_admin that might need fixing
    const recentOrgAdmin = await User.findOne({
      role: "org_admin",
    }).sort({ createdAt: -1 });

    if (recentOrgAdmin && !recentOrgAdmin.org_id) {
      console.log("\n\n🔧 FIXING RECENT ORG ADMIN...");
      console.log("=".repeat(50));

      // Find the most recent organization
      const recentOrg = await Organization.findOne().sort({ createdAt: -1 });

      if (recentOrg) {
        console.log(
          `\n✅ Assigning org_admin ${recentOrgAdmin.name} to organization ${recentOrg.name}`
        );

        recentOrgAdmin.org_id = recentOrg._id;
        await recentOrgAdmin.save();

        console.log("✅ Fixed! The org_admin now has a valid org_id.");
      } else {
        console.log("❌ No organization found to assign to the admin.");
      }
    }

    console.log("\n\n📋 SUMMARY:");
    console.log("=".repeat(50));

    const fixedAdmins = await User.find({
      role: "org_admin",
      org_id: { $exists: true, $ne: null },
    }).populate("org_id");

    console.log(
      `✅ ${fixedAdmins.length} org_admin users with valid organizations`
    );

    const brokenAdmins = await User.find({
      role: "org_admin",
      $or: [{ org_id: { $exists: false } }, { org_id: null }],
    });

    console.log(
      `❌ ${brokenAdmins.length} org_admin users without organizations`
    );

    if (brokenAdmins.length > 0) {
      console.log("\n🔧 To manually fix broken admins:");
      for (const admin of brokenAdmins) {
        console.log(
          `   db.users.updateOne({_id: ObjectId("${admin._id}")}, {$set: {org_id: ObjectId("ORGANIZATION_ID_HERE")}})`
        );
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the diagnostic
diagnoseAndFixOrgAdmin();
