require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("../database");
const crypto = require("crypto");
const serverless = require("serverless-http"); // ✅ For Vercel

const app = express();

app.use(
  cors({
    origin: "https://global-crm.vercel.app", // ✅ Must match frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(passport.initialize());

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

// ✅ Root test route (optional)
app.get("/", (req, res) => {
  res.send("CRM Backend is running.");
});

// ✅ Mongo Connect
connectDB().catch((err) => {
  console.error("MongoDB connection error:", err);
});

const serverless = require("serverless-http");
module.exports = serverless(app); // ✅ for Vercel serverless
