let currentQuestion = 0;
let score = 0;
let quizData = null;
let courseId = null;

document.addEventListener('DOMContentLoaded', () => {
  const startQuizBtn = document.getElementById('startQuiz');
  if (startQuizBtn) {
    startQuizBtn.addEventListener('click', async () => {
      const courses = await getCourses();
      if (courses.length > 0) {
        await loadQuiz(courses[0].id);
      } else {
        alert('No courses available yet.');
      }
    });
  }
});

async function loadQuiz(cId) {
  try {
    courseId = cId;
    quizData = await getQuiz(courseId);
    
    if (!quizData.questions || quizData.questions.length === 0) {
      alert('No quiz available for this course yet.');
      return;
    }

    currentQuestion = 0;
    score = 0;
    showQuestion();
  } catch (error) {
    console.error('Error loading quiz:', error);
    alert('Error loading quiz. Please try again.');
  }
}


function showQuestion() {
  const q = quizData.questions[currentQuestion];
  const progress = currentQuestion + 1;
  const total = quizData.questions.length;

  const questionHtml = `
    <section class="container quiz-container">
      <div class="quiz-header">
        <button class="btn-secondary" onclick="cancelQuiz()">← Cancel</button>
        <h2>Quiz</h2>
        <span class="quiz-progress">${progress}/${total}</span>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(progress / total) * 100}%"></div>
      </div>

      <div class="quiz-content">
        <h3>${escapeHtml(q.question)}</h3>
        
        <div class="options">
          ${q.options
            .map(
              (opt, i) => `
            <button class="option-btn" onclick="checkAnswer(${i})">
              <span class="option-label">${String.fromCharCode(65 + i)}</span>
              <span class="option-text">${escapeHtml(opt)}</span>
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    </section>
  `;

  const main = document.querySelector('main') || document.body;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = questionHtml;
  main.innerHTML = '';
  main.appendChild(tempDiv.firstElementChild);
}

function checkAnswer(selected) {
  const isCorrect = selected === quizData.questions[currentQuestion].correctAnswer;
  
  if (isCorrect) {
    score++;
    alert('✅ Correct!');
  } else {
    alert('❌ Wrong! The correct answer was: ' + 
      quizData.questions[currentQuestion].options[quizData.questions[currentQuestion].correctAnswer]);
  }

  currentQuestion++;

  if (currentQuestion < quizData.questions.length) {
    showQuestion();
  } else {
    finishQuiz();
  }
}


async function finishQuiz() {
  try {
    // Submit quiz to backend if user is authenticated
    const authResponse = await fetch('/api/auth/status');
    const authData = await authResponse.json();

    if (authData.loggedIn && courseId) {
      // We need to reconstruct answers - for now just submit basic info
      const accuracy = Math.round((score / quizData.questions.length) * 100);
    }

    const accuracy = Math.round((score / quizData.questions.length) * 100);

    const resultsHtml = `
      <section class="container quiz-results">
        <div class="results-container">
          <h2>Quiz Completed! 🎉</h2>
          
          <div class="score-display">
            <div class="score-circle">
              <span class="score-number">${score}/${quizData.questions.length}</span>
              <span class="score-percent">${accuracy}%</span>
            </div>
            <p class="score-feedback">${getQuizFeedback(accuracy)}</p>
          </div>

          <div class="results-stats">
            <div class="stat">
              <h4>Correct Answers</h4>
              <p>${score}</p>
            </div>
            <div class="stat">
              <h4>Accuracy</h4>
              <p>${accuracy}%</p>
            </div>
            <div class="stat">
              <h4>Total Questions</h4>
              <p>${quizData.questions.length}</p>
            </div>
          </div>

          <div class="results-actions">
            <button class="btn-primary" onclick="location.reload()">← Back to Learning</button>
            ${accuracy >= 80 ? `
              <button class="btn-secondary" onclick="alert('🎊 Great job! You passed! Next level coming soon!')">
                Continue Learning
              </button>
            ` : `
              <button class="btn-secondary" onclick="window.currentQuestion=0; window.score=0; showQuestion();">
                Retake Quiz
              </button>
            `}
          </div>
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
    alert('Error completing quiz');
  }
}

/**
 * Cancel quiz
 */
function cancelQuiz() {
  if (confirm('Are you sure you want to cancel the quiz?')) {
    location.reload();
  }
}

/**
 * Get feedback message based on quiz score
 */
function getQuizFeedback(accuracy) {
  if (accuracy >= 90) return '🌟 Excellent! You\'re a star!';
  if (accuracy >= 80) return '👍 Great job! Well done!';
  if (accuracy >= 70) return '🎯 Good effort! Keep practicing!';
  if (accuracy >= 60) return '💪 Not bad! Try again to improve!';
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
