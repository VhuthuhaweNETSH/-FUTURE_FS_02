const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Setup admin user (run once)
router.get('/setup', async (req, res) => {
  try {
    const existing = await User.findOne({ username: 'admin' });
    if (existing) {
      return res.json({ message: 'Admin already exists' });
    }

    const admin = new User({ 
      username: 'admin', 
      password: 'admin123' 
    });
    await admin.save();
    res.json({ message: 'Admin created! Login with: admin / admin123' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { id: user._id, username: user.username } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;