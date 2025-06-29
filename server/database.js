const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.URI;

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState === 1;

    if (isConnected && process.env.NODE_ENV !== "deployment") {
      console.log("✅ Database connected");
    }
  } catch (err) {
    console.error("❌ Database connection error: " + err.message);
    throw err;
  }
};

module.exports = connectDB;
