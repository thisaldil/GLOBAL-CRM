const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  const uri = process.env.URI; // ✅ This must match your env var key exactly
  if (!uri) {
    throw new Error("❌ MONGO_URI is not defined in environment variables.");
  }

  try {
    await mongoose.connect(uri);
    if (process.env.NODE_ENV !== "deployment") {
      console.log("✅ MongoDB connected successfully");
    }
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
