const express = require('express');
const { dbRun, dbGet, dbAll } = require('../database');
const { checkAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Get quiz for a course
 */
router.get('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify course exists
    const course = await dbGet('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    // Get all questions for this course
    const questions = await dbAll(
      'SELECT id, question, correct_answer FROM quiz_questions WHERE course_id = ? ORDER BY id',
      [courseId]
    );

    // Get options for each question
    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const options = await dbAll(
          'SELECT option_order, option_text FROM quiz_options WHERE question_id = ? ORDER BY option_order',
          [question.id]
        );
        return {
          ...question,
          options: options.map(o => o.option_text),
          correctAnswer: question.correct_answer - 1 // Convert to 0-based index
        };
      })
    );

    res.json({
      success: true,
      courseId,
      total: questionsWithOptions.length,
      questions: questionsWithOptions
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      message: 'Error fetching quiz',
      error: error.message
    });
  }
});

/**
 * Submit quiz answers and get score
 */
router.post('/submit/:courseId', checkAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { answers } = req.body; // answers is an array of selected indices
    const userId = req.session.user.id;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        message: 'Answers must be an array'
      });
    }

    // Get quiz questions
    const questions = await dbAll(
      'SELECT id, correct_answer FROM quiz_questions WHERE course_id = ? ORDER BY id',
      [courseId]
    );

    if (questions.length === 0) {
      return res.status(404).json({
        message: 'No quiz found for this course'
      });
    }

    // Calculate score
    let score = 0;
    const results = questions.map((q, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === (q.correct_answer - 1); // correct_answer is 1-based
      if (isCorrect) score++;
      return {
        questionId: q.id,
        userAnswer,
        correctAnswer: q.correct_answer - 1,
        isCorrect
      };
    });

    // Save quiz result
    const accuracy = (score / questions.length) * 100;
    await dbRun(
      'INSERT INTO quiz_results (user_id, quiz_name, score, total_questions) VALUES (?, ?, ?, ?)',
      [userId, `Course ${courseId} Quiz`, score, questions.length]
    );

    res.json({
      success: true,
      score,
      total: questions.length,
      accuracy: Math.round(accuracy * 100) / 100,
      percentage: `${Math.round(accuracy)}%`,
      results
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      message: 'Error submitting quiz',
      error: error.message
    });
  }
});

/**
 * Get user's quiz history for a course
 */
router.get('/history/:courseId', checkAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { courseId } = req.params;

    const history = await dbAll(`
      SELECT id, quiz_name, score, total_questions, completed_at
      FROM quiz_results
      WHERE user_id = ? AND quiz_name LIKE ?
      ORDER BY completed_at DESC
    `, [userId, `%${courseId}%`]);

    res.json({
      success: true,
      total: history.length,
      history: history.map(h => ({
        ...h,
        accuracy: h.total_questions ? Math.round((h.score / h.total_questions) * 100) : 0
      }))
    });
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    res.status(500).json({
      message: 'Error fetching quiz history',
      error: error.message
    });
  }
});

/**
 * Create a quiz for a course (admin only)
 */
router.post('/', async (req, res) => {
  try {
    const { courseId, questions } = req.body;

    if (!courseId || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        message: 'courseId and questions array are required'
      });
    }

    // Verify course exists
    const course = await dbGet('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    const quizQuestions = [];

    // Create questions and options
    for (const q of questions) {
      const questionResult = await dbRun(
        'INSERT INTO quiz_questions (course_id, question, correct_answer) VALUES (?, ?, ?)',
        [courseId, q.question, q.correctAnswer + 1] // Convert to 1-based index for DB
      );

      const questionId = questionResult.lastID;
      const questionRecord = { id: questionId, ...q };

      // Add options
      for (let i = 0; i < q.options.length; i++) {
        await dbRun(
          'INSERT INTO quiz_options (question_id, option_order, option_text) VALUES (?, ?, ?)',
          [questionId, i + 1, q.options[i]]
        );
      }

      quizQuestions.push(questionRecord);
    }

    res.status(201).json({
      message: 'Quiz created successfully',
      success: true,
      courseId,
      total: quizQuestions.length,
      questions: quizQuestions
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      message: 'Error creating quiz',
      error: error.message
    });
  }
});

module.exports = router;
