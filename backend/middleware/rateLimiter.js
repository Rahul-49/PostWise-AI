const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' },
  skip: () => process.env.NODE_ENV === 'test',
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 AI requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Rate limit exceeded for AI generation endpoints. Please wait a few minutes before trying again.' },
  skip: () => process.env.NODE_ENV === 'test',
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please slow down.' },
  skip: () => process.env.NODE_ENV === 'test',
});

module.exports = {
  authLimiter,
  aiLimiter,
  apiLimiter,
};
