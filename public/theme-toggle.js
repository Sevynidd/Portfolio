// theme-toggle.js
// Handles dark/light mode switching and FAB icon
(function() {
    const iconMarkup = {
        dark: '<path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" fill="currentColor"/>',
        light: '<circle cx="12" cy="12" r="5" fill="currentColor"/>'
    };

    function setTheme(mode, icon) {
        document.documentElement.setAttribute('data-theme', mode);
        localStorage.setItem('theme', mode);
        if (icon) {
            icon.innerHTML = iconMarkup[mode] || iconMarkup.light;
        }
    }

    function initialize() {
        const btn = document.getElementById('theme-toggle');
        const icon = document.getElementById('theme-icon');

        if (!btn || !icon) {
            return false;
        }

        btn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            setTheme(current, icon);
        });

        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(saved || (prefersDark ? 'dark' : 'light'), icon);
        return true;
    }

    function waitForInitialization() {
        if (!initialize()) {
            window.requestAnimationFrame(waitForInitialization);
        }
    }

    waitForInitialization();
})();
