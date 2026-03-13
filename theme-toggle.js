// theme-toggle.js
// Handles dark/light mode switching and FAB icon
(function() {
    const btn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    function setTheme(mode) {
        document.documentElement.setAttribute('data-theme', mode);
        localStorage.setItem('theme', mode);
        if (mode === 'dark') {
            icon.innerHTML = '<path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" fill="currentColor"/>';
        } else {
            icon.innerHTML = '<circle cx="12" cy="12" r="5" fill="currentColor"/>';
        }
    }
    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(current);
    });
    // On load, set theme from localStorage or system
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(saved || (prefersDark ? 'dark' : 'light'));
})();
