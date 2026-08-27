const User = require('../models/User');
const Session = require('../models/Session');
const Activity = require('../models/Activity');
const { generateTokens, setTokenCookies, clearTokenCookies, verifyRefreshToken } = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/mailer');
const crypto = require('crypto');

// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email address is already registered' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      avatar: avatar || '',
      verificationToken,
      isVerified: true, // Seamless onboarding default
    });

    // Send async verification email
    sendVerificationEmail(user.email, verificationToken).catch(console.error);

    const { accessToken, refreshToken } = generateTokens(user._id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await Session.create({
      userId: user._id,
      refreshToken,
      device: req.headers['user-agent'] || 'Unknown Browser',
      ip: req.ip || '127.0.0.1',
      expiresAt,
    });

    setTokenCookies(res, accessToken, refreshToken);

    await Activity.create({
      userId: user._id,
      action: 'CREATE',
      description: 'Account created successfully',
    });

    res.status(201).json({
      message: 'Registration successful!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        settings: user.settings,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000);

    await Session.create({
      userId: user._id,
      refreshToken,
      device: req.headers['user-agent'] || 'Browser',
      ip: req.ip || '127.0.0.1',
      expiresAt,
    });

    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        settings: user.settings,
        lastLogin: user.lastLogin,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await Session.deleteOne({ refreshToken });
    }
    clearTokenCookies(res);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/logout-all
const logoutAll = async (req, res, next) => {
  try {
    await Session.deleteMany({ userId: req.user._id });
    clearTokenCookies(res);
    res.status(200).json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/refresh
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    const decoded = verifyRefreshToken(token);
    const session = await Session.findOne({ refreshToken: token });
    if (!session) {
      return res.status(401).json({ message: 'Invalid or revoked session' });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
    session.refreshToken = newRefreshToken;
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await session.save();

    setTokenCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    clearTokenCookies(res);
    res.status(401).json({ message: 'Session expired, please login again' });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, theme, settings } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (theme) user.settings.theme = theme;
    if (settings) user.settings = { ...user.settings, ...settings };

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        settings: user.settings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json({ message: 'If the email exists, a password reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully. Please login.' });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/sessions
const getActiveSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ sessions });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/verify-email
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Verification token is required' });

    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/auth/change-email
const changeEmail = async (req, res, next) => {
  try {
    const { newEmail, password } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const existing = await User.findOne({ email: newEmail.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email address is already in use' });
    }

    user.email = newEmail.toLowerCase();
    await user.save();

    res.status(200).json({ message: 'Email address updated successfully', email: user.email });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
