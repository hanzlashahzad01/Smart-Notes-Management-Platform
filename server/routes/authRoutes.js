const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  logoutAll,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  changeEmail,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getActiveSessions,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/logout-all', protect, logoutAll);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/change-email', protect, changeEmail);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/sessions', protect, getActiveSessions);

module.exports = router;
