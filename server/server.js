// ✅ Import all dependencies
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("../database"); // Assuming this connects to MongoDB
const crypto = require("crypto");
const cookieSession = require("cookie-session"); // 🚨 Add this for sessions

const app = express();

// ✅ Connect to MongoDB (connect once and reuse the connection)
// This will be executed during the cold start.
connectDB().catch((err) => {
  console.error("MongoDB connection error:", err);
});

// ✅ Middlewares
app.use(
  cors({
    origin: "https://global-crm.vercel.app",
    credentials: true,
  })
);
app.use(express.json());

// 🚨 Use cookie-session for Passport authentication
app.use(
  cookieSession({
    name: "session",
    // 🚨 Use a secret from environment variables
    keys: [process.env.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.use(passport.initialize());
app.use(passport.session()); // 🚨 Use passport session middleware

// ✅ Models & Passport
require("../models/User");
require("../services/passport");

// ✅ Routes
const authRoutes = require("../routes/authRoutes");
const userRoutes = require("../routes/userRoutes");
const templateRoutes = require("../routes/templateRoutes");
const invoiceRoutes = require("../routes/invoiceRoutes");
const ocrRoutes = require("../routes/ocrRoutes");

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/template", templateRoutes);
app.use("/invoice", invoiceRoutes);
app.use("/ocr", ocrRoutes);

// ✅ Signature API
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

app.post("/generate-signature", (req, res) => {
  try {
    const { timestamp } = req.body;
    if (!timestamp) {
      return res.status(400).json({ error: "Timestamp is required" });
    }
    const signature = crypto
      .createHash("sha1")
      .update(`timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
      .digest("hex");
    res.json({ signature });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("CRM Backend is running.");
});

// 🚨 Export the app for Vercel, don't use `serverless-http`
module.exports = app;
