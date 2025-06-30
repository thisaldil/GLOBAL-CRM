const mongoose = require("mongoose");
require("dotenv").config();

// Get MongoDB URI from environment variables
const uri = process.env.URI;

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Optional console log for development
    if (process.env.NODE_ENV !== "deployment") {
      console.log("✅ MongoDB connected successfully");
    }
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
