/**
 * API Helper Functions for Learning Features
 */

// ==================== COURSES ====================

/**
 * Get all courses
 */
async function getCourses(category = null) {
  try {
    let url = '/api/courses';
    if (category) {
      url += `?category=${encodeURIComponent(category)}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    return data.courses || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

/**
 * Get a specific course by ID
 */
async function getCourse(courseId) {
  try {
    const response = await fetch(`/api/courses/${courseId}`);
    const data = await response.json();
    return data.course || null;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

// ==================== LESSONS ====================

/**
 * Get all lessons for a course
 */
async function getLessons(courseId) {
  try {
    const response = await fetch(`/api/lessons/course/${courseId}`);
    const data = await response.json();
    return data.lessons || [];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
}

/**
 * Get a specific lesson by ID
 */
async function getLesson(lessonId) {
  try {
    const response = await fetch(`/api/lessons/${lessonId}`);
    const data = await response.json();
    return data.lesson || null;
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return null;
  }
}

/**
 * Mark a lesson as completed
 */
async function completeLesson(lessonId) {
  try {
    const response = await fetch(`/api/lessons/${lessonId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error completing lesson:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's completed lessons for a course
 */
async function getUserLessons(courseId) {
  try {
    const response = await fetch(`/api/lessons/user/${courseId}`);
    const data = await response.json();
    return data.completedLessons || [];
  } catch (error) {
    console.error('Error fetching user lessons:', error);
    return [];
  }
}

// ==================== QUIZZES ====================

/**
 * Get quiz for a course
 */
async function getQuiz(courseId) {
  try {
    const response = await fetch(`/api/quizzes/${courseId}`);
    const data = await response.json();
    if (data.success) {
      return {
        courseId: data.courseId,
        questions: data.questions || []
      };
    }
    return { questions: [] };
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return { questions: [] };
  }
}

/**
 * Submit quiz answers
 */
async function submitQuiz(courseId, answers) {
  try {
    const response = await fetch(`/api/quizzes/submit/${courseId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ answers })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's quiz history for a course
 */
async function getQuizHistory(courseId) {
  try {
    const response = await fetch(`/api/quizzes/history/${courseId}`);
    const data = await response.json();
    return data.history || [];
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    return [];
  }
}

// ==================== LEARNING PROGRESS ====================

/**
 * Get user's learning progress
 */
async function getProgress() {
  try {
    const response = await fetch('/api/learning/progress');
    const data = await response.json();
    return data.progress || null;
  } catch (error) {
    console.error('Error fetching progress:', error);
    return null;
  }
}

/**
 * Update user's learning progress
 */
async function updateProgress(updates) {
  try {
    const response = await fetch('/api/learning/progress', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating progress:', error);
    return { success: false, error: error.message };
  }
}
