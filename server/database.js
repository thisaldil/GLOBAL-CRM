const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.URI;

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
