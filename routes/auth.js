const express = require('express');
const bcrypt = require('bcryptjs');
const { dbRun, dbGet } = require('../database');

const router = express.Router();

/*
 Register a new user
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, age } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Name, email, and password are required' 
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    // Check if user already exists
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Email already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await dbRun(
      'INSERT INTO users (name, email, password, age) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, age || null]
    );

    const userId = result.lastID;

    // Initialize learning progress for new user
    await dbRun(
      'INSERT INTO learning_progress (user_id) VALUES (?)',
      [userId]
    );

    // Set session
    req.session.user = { id: userId, email };

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: userId, name, email, age },
      success: true
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'Error registering user',
      error: error.message 
    });
  }
});

/*
 Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Set session
    req.session.user = { id: user.id, email: user.email };

    res.json({
      message: 'Login successful',
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        age: user.age 
      },
      success: true
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error logging in',
      error: error.message 
    });
  }
});

/*
 Check authentication status
 */
router.get('/status', (req, res) => {
    if (req.session.user) {
        res.json({
            loggedIn: true,
            user: req.session.user
        });
    } else {
        res.json({
            loggedIn: false
        });
    }
});

/*
 Logout user
 */
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out, please try again' });
        }
        res.clearCookie('connect.sid'); // The default cookie name for express-session
        res.json({ message: 'Logout successful' });
    });
});

module.exports = router;
