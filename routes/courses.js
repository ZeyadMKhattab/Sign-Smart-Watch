const express = require('express');
const { dbRun, dbGet, dbAll } = require('../database');

const router = express.Router();

/**
 * Get all courses
 * Query params: ?category=daily (optional filter)
 */
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM courses';
    const params = [];

    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    }

    sql += ' ORDER BY title';
    const courses = await dbAll(sql, params);

    // Get lesson count for each course
    const coursesWithLessons = await Promise.all(
      courses.map(async (course) => {
        const lessons = await dbAll('SELECT id FROM lessons WHERE course_id = ?', [course.id]);
        return {
          ...course,
          lessonCount: lessons.length,
          lessons
        };
      })
    );

    res.json({
      success: true,
      total: coursesWithLessons.length,
      courses: coursesWithLessons
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      message: 'Error fetching courses',
      error: error.message
    });
  }
});

/**
 * Get a single course by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const course = await dbGet('SELECT * FROM courses WHERE id = ?', [id]);

    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    // Get lessons for this course
    const lessons = await dbAll('SELECT id, title, description FROM lessons WHERE course_id = ? ORDER BY id', [id]);

    res.json({
      success: true,
      course: {
        ...course,
        lessons
      }
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      message: 'Error fetching course',
      error: error.message
    });
  }
});

/**
 * Create a new course (admin only)
 */
router.post('/', async (req, res) => {
  try {
    const { title, level, description, category } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        message: 'Title and category are required'
      });
    }

    const result = await dbRun(
      'INSERT INTO courses (title, level, description, category) VALUES (?, ?, ?, ?)',
      [title, level || null, description || null, category]
    );

    const course = await dbGet('SELECT * FROM courses WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Course created successfully',
      success: true,
      course
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      message: 'Error creating course',
      error: error.message
    });
  }
});

/**
 * Update a course (admin only)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, level, description, category } = req.body;

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (level !== undefined) {
      updates.push('level = ?');
      values.push(level);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        message: 'No fields to update'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await dbRun(
      `UPDATE courses SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const course = await dbGet('SELECT * FROM courses WHERE id = ?', [id]);

    res.json({
      message: 'Course updated successfully',
      success: true,
      course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      message: 'Error updating course',
      error: error.message
    });
  }
});

/**
 * Delete a course (admin only)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const course = await dbGet('SELECT id FROM courses WHERE id = ?', [id]);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    await dbRun('DELETE FROM courses WHERE id = ?', [id]);

    res.json({
      message: 'Course deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      message: 'Error deleting course',
      error: error.message
    });
  }
});

module.exports = router;
