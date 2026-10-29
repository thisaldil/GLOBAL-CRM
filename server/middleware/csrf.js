const requireTrustedOrigin = (allowedOrigins) => (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  const origin = req.get("origin");
  if (origin && !allowedOrigins.includes(origin.replace(/\/$/, ""))) {
    return res.status(403).json({ message: "Request origin is not allowed." });
  }

  return next();
};

module.exports = { requireTrustedOrigin };
