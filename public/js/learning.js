

/**
 * Load initial data (courses and user progress)
 */
async function loadInitialData() {
  try {
    // Load user progress if authenticated
    const authResponse = await fetch('/api/auth/status');
    const authData = await authResponse.json();

    if (authData.loggedIn) {
      const progress = await getProgress();
      if (progress) {
        updateProgressDisplay(progress);
      }
    }
  } catch (error) {
    console.error('Error loading initial data:', error);
  }
}

/**
 * Update progress display on the page
 */
function updateProgressDisplay(progress) {
  const lessonsEl = document.getElementById('lessonsCompleted');
  const accuracyEl = document.getElementById('quizAccuracy');
  const streakEl = document.getElementById('dayStreak');

  if (lessonsEl) lessonsEl.textContent = progress.gestures_mastered || 0;
  if (accuracyEl) accuracyEl.textContent = Math.round(progress.quiz_accuracy || 0) + '%';
  if (streakEl) streakEl.textContent = progress.learning_streak || 0;
}

/**
 * Start a  * Load a specific course and its lessons
 */
async function loadCourse(courseKey) {
  try {
    const courses = await getCourses();
    const course = courses.find((c) => c.category?.toLowerCase() === courseKey.toLowerCase());

    if (!course) {
      alert('Course not found');
      return;
    }

    const lessons = await getLessons(course.id);

    // Create course view
    const courseHtml = `
      <section class="container course-view">
        <button class="btn-secondary back-btn" onclick="location.reload()">← Back to Courses</button>
        
        <div class="course-header">
          <h2>${escapeHtml(course.title)}</h2>
          <p>${escapeHtml(course.description || '')}</p>
          <span class="course-level">${escapeHtml(course.level || 'All levels')}</span>
        </div>

        <div class="lessons-container">
          ${lessons
            .map(
              (lesson, index) => `
              <div class="card lesson-card">
                <div class="lesson-number">Lesson ${index + 1}</div>
                <h3>${escapeHtml(lesson.title)}</h3>
                <p>${escapeHtml(lesson.description || '')}</p>
                ${lesson.steps.length > 0 ? `
                  <div class="lesson-steps">
                    <strong>Steps:</strong>
                    <ol>
                      ${lesson.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}
                    </ol>
                  </div>
                ` : ''}
                <button class="btn-primary" onclick="startLesson('${lesson.id}', '${escapeHtml(lesson.title)}', '${course.id}')">
                  Start Lesson
                </button>
              </div>
            `
            )
            .join('')}
        </div>

        <div class="course-footer">
          <button class="btn-primary" onclick="loadQuizView('${course.id}', '${escapeHtml(course.title)}')">
            📝 Take Course Quiz
          </button>
        </div>
      </section>
    `;

    // Replace main content
    const main = document.querySelector('main') || document.querySelector('.hero').parentElement;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = courseHtml;
    main.innerHTML = '';
    main.appendChild(tempDiv.firstElementChild);
  } catch (error) {
    console.error('Error loading course:', error);
    alert('Error loading course. Please try again.');
  }
}

/**
lesson
 */
async function startLesson(lessonId, lessonTitle, courseId) {
  try {
    const lesson = await getLesson(lessonId);
    if (!lesson) {
      alert('Lesson not found');
      return;
    }

    const lessonHtml = `
      <section class="container lesson-view">
        <button class="btn-secondary back-btn" onclick="location.reload()">← Back to Lessons</button>
        
        <div class="lesson-header">
          <h2>${escapeHtml(lessonTitle)}</h2>
          <p>${escapeHtml(lesson.description || '')}</p>
        </div>

        <div class="lesson-content">
          ${lesson.video_url ? `
            <div class="video-container">
              <h3>Watch the lesson:</h3>
              <video controls style="max-width: 100%; margin: 20px 0;">
                <source src="${escapeHtml(lesson.video_url)}" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>
          ` : ''}

          ${lesson.steps && lesson.steps.length > 0 ? `
            <div class="steps-guide">
              <h3>Follow these steps:</h3>
              <ol>
                ${lesson.steps.map((step, i) => `
                  <li class="step-item">
                    <div class="step-number">${i + 1}</div>
                    <p>${escapeHtml(step)}</p>
                  </li>
                `).join('')}
              </ol>
            </div>
          ` : ''}

          <div class="practice-section">
            <h3>Practice Tips:</h3>
            <ul>
              <li>Watch the video multiple times</li>
              <li>Follow the steps carefully</li>
              <li>Practice in front of a mirror</li>
              <li>Record yourself and compare</li>
              <li>Take your time - no rush!</li>
            </ul>
          </div>
        </div>

        <div class="lesson-actions">
          <button class="btn-primary" onclick="completeAndReturn('${lessonId}', '${courseId}')">
            ✓ Mark as Complete
          </button>
        </div>
      </section>
    `;

    const main = document.querySelector('main') || document.body;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = lessonHtml;
    main.innerHTML = '';
    main.appendChild(tempDiv.firstElementChild);
  } catch (error) {
    console.error('Error starting lesson:', error);
    alert('Error loading lesson. Please try again.');
  }
}

/**
 * Complete lesson and return to course
 */
async function completeAndReturn(lessonId, courseId) {
  try {
    const authResponse = await fetch('/api/auth/status');
    const authData = await authResponse.json();

    if (authData.loggedIn) {
      const result = await completeLesson(lessonId);
      if (result.success) {
        alert('✓ Lesson completed! Great work!');
      }
    }
    location.reload();
  } catch (error) {
    console.error('Error completing lesson:', error);
    alert('Error completing lesson. Please try again.');
  }
}

/**
 * Load quiz view for a course
 */
async function loadQuizView(courseId, courseName) {
  try {
    const quiz = await getQuiz(courseId);

    if (!quiz.questions || quiz.questions.length === 0) {
      alert('No quiz available for this course yet.');
      return;
    }

    // Start quiz
    startQuiz(quiz, courseId, courseName);
  } catch (error) {
    console.error('Error loading quiz:', error);
    alert('Error loading quiz. Please try again.');
  }
}

/**
 * Start quiz
 */
function startQuiz(quiz, courseId, courseName) {
  let currentQuestion = 0;
  const answers = [];

  function showQuestion() {
    const q = quiz.questions[currentQuestion];
    const progress = currentQuestion + 1;
    const total = quiz.questions.length;

    const quizHtml = `
      <section class="container quiz-view">
        <div class="quiz-header">
          <h2>${escapeHtml(courseName)} - Quiz</h2>
          <div class="quiz-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${(progress / total) * 100}%"></div>
            </div>
            <p>Question ${progress} of ${total}</p>
          </div>
        </div>

        <div class="quiz-question">
          <h3>${escapeHtml(q.question)}</h3>
          
          <div class="quiz-options">
            ${q.options
              .map(
                (opt, i) => `
              <button class="option-btn" onclick="selectAnswer(${i})">
                <span class="option-letter">${String.fromCharCode(65 + i)}</span>
                <span class="option-text">${escapeHtml(opt)}</span>
              </button>
            `
              )
              .join('')}
          </div>
        </div>

        <div class="quiz-actions">
          <button class="btn-secondary" onclick="location.reload()">← Cancel Quiz</button>
        </div>
      </section>
    `;

    const main = document.querySelector('main') || document.body;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = quizHtml;
    main.innerHTML = '';
    main.appendChild(tempDiv.firstElementChild);

    // Store for next question
    window.currentQuestion = currentQuestion;
    window.quiz = quiz;
    window.courseId = courseId;
    window.courseName = courseName;
    window.answers = answers;
  }

  window.selectAnswer = function (selected) {
    answers[currentQuestion] = selected;
    currentQuestion++;

    if (currentQuestion < quiz.questions.length) {
      showQuestion();
    } else {
      finishQuiz(quiz, courseId, courseName, answers);
    }
  };

  showQuestion();
}

/**
 * Finish quiz and show results
 */
async function finishQuiz(quiz, courseId, courseName, answers) {
  try {
    const authResponse = await fetch('/api/auth/status');
    const authData = await authResponse.json();

    let result = null;
    if (authData.loggedIn) {
      result = await submitQuiz(courseId, answers);
    }

    const score = result?.score || 0;
    const total = quiz.questions.length;
    const percentage = result?.accuracy || Math.round((score / total) * 100);

    const resultsHtml = `
      <section class="container quiz-results">
        <div class="results-header">
          <h2>Quiz Complete! 🎉</h2>
        </div>

        <div class="results-score">
          <div class="big-score">${score}/${total}</div>
          <div class="percentage">${percentage}%</div>
          <p>${getScoreFeedback(percentage)}</p>
        </div>

        <div class="results-details">
          ${result?.results ? `
            <div class="answer-review">
              <h3>Answer Review:</h3>
              ${result.results
                .map(
                  (r, i) => `
                <div class="answer-item ${r.isCorrect ? 'correct' : 'incorrect'}">
                  <strong>Question ${i + 1}:</strong> ${r.isCorrect ? '✓' : '✗'}
                  <p>${escapeHtml(quiz.questions[i].question)}</p>
                  <p>Your answer: ${escapeHtml(quiz.questions[i].options[r.userAnswer])}</p>
                  ${!r.isCorrect ? `<p>Correct answer: ${escapeHtml(quiz.questions[i].options[r.correctAnswer])}</p>` : ''}
                </div>
              `
                )
                .join('')}
            </div>
          ` : ''}
        </div>

        <div class="results-actions">
          <button class="btn-primary" onclick="location.reload()">← Back to Learning</button>
        </div>
      </section>
    `;

    const main = document.querySelector('main') || document.body;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = resultsHtml;
    main.innerHTML = '';
    main.appendChild(tempDiv.firstElementChild);
  } catch (error) {
    console.error('Error finishing quiz:', error);
    alert('Error completing quiz. Please try again.');
  }
}

/**
 * Get feedback based on quiz score
 */
function getScoreFeedback(percentage) {
  if (percentage >= 90) return '🌟 Excellent! You\'re a star!';
  if (percentage >= 80) return '👍 Great job! Well done!';
  if (percentage >= 70) return '🎯 Good effort! Keep practicing!';
  if (percentage >= 60) return '💪 Not bad! Try again to improve!';
  return '📚 Keep learning! You\'ll get there!';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
