const ApiError = require('../utils/ApiError');

// In-memory rate limiter per user/IP
function rateLimit({ windowMs, max }) {
  const hits = new Map();

  return (req, res, next) => {
    if (process.env.NODE_ENV === 'test') return next();

    const key = req.user ? `user-${req.user.id}` : req.ip;
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      throw new ApiError(429, 'Too many requests, please wait a moment and try again');
    }
    next();
  };
}

module.exports = rateLimit;
