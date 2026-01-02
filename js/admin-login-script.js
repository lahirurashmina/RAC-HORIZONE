document.addEventListener("DOMContentLoaded", function () {
    // Note: We are NOT using the standard Auth class here as admins might need different storage/session logic
    // or we might want to keep it simpler for this demo.

    // Check if already logged in as admin (simple check)
    if (localStorage.getItem('horizone_admin_session')) {
        window.location.href = 'admin-dashboard.html';
        return;
    }

    // Toggle password visibility
    const togglePassword = document.querySelector(".show");
    const passwordInput = document.getElementById("password");

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);

            // Toggle text
            if (type === "password") {
                togglePassword.textContent = "SHOW";
            } else {
                togglePassword.textContent = "HIDE";
            }
        });
    }

    // Handle form submission
    const loginForm = document.getElementById("adminLoginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            // Basic validation
            if (!email || !password) {
                statusModal.show('warning', 'Missing Information', "Please fill in all required fields.");
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                statusModal.show('warning', 'Invalid Email', "Please enter a valid email address.");
                return;
            }

            // Disable submit button and show loading state
            const submitBtn = loginForm.querySelector('input[type="submit"]');
            const originalBtnText = submitBtn.value;
            submitBtn.value = "VERIFYING...";
            submitBtn.disabled = true;

            // Prepare form data
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);

            // Send admin login request to backend API
            fetch('api/admin-login.php', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Set admin as logged in with data from database
                        const adminData = {
                            adminId: data.admin.adminId,
                            name: data.admin.name,
                            email: data.admin.email,
                            role: 'admin',
                            loginTime: new Date().toISOString()
                        };

                        localStorage.setItem('horizone_admin_session', JSON.stringify(adminData));

                        // Show success message
                        statusModal.show('success', 'Welcome Back', data.message || "Admin authentication successful!", 'Dashboard', function () {
                            window.location.href = 'admin-dashboard.html';
                        });
                    } else {
                        // Show error message
                        statusModal.show('failed', 'Access Denied', data.message || "Invalid admin credentials.", 'Try Again');

                        // Re-enable submit button
                        submitBtn.value = originalBtnText;
                        submitBtn.disabled = false;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    statusModal.show('failed', 'Connection Error', "An error occurred during login. Please check your connection and try again.", 'Try Again');

                    // Re-enable submit button
                    submitBtn.value = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }
});
