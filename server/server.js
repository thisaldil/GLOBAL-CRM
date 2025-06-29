require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./database");
const crypto = require("crypto");
const serverless = require("serverless-http");

require("./models/User");
require("./services/passport");

const app = express();

// Middleware
app.use(
  cors({
    origin: "https://global-crm.vercel.app",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" })); // Add size limit
app.use(passport.initialize());

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    return res.status(500).json({ error: "Database connection failed" });
  }
});

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/auth", authRoutes);
app.use("/user", userRoutes);

// Cloudinary Signature Route
app.post("/generate-signature", (req, res) => {
  try {
    const { timestamp } = req.body;
    if (!timestamp) {
      return res.status(400).json({ error: "Timestamp is required" });
    }

    const signature = crypto
      .createHash("sha1")
      .update(`timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
      .digest("hex");

    res.json({ signature });
  } catch (error) {
    console.error("Signature Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("✅ CRM Backend API is running.");
});

// Export for Vercel
module.exports = serverless(app);
