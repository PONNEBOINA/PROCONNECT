import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Check if user is suspended
    const dbUser = await User.findById(user.userId);
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (dbUser.isSuspended) {
      return res.status(403).json({ message: 'Your account is suspended. Contact admin.' });
    }

    req.user = user;
    req.user.role = dbUser.role;
    next();
  });
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};
