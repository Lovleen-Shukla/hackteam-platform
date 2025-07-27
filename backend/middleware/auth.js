// backend/middleware/auth.js (VERIFIED CORRECT)
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Authentication failed: User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Authentication failed: Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Authentication failed: Token expired' });
    }
    // For any other unexpected error during authentication process, return 500
    res.status(500).json({ error: 'Server error during authentication' }); // Changed to 500, was 401
  }
};

module.exports = auth;