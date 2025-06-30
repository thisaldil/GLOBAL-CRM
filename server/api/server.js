require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./database");
const crypto = require("crypto");

const app = express();

// ✅ Use localhost frontend origin during development
app.use(
  cors({
    origin: "http://localhost:3000", // 👉 replace with deployed frontend URL for production
    credentials: true,
  })
);

app.use(express.json());
app.use(passport.initialize());

require("./models/User");
require("./services/passport");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

// ✅ Main API routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

// ✅ Cloudinary Signature API
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

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.send("CRM Backend API running on localhost");
});

// ✅ Start Express server after DB connects
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

/* ❌ FOR VERCEL SERVERLESS DEPLOYMENT (DISABLED FOR LOCALHOST)
const serverless = require("serverless-http");
module.exports = serverless(app);
*/
