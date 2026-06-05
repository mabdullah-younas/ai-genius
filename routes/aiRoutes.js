const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { getFreeModel, postPremiumModel, purgeCache } = require('../controllers/aiController');

// all routes below require a valid access token
router.use(protect);

// GET /api/ai/free-model — all logged in users
router.get('/free-model', getFreeModel);

// POST /api/ai/premium-model — Premium_User and Admin only
router.post('/premium-model', restrictTo('Premium_User', 'Admin'), postPremiumModel);

// DELETE /api/ai/purge-cache — Admin only
router.delete('/purge-cache', restrictTo('Admin'), purgeCache);

module.exports = router;