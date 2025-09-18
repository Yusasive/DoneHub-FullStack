const mongoose = require("mongoose");
const User = require("../models/User");
const Organization = require("../models/Organization");
require("dotenv").config();

async function quickFix() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/donehub"
    );

    // Find the first org_admin without org_id
    const orgAdmin = await User.findOne({
      role: "org_admin",
      $or: [{ org_id: { $exists: false } }, { org_id: null }],
    });

    if (!orgAdmin) {
      console.log("✅ No org_admin users need fixing");
      return;
    }

    // Find the first organization
    const organization = await Organization.findOne({});

    if (!organization) {
      console.log("❌ No organization found");
      return;
    }

    // Assign the organization to the admin
    orgAdmin.org_id = organization._id;
    await orgAdmin.save();

    console.log(
      `✅ Fixed! Assigned ${orgAdmin.name} (${orgAdmin.email}) to organization ${organization.name}`
    );
    console.log(`   User ID: ${orgAdmin._id}`);
    console.log(`   Org ID: ${organization._id}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.disconnect();
  }
}

quickFix();
