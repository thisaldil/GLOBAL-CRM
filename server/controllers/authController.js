const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 🔹 Utility: Create new user
const createUser = async ({ sub, name, email, picture }) => {
  const user = new User({
    googleId: sub,
    name,
    email,
    picture,
  });
  await user.save();
  return user;
};

// 🔹 Login handler for token-based login (GoogleLogin → backend)
const handleGoogleToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token missing" });

    // Verify token using Google's library
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, name, email, picture } = payload;

    let user = await User.findOne({ googleId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate app token
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    user.token = jwtToken;
    await user.save();

    return res.status(200).json({
      message: "Authentication successful",
      token: jwtToken,
      user: {
        googleId,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
      userId: user._id,
    });
  } catch (err) {
    console.error("Google Token Error:", err);
    return res
      .status(500)
      .json({ message: "Failed to authenticate with Google" });
  }
};

// 🔹 Register handler if token from GoogleLogin and no user exists
const handleGoogleRegister = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token missing" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, name, email, picture } = payload;

    let existingUser = await User.findOne({ googleId });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = await createUser({ sub: googleId, name, email, picture });

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    user.token = jwtToken;
    await user.save();

    return res.status(200).json({
      message: "Registration successful",
      token: jwtToken,
      user: {
        googleId,
        name,
        email,
        picture,
      },
      userId: user._id,
    });
  } catch (err) {
    console.error("Google Register Error:", err);
    return res.status(500).json({ message: "Google registration failed" });
  }
};

// 🔹 Optional: Redirect-based login handler (if you still keep passport flow)
const handleGoogleRedirect = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  req.user.token = token;
  await req.user.save();

  res.status(200).json({
    message: "Redirect login successful",
    user: req.user,
    token,
  });
};

module.exports = {
  handleGoogleToken,
  handleGoogleRegister,
  handleGoogleRedirect,
};
