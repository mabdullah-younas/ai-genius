const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, refreshCookieOptions } = require('../config/jwt');

// ── REGISTER ──────────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required.',
      });
    }

    const user = await User.create({ email, password, role });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully.',
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.log('ERROR CAUGHT:', err.message);
    console.log('next type:', typeof next);
    next(err);
  }
};


// ── LOGIN ─────────────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. check if email and password were provided
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required.',
      });
    }

    // 2. find user — explicitly select password (hidden by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    // 3. build token payload
    const payload = { id: user._id, email: user.email, role: user.role };

    // 4. generate both tokens
    const accessToken  = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // 5. save refresh token in DB (whitelist)
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // 6. send refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    // 7. send access token in JSON response
    res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      accessToken,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// ── REFRESH TOKEN ─────────────────────────────────────────
// POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    // 1. read refresh token from cookie
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No refresh token. Please log in.',
      });
    }

    // 2. verify the token signature
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token invalid or expired. Please log in again.',
      });
    }

    // 3. check token exists in DB (not logged out)
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({
        status: 'error',
        message: 'Refresh token reuse detected. Please log in again.',
      });
    }

    // 4. issue new access token
    const payload      = { id: user._id, email: user.email, role: user.role };
    const accessToken  = generateAccessToken(payload);

    res.status(200).json({
      status: 'success',
      message: 'Access token refreshed.',
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

// ── LOGOUT ────────────────────────────────────────────────
// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      // remove token from DB so it can't be reused
      await User.findOneAndUpdate(
        { refreshToken: token },
        { refreshToken: null }
      );
    }
    res.clearCookie('refreshToken', refreshCookieOptions);
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout };