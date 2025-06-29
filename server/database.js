const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.URI;

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    // Add timeout configurations
    const db = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    });

    isConnected = db.connections[0].readyState === 1;

    if (isConnected && process.env.NODE_ENV !== "deployment") {
      console.log("✅ Database connected");
    }

    return db.connection;
  } catch (err) {
    console.error("❌ Database connection error: " + err.message);
    isConnected = false;
    throw err;
  }
};

module.exports = connectDB;
