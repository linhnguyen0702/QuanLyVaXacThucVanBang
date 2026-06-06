const express = require('express');
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint' });
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint' });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', (req, res) => {
  res.json({ message: 'Get current user endpoint' });
});

module.exports = router;
