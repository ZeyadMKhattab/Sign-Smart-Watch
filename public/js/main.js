document.addEventListener('DOMContentLoaded', function() {
  initializeNavigation();
});

function initializeNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const header = document.querySelector('header');
  const body = document.body;
  
  // Check if elements exist
  if (!hamburger || !navLinks) {
    console.warn('Navigation elements not found');
    return;
  }

  // Toggle mobile menu
  hamburger.addEventListener('click', function() {
    toggleMobileMenu();
  });

  // Close menu when clicking on a link
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        closeMobileMenu();
      }
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
    const isClickInsideNav = header.contains(event.target);
    const isMenuOpen = navLinks.classList.contains('active');
    
    if (!isClickInsideNav && isMenuOpen) {
      closeMobileMenu();
    }
  });

  // Close menu on window resize to desktop
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      closeMobileMenu();
    }
  });

  // Prevent body scroll when menu is open
  function toggleBodyScroll(shouldLock) {
    if (shouldLock) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = '';
    }
  }

  function toggleMobileMenu() {
    const isActive = hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    
    // Toggle ARIA attributes for accessibility
    hamburger.setAttribute('aria-expanded', isActive);
    navLinks.setAttribute('aria-hidden', !isActive);
    
    // Prevent body scroll when menu is open
    toggleBodyScroll(isActive);
    
    // Add animation class
    if (isActive) {
      navLinks.style.display = 'flex';
      // Trigger reflow to ensure animation plays
      void navLinks.offsetWidth;
      navLinks.classList.add('opening');
      setTimeout(() => {
        navLinks.classList.remove('opening');
      }, 300);
    } else {
      navLinks.classList.add('closing');
      setTimeout(() => {
        navLinks.classList.remove('closing');
        if (!navLinks.classList.contains('active')) {
          navLinks.style.display = '';
        }
      }, 300);
    }
  }

  function closeMobileMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    navLinks.setAttribute('aria-hidden', 'true');
    toggleBodyScroll(false);
    
    navLinks.classList.add('closing');
    setTimeout(() => {
      navLinks.classList.remove('closing');
      navLinks.style.display = '';
    }, 300);
  }
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    
    // Skip empty anchors
    if (href === '#') return;
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ============================================
// HEADER SCROLL EFFECT
// ============================================

let lastScroll = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  // Add shadow on scroll
  if (currentScroll > 10) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});

// ============================================
// ACTIVE LINK HIGHLIGHTING
// ============================================

function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('header nav a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('nav-active');
    } else {
      link.classList.remove('nav-active');
    }
  });
}

// Set active link on page load
document.addEventListener('DOMContentLoaded', setActiveNavLink);

