const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Developer Admin Key bypass for developer/admin access
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  const validDevKey = process.env.ADMIN_DEV_KEY || 'pubseal_dev_admin_2026';
  if (adminKey && adminKey === validDevKey) {
    req.user = {
      _id: new mongoose.Types.ObjectId('000000000000000000000001'),
      name: 'System Developer / Administrator',
      email: 'admin@pubseal.internal',
      role: 'admin',
    };
    return next();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Authentication token missing.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pubseal_fallback_secret_key');
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or expired token.',
    });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pubseal_fallback_secret_key');
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Silently continue without user
  }
  next();
};

const requireAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  const validDevKey = process.env.ADMIN_DEV_KEY || 'pubseal_dev_admin_2026';

  if ((req.user && req.user.role === 'admin') || (adminKey && adminKey === validDevKey)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. The database repository is restricted to administrators and developers only.',
  });
};

module.exports = {
  protect,
  optionalAuth,
  requireAdmin,
};

