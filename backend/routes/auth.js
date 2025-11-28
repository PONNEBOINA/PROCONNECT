import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();

// Register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('section').notEmpty().withMessage('Section is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Registration validation errors:', errors.array());
    console.error('Request body:', req.body);
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }

  try {
    const { name, email, password, section, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if trying to register as admin
    if (role === 'admin') {
      // Check if an admin already exists
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin account already exists. Only one admin is allowed.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

    const user = new User({
      name,
      email,
      password: hashedPassword,
      section,
      avatarUrl,
      role: role === 'admin' ? 'admin' : 'user' // Only set admin if explicitly requested and allowed
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        section: user.section,
        role: user.role,
        friends: user.friends,
        friendsCount: user.friendsCount || 0
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: error.toString()
    });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Login validation errors:', errors.array());
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }

  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', user.email, 'ID:', user._id);

    // Check if user is suspended
    if (user.isSuspended) {
      console.log('User is suspended:', email);
      return res.status(403).json({ message: 'Your account is suspended. Contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Password matched, generating token...');

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Token generated successfully');

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        section: user.section,
        role: user.role,
        friends: user.friends,
        friendsCount: user.friendsCount || 0
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: error.toString()
    });
  }
});

export default router;
