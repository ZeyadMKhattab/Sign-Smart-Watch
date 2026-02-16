document.addEventListener("DOMContentLoaded", async () => {

  try {
    const response = await fetch("/api/auth/status");
    const data = await response.json();

    if (data.loggedIn) {
      // User is logged in, show profile link
      const loginLink = nav.querySelector('a[href="login.html"]');
      if (loginLink) {
        loginLink.textContent = "Profile";
        loginLink.href = "/profile";
      }
      const signupLink = nav.querySelector('a[href="signup.html"]');
      if (signupLink) {
        signupLink.remove();
      }
    } else {
      // User is not logged in, show login/signup links
      const loginLink = nav.querySelector('a[href="login.html"]');
      if (!loginLink) {
        const profileLink = nav.querySelector('a[href="/profile"]');
        if (profileLink) {
          profileLink.textContent = "Login";
          profileLink.href = "login.html";
        }
      }
    }
  } catch (error) {
    console.error("Error checking auth status:", error);
  }
});
