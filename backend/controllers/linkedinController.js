const LinkedInToken = require('../models/LinkedInToken');
const linkedinService = require('../services/linkedinService');

// GET /api/linkedin/auth/url
exports.getAuthUrl = async (req, res) => {
  try {
    const url = linkedinService.getAuthUrl();
    res.json({ url });
  } catch (err) {
    console.error('LinkedIn auth URL error:', err);
    res.status(500).json({ message: 'Failed to generate auth URL' });
  }
};

// GET /api/linkedin/auth/callback?code=...&state=...
exports.callback = async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ message: 'Missing code parameter' });
  }
  try {
    const { accessToken, refreshToken, expiresAt } = await linkedinService.exchangeCode(code);
    const userId = req.user ? req.user.id : null; // auth middleware should set req.user
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    await LinkedInToken.findOneAndUpdate(
      { user: userId },
      { accessToken, refreshToken, expiresAt },
      { upsert: true, new: true }
    );
    // Simple success page; you may redirect to frontend instead.
    res.send('<h2>LinkedIn authorization successful. You may close this window.</h2>');
  } catch (err) {
    console.error('LinkedIn callback error:', err);
    res.status(500).json({ message: 'LinkedIn authorization failed', error: err.message });
  }
};
