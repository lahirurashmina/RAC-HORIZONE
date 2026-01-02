/**
 * Dark Mode Management Script
 * Handles theme switching and persistence
 */

const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('horizone_theme') || 'light';
        this.applyTheme(savedTheme);
        this.addToggleToNav();
    },

    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('horizone_theme', theme);
    },

    toggleTheme() {
        const isDark = document.body.classList.contains('dark-mode');
        this.applyTheme(isDark ? 'light' : 'dark');
    },

    addToggleToNav() {
        // Wait for header components to be ready
        const checkHeader = setInterval(() => {
            // Try different containers based on page layout
            const container = document.querySelector('.header-actions') ||
                document.querySelector('.header-right');

            if (container) {
                clearInterval(checkHeader);

                // Don't add if already exists
                if (document.getElementById('themeToggle')) return;

                const toggleBtn = document.createElement('button');
                toggleBtn.id = 'themeToggle';
                toggleBtn.className = 'theme-toggle';
                toggleBtn.setAttribute('title', 'Toggle Dark/Light Mode');
                toggleBtn.innerHTML = `
                    <i class="fas fa-moon"></i>
                    <i class="fas fa-sun"></i>
                `;

                toggleBtn.addEventListener('click', () => this.toggleTheme());

                // Insert into the header container
                container.prepend(toggleBtn);
            }
        }, 100);

        // Stop checking after 5 seconds
        setTimeout(() => clearInterval(checkHeader), 5000);
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});

// Re-add toggle if profile display script refreshes header-actions
window.addEventListener('storage', (e) => {
    if (e.key === 'horizone_user') {
        setTimeout(() => ThemeManager.addToggleToNav(), 100);
    }
});
