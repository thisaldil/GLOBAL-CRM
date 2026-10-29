const attempts = new Map();

const loginRateLimit = (req, res, next) => {
  const key = `${req.ip}:${String(req.body?.username || "").toLowerCase()}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 10;
  const entry = attempts.get(key);

  if (!entry || now - entry.startedAt > windowMs) {
    attempts.set(key, { startedAt: now, count: 1 });
    return next();
  }

  entry.count += 1;
  if (entry.count > maxAttempts) {
    return res.status(429).json({ message: "Too many login attempts. Please try again later." });
  }

  return next();
};

setInterval(() => {
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const [key, entry] of attempts) {
    if (entry.startedAt < cutoff) attempts.delete(key);
  }
}, 15 * 60 * 1000).unref();

module.exports = { loginRateLimit };
