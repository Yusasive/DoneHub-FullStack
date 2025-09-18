const mongoose = require("mongoose");
const User = require("../models/User");
const Task = require("../models/Task");
require("dotenv").config();

async function createSampleTasks() {
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

    // Extract org_id
    let orgId = orgAdmin.org_id;
    if (orgId && typeof orgId === "object" && orgId._id) {
      orgId = orgId._id;
    }

    console.log(`✅ Found org admin: ${orgAdmin.name}`);
    console.log(`📋 Organization ID: ${orgId}`);

    // Check if tasks already exist
    const existingTasks = await Task.countDocuments({ org_id: orgId });
    console.log(`📊 Existing tasks: ${existingTasks}`);

    if (existingTasks > 0) {
      console.log("⚠️  Tasks already exist. Skipping creation.");
      return;
    }

    // Create sample tasks
    const sampleTasks = [
      {
        title: "Complete project documentation",
        description: "Finalize the technical documentation for the new feature",
        status: "completed",
        priority: "high",
        assigned_to: orgAdmin._id,
        created_by: orgAdmin._id,
        org_id: orgId,
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        title: "Review team performance metrics",
        description: "Analyze Q3 performance data and prepare recommendations",
        status: "completed",
        priority: "medium",
        assigned_to: orgAdmin._id,
        created_by: orgAdmin._id,
        org_id: orgId,
        due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        title: "Setup new employee onboarding process",
        description:
          "Create standardized onboarding workflow for new team members",
        status: "completed",
        priority: "high",
        assigned_to: orgAdmin._id,
        created_by: orgAdmin._id,
        org_id: orgId,
        due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      },
      {
        title: "Plan Q4 strategic objectives",
        description: "Define key goals and milestones for the upcoming quarter",
        status: "in_progress",
        priority: "high",
        assigned_to: orgAdmin._id,
        created_by: orgAdmin._id,
        org_id: orgId,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        title: "Update team communication guidelines",
        description:
          "Revise internal communication protocols and best practices",
        status: "todo",
        priority: "medium",
        assigned_to: orgAdmin._id,
        created_by: orgAdmin._id,
        org_id: orgId,
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
      {
        title: "Conduct monthly team meeting",
        description: "Regular monthly check-in with all team members",
        status: "todo",
        priority: "low",
        assigned_to: orgAdmin._id,
        created_by: orgAdmin._id,
        org_id: orgId,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
    ];

    // Insert sample tasks
    const insertedTasks = await Task.insertMany(sampleTasks);

    console.log(`✅ Created ${insertedTasks.length} sample tasks:`);
    insertedTasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.title} (${task.status})`);
    });

    // Show stats
    const [completed, active, total] = await Promise.all([
      Task.countDocuments({ org_id: orgId, status: "completed" }),
      Task.countDocuments({ org_id: orgId, status: { $ne: "completed" } }),
      Task.countDocuments({ org_id: orgId }),
    ]);

    console.log("\n📊 Task Statistics:");
    console.log(`   Total Tasks: ${total}`);
    console.log(`   Completed: ${completed}`);
    console.log(`   Active: ${active}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.disconnect();
  }
}

createSampleTasks();
