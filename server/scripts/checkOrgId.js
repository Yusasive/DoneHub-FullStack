const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

async function checkUserOrgId() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/donehub"
    );

    // Find your org_admin user without population
    const userRaw = await User.findOne({
      role: "org_admin",
      email: "temidayoabdullah@gmail.com",
    });

    console.log("🔍 Raw user org_id (should be ObjectId):");
    console.log("Type:", typeof userRaw.org_id);
    console.log("Value:", userRaw.org_id);
    console.log(
      "Is ObjectId?",
      mongoose.Types.ObjectId.isValid(userRaw.org_id)
    );
    console.log("String conversion:", String(userRaw.org_id));

    // Check if it's actually an ObjectId
    if (
      userRaw.org_id &&
      typeof userRaw.org_id === "object" &&
      userRaw.org_id._id
    ) {
      console.log("❌ PROBLEM: org_id contains an object instead of ObjectId!");
      console.log("Fixing by setting org_id to the actual _id...");

      userRaw.org_id = userRaw.org_id._id;
      await userRaw.save();

      console.log("✅ Fixed! org_id is now:", userRaw.org_id);
    } else {
      console.log("✅ org_id looks correct");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.disconnect();
  }
}

checkUserOrgId();
