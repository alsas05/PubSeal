const express = require('express');
const router = express.Router();
const {
  register,
  login,
  socialLogin,
  verifyEmail,
  verifyEmailByToken,
  resendVerification,
  getDevLatestEmail,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Public registration & authentication
router.post('/register', register);
router.post('/login', login);
router.post('/social-login', socialLogin);

// Email verification endpoints
router.post('/verify-email', optionalAuth, verifyEmail);
router.get('/verify-email/:token', verifyEmailByToken);
router.post('/resend-verification', optionalAuth, resendVerification);

// Developer email preview inspector (local debugging)
router.get('/dev-latest-email', getDevLatestEmail);

// Protected account routes
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

module.exports = router;
