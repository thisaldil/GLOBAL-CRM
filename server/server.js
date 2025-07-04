// server.js

// ✅ 1. Import all necessary dependencies
// The dotenv library is loaded to use environment variables.
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./database"); // Assuming the connection logic is in this file
const crypto = require("crypto");
const cookieSession = require("cookie-session"); // 🚨 Essential for Passport sessions

// ✅ 2. Create the Express app instance
const app = express();

// ✅ 3. Connect to MongoDB
// This function call will be executed during the serverless "cold start."
// We don't need to listen for a port here, as Vercel handles the listener.
connectDB().catch((err) => {
  console.error("MongoDB connection error:", err);
});

// ✅ 4. Set up Middlewares

// Define CORS options once for clarity and reusability
const corsOptions = {
  origin: process.env.FRONTEND_URL, // Use environment variable for flexibility
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS", // Explicitly allow all methods
  exposedHeaders: ["Content-Type", "Authorization"], // Expose necessary headers
};

// Apply CORS middleware to all requests
app.use(cors(corsOptions));

// 🚨 FIX: Explicitly handle CORS preflight OPTIONS requests for all routes.
// This is a crucial step for serverless platforms like Vercel to ensure the
// preflight handshake succeeds before the actual request is sent.
app.options("*", cors(corsOptions));

// Body Parser Middleware to parse JSON request bodies
app.use(express.json());

// 🚨 Cookie Session Middleware for Passport.js
// This creates a cookie-based session to store user information after authentication.
// It is required for passport.session() to function correctly.
app.use(
  cookieSession({
    name: "session", // `keys` should be an array of secret keys to sign the session cookie. // Use an environment variable to keep it secret.
    keys: [process.env.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours // Set `secure` to true in production if you are using HTTPS (which Vercel does). // `sameSite` should be 'none' for cross-site cookie support with `credentials: true`.
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  })
);

// 🚨 Initialize Passport and its session middleware
// These must be used after the session middleware (cookieSession).
app.use(passport.initialize());
app.use(passport.session());

// ✅ 5. Require and set up Passport and Mongoose Models
// These files contain your Mongoose schema and Passport.js strategy logic.
require("./models/User"); // Path to your User Mongoose model
require("./services/passport"); // Path to your Passport configuration

// ✅ 6. Require and use Route handlers
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const templateRoutes = require("./routes/templateRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const ocrRoutes = require("./routes/ocrRoutes");
const customerRoutes = require("./routes/customerRoutes");
const emailTemplateRoutes = require("./routes/emailTemplateRoutes");

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/template", templateRoutes);
app.use("/invoice", invoiceRoutes);
app.use("/ocr", ocrRoutes);
app.use("/customers", customerRoutes);
app.use("/email-templates", emailTemplateRoutes);

// ✅ 7. Custom API Route: Cloudinary Signature Generation
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

// ✅ 8. Root test route
// A simple route to check if the function is running.
app.get("/", (req, res) => {
  res.send("CRM Backend is running.");
});

// ✅ 9. EXPORT THE EXPRESS APP FOR VERCEL
// This is the most critical step for Vercel deployment.
// You no longer need to use `app.listen()` or `serverless-http`.
// Vercel's `@vercel/node` runtime will handle the HTTP server for you.
module.exports = app;
