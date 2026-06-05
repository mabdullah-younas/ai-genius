const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── PROTECT ───────────────────────────────────────────────
// Verifies access token on every protected request
const protect = async (req, res, next) => {
  try {
    // 1. check Authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided. Please log in.',
      });
    }

    // 2. extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // 3. verify token signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired. Please refresh your token.',
        });
      }
      return res.status(401).json({
        status: 'error',
        code: 'TOKEN_INVALID',
        message: 'Invalid token. Please log in again.',
      });
    }

    // 4. check user still exists in DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User no longer exists.',
      });
    }

    // 5. attach user payload to request
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    next(err);
  }
};

// ── RESTRICT TO ───────────────────────────────────────────
// Checks if logged-in user has the required role
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Access forbidden. Required: ${roles.join(', ')}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };