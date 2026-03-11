// cursor.js
// Custom Cursor Logic
const dot = document.getElementById('cursor-dot');
const outline = document.getElementById('cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    dot.style.transform = `translate(${posX - 5}px, ${posY - 5}px)`;

    // Add some lag to outline
    outline.animate({
        transform: `translate(${posX - 20}px, ${posY - 20}px)`
    }, { duration: 500, fill: 'forwards' });
});

function expandCursor() {
    outline.style.transform += ' scale(2)';
    outline.style.backgroundColor = 'rgba(0,0,0,0.1)';
    outline.style.borderColor = 'transparent';
}

function shrinkCursor() {
    outline.style.transform = outline.style.transform.replace(' scale(2)', '');
    outline.style.backgroundColor = 'transparent';
    outline.style.borderColor = 'rgba(0,0,0,0.5)';
}

function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('-translate-y-full');
}
