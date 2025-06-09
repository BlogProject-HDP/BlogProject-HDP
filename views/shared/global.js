


document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  body.insertAdjacentHTML("beforeend",
     `<button id="themeToggle" aria-label="Toggle Theme">
        <span class="material-icons" id="themeIcon">dark_mode</span>
  </button>`);


  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const html = document.documentElement;

  

  // Load theme from localStorage or default to light
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(initialTheme);

  themeToggle.addEventListener('click', () => {
    const newTheme = html.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeIcon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';

    // Optional: adjust button styles per theme
    if (theme === 'dark') {
      document.documentElement.style.setProperty('--toggle-bg', '#333333aa');
      document.documentElement.style.setProperty('--toggle-fg', '#fff');
      document.documentElement.style.setProperty('--toggle-hover', '#444');
    } else {
      document.documentElement.style.setProperty('--toggle-bg', '#ffffffaa');
      document.documentElement.style.setProperty('--toggle-fg', '#000');
      document.documentElement.style.setProperty('--toggle-hover', '#eee');
    }
  }

  
});

