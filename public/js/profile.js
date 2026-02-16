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
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/login.html';
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
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

logoutBtn.addEventListener("click", logout);

// ===============================
// INITIALIZE
// ===============================
fetchUserData();
