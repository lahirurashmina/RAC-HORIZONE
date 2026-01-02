// Authentication utility functions
const Auth = {
    // Check if user is logged in
    isLoggedIn: function() {
        const user = localStorage.getItem('horizone_user');
        return user !== null && user !== undefined;
    },

    // Get current user
    getCurrentUser: function() {
        const user = localStorage.getItem('horizone_user');
        if (user) {
            return JSON.parse(user);
        }
        return null;
    },

    // Set user as logged in
    login: function(userData) {
        localStorage.setItem('horizone_user', JSON.stringify(userData));
        localStorage.setItem('horizone_logged_in', 'true');
    },

    // Logout user
    logout: function() {
        localStorage.removeItem('horizone_user');
        localStorage.removeItem('horizone_logged_in');
    },

    // Check authentication and redirect if not logged in
    requireAuth: function(redirectUrl) {
        if (!this.isLoggedIn()) {
            // Store the current page to redirect back after login
            const currentPage = window.location.pathname + window.location.search;
            localStorage.setItem('horizone_redirect_after_login', currentPage);
            
            // Redirect to login page
            window.location.href = redirectUrl || 'login.html';
            return false;
        }
        return true;
    },

    // Get redirect URL after login
    getRedirectUrl: function() {
        const redirectUrl = localStorage.getItem('horizone_redirect_after_login');
        localStorage.removeItem('horizone_redirect_after_login');
        return redirectUrl || 'index-registered.html';
    }
};






