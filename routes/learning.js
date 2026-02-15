const express = require('express');
const { dbRun, dbGet, dbAll } = require('../database');

const router = express.Router();

/*
  Get user's learning progress
 */
router.get('/progress', async (req, res) => {
  try {
    const userId = req.session.user.id;

    const progress = await dbGet(
      'SELECT * FROM learning_progress WHERE user_id = ?',
      [userId]
    );

    if (!progress) {
      return res.status(404).json({ 
        message: 'Learning progress not found' 
      });
    }

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ 
      message: 'Error fetching learning progress',
      error: error.message 
    });
  }
});

/*
  Update user's learning progress
 */
router.put('/progress', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { gestures_mastered, quiz_accuracy, learning_streak, total_practice_hours } = req.body;

    const updates = [];
    const values = [];

    if (gestures_mastered !== undefined) {
      updates.push('gestures_mastered = ?');
      values.push(gestures_mastered);
    }
    if (quiz_accuracy !== undefined) {
      updates.push('quiz_accuracy = ?');
      values.push(quiz_accuracy);
    }
    if (learning_streak !== undefined) {
      updates.push('learning_streak = ?');
      values.push(learning_streak);
    }
    if (total_practice_hours !== undefined) {
      updates.push('total_practice_hours = ?');
      values.push(total_practice_hours);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    if (updates.length === 1) {
      return res.status(400).json({ 
        message: 'No valid fields to update' 
      });
    }

    const sql = `UPDATE learning_progress SET ${updates.join(', ')} WHERE user_id = ?`;
    await dbRun(sql, values);

    const updated = await dbGet(
      'SELECT * FROM learning_progress WHERE user_id = ?',
      [userId]
    );

    res.json({
      message: 'Progress updated successfully',
      success: true,
      progress: updated
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ 
      message: 'Error updating learning progress',
      error: error.message 
    });
  }
});

/*
 Get user's gesture practice records
 */
router.get('/gestures', async (req, res) => {
  try {
    const userId = req.session.user.id;

    const gestures = await dbAll(
      'SELECT * FROM gesture_records WHERE user_id = ? ORDER BY gesture_name',
      [userId]
    );

    res.json({
      success: true,
      total: gestures.length,
      gestures
    });
  } catch (error) {
    console.error('Error fetching gestures:', error);
    res.status(500).json({ 
      message: 'Error fetching gesture records',
      error: error.message 
    });
  }
});

/*
 Record gesture practice
 */
router.post('/gestures', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { gesture_name, accuracy } = req.body;

    if (!gesture_name) {
      return res.status(400).json({ 
        message: 'Gesture name is required' 
      });
    }

    // Check if gesture already exists for this user
    const existing = await dbGet(
      'SELECT id, practice_count FROM gesture_records WHERE user_id = ? AND gesture_name = ?',
      [userId, gesture_name]
    );

    let result;
    if (existing) {
      // Update existing record
      await dbRun(
        'UPDATE gesture_records SET practice_count = practice_count + 1, accuracy = ?, last_practiced = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [accuracy || null, existing.id]
      );
      result = await dbGet('SELECT * FROM gesture_records WHERE id = ?', [existing.id]);
    } else {
      // Create new record
      const insertResult = await dbRun(
        'INSERT INTO gesture_records (user_id, gesture_name, accuracy, last_practiced) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        [userId, gesture_name, accuracy || null]
      );
      result = await dbGet('SELECT * FROM gesture_records WHERE id = ?', [insertResult.lastID]);
    }

    res.json({
      message: 'Gesture practice recorded successfully',
      success: true,
      gesture: result
    });
  } catch (error) {
    console.error('Error recording gesture:', error);
    res.status(500).json({ 
      message: 'Error recording gesture practice',
      error: error.message 
    });
  }
});

/*
 Record quiz result
 */
router.post('/quiz', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { quiz_name, score, total_questions } = req.body;

    if (score === undefined || total_questions === undefined) {
      return res.status(400).json({ 
        message: 'Score and total_questions are required' 
      });
    }

    const result = await dbRun(
      'INSERT INTO quiz_results (user_id, quiz_name, score, total_questions) VALUES (?, ?, ?, ?)',
      [userId, quiz_name || 'Unnamed Quiz', score, total_questions]
    );

    const quizResult = await dbGet(
      'SELECT * FROM quiz_results WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json({
      message: 'Quiz result recorded successfully',
      success: true,
      quiz: quizResult
    });
  } catch (error) {
    console.error('Error recording quiz:', error);
    res.status(500).json({ 
      message: 'Error recording quiz result',
      error: error.message 
    });
  }
});

/*
 Get all quiz results for user
 */
router.get('/quiz-results', async (req, res) => {
  try {
    const userId = req.session.user.id;

    const results = await dbAll(
      'SELECT * FROM quiz_results WHERE user_id = ? ORDER BY completed_at DESC',
      [userId]
    );

    res.json({
      success: true,
      total: results.length,
      quizzes: results
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ 
      message: 'Error fetching quiz results',
      error: error.message 
    });
  }
});

module.exports = router;
