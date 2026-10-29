const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { loginRateLimit } = require("../middleware/rateLimit");
const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  authController.handleGoogleRedirect
);

router.post("/google/callback", authController.handleGoogleToken);

router.post("/google/register", authController.handleGoogleRegister);
router.post("/register", authController.handleRegister);
router.post("/login", loginRateLimit, authController.handleLogin);
router.post("/logout", authController.handleLogout);
router.get("/me", authenticate, authController.handleMe);

module.exports = router;