// ===============================
// HIGH CONTRAST TOGGLE
// ===============================
const contrastBtn = document.getElementById("contrast-toggle");
contrastBtn.addEventListener("click", () => {
  document.body.classList.toggle("high-contrast");
});

// ===============================
// DOM ELEMENTS
// ===============================
const userNameEl = document.getElementById("user-name");
const userEmailEl = document.getElementById("user-email");
const userAgeEl = document.getElementById("user-age");
const logoutBtn = document.getElementById("logout");

// ===============================
// FETCH USER DATA
// ===============================
async function fetchUserData() {
  try {
    const response = await fetch('/api/user/profile');
    if (response.ok) {
      const user = await response.json();
      userNameEl.textContent = user.name;
      userEmailEl.textContent = user.email;
      userAgeEl.textContent = user.age || 'Not provided';
      
      // Fetch learning progress
      await fetchLearningProgress();
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/login.html';
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

// ===============================
// FETCH LEARNING PROGRESS
// ===============================
async function fetchLearningProgress() {
  try {
    const response = await fetch('/api/learning/progress');
    if (response.ok) {
      const data = await response.json();
      const progress = data.progress;
      
      // Update progress display
      const progressValueEls = document.querySelectorAll('.progress-value');
      if (progressValueEls.length >= 3) {
        progressValueEls[0].textContent = `${progress.gestures_mastered || 0}/20`;
        progressValueEls[1].textContent = `${Math.round(progress.quiz_accuracy || 0)}%`;
        progressValueEls[2].textContent = `${progress.learning_streak || 0} Days`;
      }
      
      // Update progress bar
      const progressBar = document.querySelector('.progress-bar-fill');
      if (progressBar) {
        const overallProgress = Math.round((progress.gestures_mastered || 0) / 20 * 100);
        progressBar.style.width = overallProgress + '%';
      }
    }
  } catch (error) {
    console.error('Error fetching learning progress:', error);
  }
}

// ===============================
// LOGOUT
// ===============================
async function logout() {
  try {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (response.ok) {
      window.location.href = '/login.html';
    }
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

// ===============================
// INITIALIZATION
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  fetchUserData();
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});

logoutBtn.addEventListener("click", logout);

// ===============================
// INITIALIZE
// ===============================
fetchUserData();
