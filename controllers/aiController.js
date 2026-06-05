// ── FREE MODEL ────────────────────────────────────────────
// GET /api/ai/free-model — all logged in users
const getFreeModel = (req, res) => {
  res.status(200).json({
    status: 'success',
    model: 'free-text-v1',
    message: `Hello ${req.user.email}! Here is your free AI response.`,
    output: 'The quick brown fox jumps over the lazy dog. [Free Tier Output]',
    accessedBy: req.user,
  });
};

// ── PREMIUM MODEL ─────────────────────────────────────────
// POST /api/ai/premium-model — Premium_User and Admin only
const postPremiumModel = (req, res) => {
  const { prompt } = req.body;
  res.status(200).json({
    status: 'success',
    model: 'premium-image-gen-v3',
    message: `Premium model accessed by ${req.user.role}.`,
    prompt: prompt || 'No prompt provided',
    output: '[High-resolution AI-generated image data would be here]',
    tokensUsed: 450,
    accessedBy: req.user,
  });
};

// ── PURGE CACHE ───────────────────────────────────────────
// DELETE /api/ai/purge-cache — Admin only
const purgeCache = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AI model cache purged successfully.',
    purgedAt: new Date().toISOString(),
    performedBy: req.user,
  });
};

module.exports = { getFreeModel, postPremiumModel, purgeCache };