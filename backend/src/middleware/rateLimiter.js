const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  // Read-only counselor-ticket GETs are polled by the chat screen; they are covered by pollLimiter instead.
  skip: (req) => req.method === 'GET' && req.originalUrl.startsWith('/api/counselor-tickets'),
  message: {
    success: false,
    message: 'Too many requests. Please try again shortly.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth attempts. Please try again in a few minutes.'
  }
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'You are sending messages too quickly. Please slow down.'
  }
});

// Generous per-minute cap for the chat screen's background refreshes.
const pollLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Refreshing too quickly. Please wait a moment.'
  }
});

module.exports = { apiLimiter, authLimiter, chatLimiter, pollLimiter };
