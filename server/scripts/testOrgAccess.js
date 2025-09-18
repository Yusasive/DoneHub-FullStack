const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

async function testOrgAccess() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/donehub"
    );

    // Find your org_admin user
    const orgAdmin = await User.findOne({
      role: "org_admin",
      email: "temidayoabdullah@gmail.com",
    });

    if (!orgAdmin) {
      console.log("❌ Org admin user not found");
      return;
    }

    console.log("✅ Found org admin user:");
    console.log("   ID:", orgAdmin._id);
    console.log("   Name:", orgAdmin.name);
    console.log("   Email:", orgAdmin.email);
    console.log("   Role:", orgAdmin.role);
    console.log("   Status:", orgAdmin.status);
    console.log("   org_id type:", typeof orgAdmin.org_id);
    console.log("   org_id value:", orgAdmin.org_id);

    // Check if org_id is populated or just an ObjectId
    if (
      orgAdmin.org_id &&
      typeof orgAdmin.org_id === "object" &&
      orgAdmin.org_id._id
    ) {
      console.log("⚠️  org_id is populated object");
      console.log("   Extracted _id:", orgAdmin.org_id._id);
    } else {
      console.log("✅ org_id is ObjectId");
    }

    // Test organization lookup
    const Organization = require("../models/Organization");
    const org = await Organization.findById(orgAdmin.org_id);

    if (org) {
      console.log("✅ Organization found:");
      console.log("   Name:", org.name);
      console.log("   Status:", org.status);
    } else {
      console.log("❌ Organization not found");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.disconnect();
  }
}

testOrgAccess();
