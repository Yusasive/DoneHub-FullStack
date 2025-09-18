const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const createAdmin = async (email, password, name) => {
  if (!email || !password || !name) {
    console.error("Please provide email, password, and name.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existingAdmin = await User.findOne({ role: "system_admin" });
    if (existingAdmin) {
      console.log("A system admin already exists.");
      const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      readline.question(
        "Do you want to create another one? (y/n): ",
        async (answer) => {
          if (answer.toLowerCase() === "y") {
            await createUser(email, password, name);
          }
          readline.close();
          process.exit(0);
        }
      );
    } else {
      await createUser(email, password, name);
      process.exit(0);
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

const createUser = async (email, password, name) => {
  const user = new User({
    name,
    email,
    password: password,
    role: "system_admin",
    status: "active",
    emailVerified: true,
  });
  await user.save();
  console.log("System admin user created successfully!");
};

const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4];

createAdmin(email, password, name);
