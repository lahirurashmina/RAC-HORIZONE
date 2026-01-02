/**
 * Profile Display Script
 * Automatically updates header based on login status:
 * - Before Login: Shows Sign Up and Sign In buttons
 * - After Login: Shows profile photo and name
 */

document.addEventListener('DOMContentLoaded', function () {
    // Function to update profile display based on login status
    function updateProfileDisplay() {
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;

        // Check if user is logged in
        const isLoggedIn = typeof Auth !== 'undefined' && Auth.isLoggedIn();

        if (isLoggedIn) {
            // User is logged in - show profile
            showUserProfile(headerActions);
        } else {
            // User is not logged in - show login/signup buttons
            showAuthButtons(headerActions);
        }
    }

    // Show user profile (photo and name)
    function showUserProfile(container) {
        const user = Auth.getCurrentUser();
        if (!user) return;

        const userName = user.name || 'Guest User';
        const userPhoto = user.image || 'images/profile.jpg';

        // Create profile HTML with Dropdown
        container.innerHTML = `
            <div class="dropdown">
                <a href="#" class="user-profile dropdown-toggle text-decoration-none" id="profileDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="${userPhoto}" alt="${userName}" class="user-avatar">
                    <span class="user-name">${userName}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="profileDropdown">
                    <li><a class="dropdown-item" href="dashboard.html"><i class="fas fa-th-large me-2"></i>Dashboard</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger logout-btn" href="#"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                </ul>
            </div>
        `;

        // Add event listener for logout
        const logoutBtn = container.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();

                const logoutModalElement = document.getElementById('logoutModal');

                if (logoutModalElement && typeof bootstrap !== 'undefined') {
                    // Use Bootstrap Modal
                    const logoutModal = new bootstrap.Modal(logoutModalElement);
                    logoutModal.show();

                    // Handle "Yes" (Logout) button in modal
                    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
                    if (confirmLogoutBtn) {
                        // Remove previous listeners to avoid duplicates
                        const newConfirmBtn = confirmLogoutBtn.cloneNode(true);
                        confirmLogoutBtn.parentNode.replaceChild(newConfirmBtn, confirmLogoutBtn);

                        newConfirmBtn.addEventListener('click', function () {
                            performLogout();
                        });
                    }
                } else {
                    // Fallback to simple confirmation
                    if (confirm('Are you sure you want to log out?')) {
                        performLogout();
                    }
                }
            });
        }

        console.log('Profile displayed:', { name: userName, photo: userPhoto });
    }

    // Helper function to perform logout
    function performLogout() {
        if (typeof Auth !== 'undefined') {
            Auth.logout();
        } else {
            localStorage.removeItem('horizone_user');
            localStorage.removeItem('horizone_logged_in');
        }
        // Redirect to login page
        window.location.href = 'login.html';
    }

    // Show Sign Up and Sign In buttons
    function showAuthButtons(container) {
        // Create auth buttons HTML
        container.innerHTML = `
            <a href="signup.html" class="btn btn-outline-primary btn-signup">Sign Up</a>
            <a href="login.html" class="btn btn-primary btn-signin">Sign In</a>
        `;

        console.log('Auth buttons displayed');
    }

    // Run profile update
    updateProfileDisplay();

    // Also listen for storage changes (if user logs in/out on another tab)
    window.addEventListener('storage', function (e) {
        if (e.key === 'horizone_user' || e.key === 'horizone_logged_in') {
            updateProfileDisplay();
        }
    });

    // Listen for custom login/logout events
    window.addEventListener('userLoggedIn', function () {
        updateProfileDisplay();
    });

    window.addEventListener('userLoggedOut', function () {
        updateProfileDisplay();
    });
});
