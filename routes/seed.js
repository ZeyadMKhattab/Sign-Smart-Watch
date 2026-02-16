const express = require('express');
const { dbRun, dbGet, dbAll } = require('../database');

const router = express.Router();

/**
 * Seed database with sample courses, lessons, and quizzes
 * POST /api/seed/populate
 */
router.post('/populate', async (req, res) => {
  try {
    // Check if data already exists
    const existingCourses = await dbAll('SELECT COUNT(*) as count FROM courses');
    if (existingCourses[0].count > 0) {
      return res.json({
        message: 'Database already has courses. Skipping seed.',
        success: true
      });
    }

    // Clear existing data
    await dbRun('DELETE FROM courses');
    await dbRun('DELETE FROM lessons');
    await dbRun('DELETE FROM lesson_steps');
    await dbRun('DELETE FROM quiz_questions');
    await dbRun('DELETE FROM quiz_options');

    // Create Courses
    const beginnerCourse = await dbRun(
      'INSERT INTO courses (title, level, description, category) VALUES (?, ?, ?, ?)',
      [
        'Beginner Sign Language',
        'Beginner',
        'Learn alphabet, numbers, and basic expressions.',
        'daily'
      ]
    );

    const conversationCourse = await dbRun(
      'INSERT INTO courses (title, level, description, category) VALUES (?, ?, ?, ?)',
      [
        'Daily Conversations',
        'Intermediate',
        'Signs for everyday communication and common phrases.',
        'daily'
      ]
    );

    const emergencyCourse = await dbRun(
      'INSERT INTO courses (title, level, description, category) VALUES (?, ?, ?, ?)',
      [
        'Emergency & Safety',
        'Intermediate',
        'Critical signs for urgent situations and safety.',
        'emergency'
      ]
    );

    const workplaceCourse = await dbRun(
      'INSERT INTO courses (title, level, description, category) VALUES (?, ?, ?, ?)',
      [
        'Workplace Communication',
        'Advanced',
        'Professional signs for work environments.',
        'workplace'
      ]
    );

    const medicalCourse = await dbRun(
      'INSERT INTO courses (title, level, description, category) VALUES (?, ?, ?, ?)',
      [
        'Medical & Healthcare',
        'Advanced',
        'Signs used in hospitals and clinics.',
        'medical'
      ]
    );

    // Create Lessons for Beginner Course
    const lesson1 = await dbRun(
      'INSERT INTO lessons (title, description, video_url, course_id) VALUES (?, ?, ?, ?)',
      [
        'Alphabet Basics (A-E)',
        'Learn how to sign the first 5 letters of the alphabet.',
        'https://example.com/alphabet-ae.mp4',
        beginnerCourse.lastID
      ]
    );

    const lesson1Steps = [
      'Raise your hand in front of you',
      'Form the letter shape with your fingers',
      'Keep your hand steady',
      'Hold the position for 2 seconds',
      'Move on to the next letter'
    ];

    for (let i = 0; i < lesson1Steps.length; i++) {
      await dbRun(
        'INSERT INTO lesson_steps (lesson_id, step_order, step_text) VALUES (?, ?, ?)',
        [lesson1.lastID, i + 1, lesson1Steps[i]]
      );
    }

    const lesson2 = await dbRun(
      'INSERT INTO lessons (title, description, video_url, course_id) VALUES (?, ?, ?, ?)',
      [
        'Numbers 1-10',
        'Learn to sign numbers from 1 to 10.',
        'https://example.com/numbers-1-10.mp4',
        beginnerCourse.lastID
      ]
    );

    const lesson2Steps = [
      'Hold up your hand with fingers open',
      'Starting with 1 finger (thumb), count up',
      'Use a smooth flowing motion',
      'Numbers 6-10 use both hands',
      'Practice the transitions between numbers'
    ];

    for (let i = 0; i < lesson2Steps.length; i++) {
      await dbRun(
        'INSERT INTO lesson_steps (lesson_id, step_order, step_text) VALUES (?, ?, ?)',
        [lesson2.lastID, i + 1, lesson2Steps[i]]
      );
    }

    const lesson3 = await dbRun(
      'INSERT INTO lessons (title, description, video_url, course_id) VALUES (?, ?, ?, ?)',
      [
        'Basic Greetings',
        'Learn common greetings in sign language.',
        'https://example.com/greetings.mp4',
        beginnerCourse.lastID
      ]
    );

    const lesson3Steps = [
      'Start in a neutral position',
      'Make eye contact and smile',
      'Use appropriate facial expressions',
      'Wave hand naturally for "Hello"',
      'Touch forehead and move down for "Thank you"'
    ];

    for (let i = 0; i < lesson3Steps.length; i++) {
      await dbRun(
        'INSERT INTO lesson_steps (lesson_id, step_order, step_text) VALUES (?, ?, ?)',
        [lesson3.lastID, i + 1, lesson3Steps[i]]
      );
    }

    // Create Lessons for Conversation Course
    const lesson4 = await dbRun(
      'INSERT INTO lessons (title, description, video_url, course_id) VALUES (?, ?, ?, ?)',
      [
        'Ordering Food',
        'Learn signs used when ordering at restaurants.',
        'https://example.com/ordering-food.mp4',
        conversationCourse.lastID
      ]
    );

    const lesson4Steps = [
      'Point to the menu item',
      'Use the sign for "want" or "like"',
      'Specify quantity with numbers',
      'Add polite markers for courtesy',
      'Confirm the order with a nod'
    ];

    for (let i = 0; i < lesson4Steps.length; i++) {
      await dbRun(
        'INSERT INTO lesson_steps (lesson_id, step_order, step_text) VALUES (?, ?, ?)',
        [lesson4.lastID, i + 1, lesson4Steps[i]]
      );
    }

    // Create Lessons for Emergency Course
    const lesson5 = await dbRun(
      'INSERT INTO lessons (title, description, video_url, course_id) VALUES (?, ?, ?, ?)',
      [
        'Emergency Phrases',
        'Learn critical signs for emergency situations.',
        'https://example.com/emergency.mp4',
        emergencyCourse.lastID
      ]
    );

    const lesson5Steps = [
      'Sign "Help!" with both hands',
      'Use rapid, sharp movements',
      'Clear facial expression of urgency',
      'Sign the type of emergency clearly',
      'Point to the location when necessary'
    ];

    for (let i = 0; i < lesson5Steps.length; i++) {
      await dbRun(
        'INSERT INTO lesson_steps (lesson_id, step_order, step_text) VALUES (?, ?, ?)',
        [lesson5.lastID, i + 1, lesson5Steps[i]]
      );
    }

    // Create Quiz for Beginner Course
    const beginnerQuiz = [
      {
        question: 'Which gesture represents the letter "A"?',
        options: ['Make a fist with thumb extended', 'Fingers spread and stiff', 'Open hand with palm up'],
        correctAnswer: 0
      },
      {
        question: 'How do you sign the number 3?',
        options: ['Three fingers extended (thumb, index, middle)', 'Three fingers on each hand', 'Index and middle fingers only'],
        correctAnswer: 0
      },
      {
        question: 'What does this gesture represent?',
        options: ['Thank you', 'Please', 'Hello'],
        correctAnswer: 0
      },
      {
        question: 'Which is correct for greeting?',
        options: ['Wave with open hand', 'Make a fist', 'Point your finger'],
        correctAnswer: 0
      },
      {
        question: 'How many different hand shapes are in the alphabet?',
        options: ['More than 20', 'Exactly 26', 'Less than 15'],
        correctAnswer: 0
      }
    ];

    for (const q of beginnerQuiz) {
      const questionResult = await dbRun(
        'INSERT INTO quiz_questions (course_id, question, correct_answer) VALUES (?, ?, ?)',
        [beginnerCourse.lastID, q.question, q.correctAnswer + 1]
      );

      for (let i = 0; i < q.options.length; i++) {
        await dbRun(
          'INSERT INTO quiz_options (question_id, option_order, option_text) VALUES (?, ?, ?)',
          [questionResult.lastID, i + 1, q.options[i]]
        );
      }
    }

    // Create Quiz for Conversation Course
    const conversationQuiz = [
      {
        question: 'What is the sign for "want"?',
        options: ['Both hands palms up, fingers curled', 'Hand over heart', 'Pointing at yourself'],
        correctAnswer: 0
      },
      {
        question: 'How do you ask for the menu?',
        options: ['Point and make the "menu" sign', 'Say the word aloud', 'Use facial expressions only'],
        correctAnswer: 0
      },
      {
        question: 'What does "please" look like?',
        options: ['Circle hand on chest', 'Wave your hand', 'Points fingers spread'],
        correctAnswer: 0
      },
      {
        question: 'How do you specify quantity in a restaurant?',
        options: ['Use number signs', 'Say it out loud', 'Hold up fingers'],
        correctAnswer: 0
      }
    ];

    for (const q of conversationQuiz) {
      const questionResult = await dbRun(
        'INSERT INTO quiz_questions (course_id, question, correct_answer) VALUES (?, ?, ?)',
        [conversationCourse.lastID, q.question, q.correctAnswer + 1]
      );

      for (let i = 0; i < q.options.length; i++) {
        await dbRun(
          'INSERT INTO quiz_options (question_id, option_order, option_text) VALUES (?, ?, ?)',
          [questionResult.lastID, i + 1, q.options[i]]
        );
      }
    }

    res.json({
      message: 'Database seeded successfully with courses, lessons, and quizzes!',
      success: true,
      data: {
        courses: 5,
        lessons: 5,
        quizzes: 2
      }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({
      message: 'Error seeding database',
      error: error.message,
      success: false
    });
  }
});

/**
 * Get seed status
 */
router.get('/status', async (req, res) => {
  try {
    const courseCount = await dbAll('SELECT COUNT(*) as count FROM courses');
    const lessonCount = await dbAll('SELECT COUNT(*) as count FROM lessons');
    const quizCount = await dbAll('SELECT COUNT(*) as count FROM quiz_questions');

    res.json({
      success: true,
      status: {
        courses: courseCount[0]?.count || 0,
        lessons: lessonCount[0]?.count || 0,
        quizQuestions: quizCount[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Error getting seed status:', error);
    res.status(500).json({
      message: 'Error getting seed status',
      error: error.message
    });
  }
});

module.exports = router;
