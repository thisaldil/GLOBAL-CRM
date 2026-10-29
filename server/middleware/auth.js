const jwt = require("jsonwebtoken");
const User = require("../models/User");

const COOKIE_NAME = "auth_token";

const getToken = (req) => {
  const cookieToken = req.cookies?.[COOKIE_NAME];
  if (cookieToken) return cookieToken;

  const authorization = req.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice(7);
  }

  return null;
};

const authenticate = async (req, res, next) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: "Authentication required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "Authentication required" });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication required" });
  }
};

const setAuthCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });
};

module.exports = { authenticate, setAuthCookie, COOKIE_NAME };
