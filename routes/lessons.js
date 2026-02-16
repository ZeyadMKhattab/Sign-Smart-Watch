const express = require('express');
const { dbRun, dbGet, dbAll } = require('../database');
const { checkAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Get all lessons for a course
 */
router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify course exists
    const course = await dbGet('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    const lessons = await dbAll('SELECT id, title, description, video_url FROM lessons WHERE course_id = ? ORDER BY id', [courseId]);

    // Get steps for each lesson
    const lessonsWithSteps = await Promise.all(
      lessons.map(async (lesson) => {
        const steps = await dbAll(
          'SELECT step_text FROM lesson_steps WHERE lesson_id = ? ORDER BY step_order',
          [lesson.id]
        );
        return {
          ...lesson,
          steps: steps.map(s => s.step_text)
        };
      })
    );

    res.json({
      success: true,
      total: lessonsWithSteps.length,
      lessons: lessonsWithSteps
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({
      message: 'Error fetching lessons',
      error: error.message
    });
  }
});

/**
 * Get a single lesson with all details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await dbGet('SELECT * FROM lessons WHERE id = ?', [id]);
    if (!lesson) {
      return res.status(404).json({
        message: 'Lesson not found'
      });
    }

    // Get steps
    const steps = await dbAll(
      'SELECT step_text FROM lesson_steps WHERE lesson_id = ? ORDER BY step_order',
      [id]
    );

    res.json({
      success: true,
      lesson: {
        ...lesson,
        steps: steps.map(s => s.step_text)
      }
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({
      message: 'Error fetching lesson',
      error: error.message
    });
  }
});

/**
 * Create a new lesson (admin only)
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, video_url, course_id, steps } = req.body;

    if (!title || !course_id) {
      return res.status(400).json({
        message: 'Title and course_id are required'
      });
    }

    // Verify course exists
    const course = await dbGet('SELECT id FROM courses WHERE id = ?', [course_id]);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    const result = await dbRun(
      'INSERT INTO lessons (title, description, video_url, course_id) VALUES (?, ?, ?, ?)',
      [title, description || null, video_url || null, course_id]
    );

    const lessonId = result.lastID;

    // Add steps if provided
    if (steps && Array.isArray(steps)) {
      for (let i = 0; i < steps.length; i++) {
        await dbRun(
          'INSERT INTO lesson_steps (lesson_id, step_order, step_text) VALUES (?, ?, ?)',
          [lessonId, i + 1, steps[i]]
        );
      }
    }

    const lesson = await dbGet('SELECT * FROM lessons WHERE id = ?', [lessonId]);

    res.status(201).json({
      message: 'Lesson created successfully',
      success: true,
      lesson
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({
      message: 'Error creating lesson',
      error: error.message
    });
  }
});

/**
 * Mark lesson as completed for a user
 */
router.post('/:lessonId/complete', checkAuth, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.session.user.id;

    // Verify lesson exists
    const lesson = await dbGet('SELECT id FROM lessons WHERE id = ?', [lessonId]);
    if (!lesson) {
      return res.status(404).json({
        message: 'Lesson not found'
      });
    }

    // Check if already completed
    const existing = await dbGet(
      'SELECT id FROM user_lessons WHERE user_id = ? AND lesson_id = ?',
      [userId, lessonId]
    );

    if (existing) {
      // Update completion
      await dbRun(
        'UPDATE user_lessons SET completed = 1, completed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND lesson_id = ?',
        [userId, lessonId]
      );
    } else {
      // Create new record
      await dbRun(
        'INSERT INTO user_lessons (user_id, lesson_id, completed, completed_at) VALUES (?, ?, 1, CURRENT_TIMESTAMP)',
        [userId, lessonId]
      );
    }

    res.json({
      message: 'Lesson marked as completed',
      success: true
    });
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    res.status(500).json({
      message: 'Error marking lesson complete',
      error: error.message
    });
  }
});

/**
 * Get user's completed lessons for a course
 */
router.get('/user/:courseId', checkAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.session.user.id;

    const completedLessons = await dbAll(`
      SELECT ul.lesson_id, l.title, ul.completed_at
      FROM user_lessons ul
      JOIN lessons l ON ul.lesson_id = l.id
      WHERE ul.user_id = ? AND l.course_id = ? AND ul.completed = 1
      ORDER BY ul.completed_at DESC
    `, [userId, courseId]);

    res.json({
      success: true,
      total: completedLessons.length,
      completedLessons
    });
  } catch (error) {
    console.error('Error fetching user lessons:', error);
    res.status(500).json({
      message: 'Error fetching user lessons',
      error: error.message
    });
  }
});

module.exports = router;
