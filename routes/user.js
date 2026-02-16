const express = require('express');
const { dbGet } = require('../database');
const { checkAuth } = require('../middleware/auth');
const path = require('path');

const router = express.Router();

// Serve profile page
router.get('/profile', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'profile.html'));
});

// Get user profile data
router.get('/api/user/profile', checkAuth, async (req, res) => {
    try {
        const user = await dbGet('SELECT id, name, email, age FROM users WHERE id = ?', [req.session.user.id]);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

module.exports = router;
