const express = require("express");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const session = require('express-session');

// Database initialization
require('./database');

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false
}));


// API Routes
const authRoutes = require('./routes/auth');
const translatorRoutes = require('./routes/translator');
const learningRoutes = require('./routes/learning');
const healthRoutes = require('./routes/health');

const { checkAuth } = require('./middleware/auth');

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);
app.use('/api/translator', translatorRoutes);

// Protected routes (authentication required)
app.use('/api/learning', checkAuth, learningRoutes);
app.use('/api/health', checkAuth, healthRoutes);

// Serve main HTML file
app.get("/", async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check endpoint
app.get('/api/health-check', (req, res) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path 
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`http://localhost:${port}`);
  console.log(`API Documentation:`);
  console.log(`- Public Translator: GET /api/translator/word-to-gesture?word=hello`);
  console.log(`- User Signup: POST /api/auth/signup`);
  console.log(`- User Login: POST /api/auth/login`);
  console.log(`- Learning Progress: GET /api/learning/progress (requires auth)`);
  console.log(`- Health Metrics: GET /api/health/metrics (requires auth)`);
});

module.exports = app;
