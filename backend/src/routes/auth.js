/**
 * Authentication Routes
 * ---------------------
 * Handles user registration, login, and profile retrieval.
 *
 * POST /api/auth/register - Create a new user account
 * POST /api/auth/login    - Authenticate and receive a JWT
 * GET  /api/auth/me       - Get the current user's profile (protected)
 */
const express = require('express');
const router = express.Router();

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const auth = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and return a JWT
 * @access  Public
 */
router.post('/register', validateRegister, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      return next(new Error('User with this email already exists'));
    }

    // Create the user (password is hashed by the pre-save hook)
    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return a JWT
 * @access  Public
 */
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Look up the user by email
    const user = await User.findOne({ email });

    // Verify the user exists and the password matches
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user's profile
 * @access  Private (requires valid JWT)
 */
router.get('/me', auth, async (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    createdAt: req.user.createdAt
  });
});

module.exports = router;
