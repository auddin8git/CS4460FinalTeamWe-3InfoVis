// Smooth scrolling for nav links (no explicit behavior; rely on CSS scroll-behavior)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    target.scrollIntoView(); // CSS handles smoothness and snapping
  });
});

// Scroll tracker functionality
const trackerCircles = document.querySelectorAll('.tracker-circle');
const sections = document.querySelectorAll('section');

// Highlight the active tracker circle during scrolling
window.addEventListener('scroll', () => {
  let currentSection = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;

    if (window.scrollY >= sectionTop - sectionHeight / 2) {
      currentSection = section.getAttribute('id');
    }
  });

  trackerCircles.forEach(circle => {
    circle.classList.remove('active');
    if (circle.getAttribute('data-target') === `#${currentSection}`) {
      circle.classList.add('active');
    }
  });
});

// Click functionality for tracker circles
trackerCircles.forEach(circle => {
  circle.addEventListener('click', function () {
    const target = document.querySelector(this.getAttribute('data-target'));
    target.scrollIntoView(); // CSS handles smoothness and snapping
  });
});

// PAGE 1: Conditional loading of CSS
document.addEventListener('DOMContentLoaded', () => {
  // Select the target section for Page 1
  const page1 = document.querySelector('#page1');

  // Create the link element for the CSS file
  const page1CSS = document.createElement('link');
  page1CSS.rel = 'stylesheet';
  page1CSS.href = 'page1.css'; // Path to your CSS file
  page1CSS.id = 'page1-css';   // Unique ID to manage this stylesheet

  // Intersection Observer to detect when Page 1 is in view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // If Page 1 is in view, append the CSS if not already present
        if (!document.querySelector('#page1-css')) {
          document.head.appendChild(page1CSS);
        }
      } else {
        // If Page 1 is out of view, remove the CSS if present
        const existingCSS = document.querySelector('#page1-css');
        if (existingCSS) {
          existingCSS.remove();
        }
      }
    });
  });

  // Start observing Page 1
  observer.observe(page1);
});
