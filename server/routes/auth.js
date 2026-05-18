// server/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ─── Helper: generate JWT ─────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, stylePreferences, favoriteColors } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      const user = await User.create({ name, email, password, stylePreferences, favoriteColors });
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id);
      res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  const { name, stylePreferences, favoriteColors } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, stylePreferences, favoriteColors },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
