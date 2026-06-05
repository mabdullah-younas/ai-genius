const jwt = require('jsonwebtoken');

// ── GENERATE ACCESS TOKEN (short-lived, 15 minutes) ───────
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES,
  });
};

// ── GENERATE REFRESH TOKEN (long-lived, 7 days) ───────────
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES,
  });
};

// ── COOKIE OPTIONS FOR REFRESH TOKEN ──────────────────────
const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

module.exports = { generateAccessToken, generateRefreshToken, refreshCookieOptions };