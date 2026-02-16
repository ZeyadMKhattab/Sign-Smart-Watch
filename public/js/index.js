document.addEventListener('DOMContentLoaded', () => {
  // Explore Features button
  const exploreBtn = document.getElementById('exploreFeatures');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Get Started Free button
  const signupBtn = document.querySelector('.btn-signup');
  if (signupBtn) {
    signupBtn.addEventListener('click', () => {
      window.location.href = 'signup.html';
    });
  }

  // View Courses button
  const coursesBtn = document.querySelector('.btn-courses');
  if (coursesBtn) {
    coursesBtn.addEventListener('click', () => {
      window.location.href = 'learning.html';
    });
  }
});
