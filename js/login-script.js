document.addEventListener("DOMContentLoaded", function () {
    // Check if already logged in
    if (Auth.isLoggedIn()) {
        window.location.href = 'index-registered.html';
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
    const loginForm = document.getElementById("loginForm");
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

            // Prepare form data for API
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);

            // Disable submit button and show loading state
            const submitBtn = loginForm.querySelector('input[type="submit"]');
            const originalBtnText = submitBtn.value;
            submitBtn.value = "LOGGING IN...";
            submitBtn.disabled = true;

            // Send login request to backend API
            fetch('api/login.php', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Set user as logged in with data from database
                        const userData = {
                            customerId: data.user.customerId,
                            name: data.user.name,
                            email: data.user.email,
                            phone: data.user.phone,
                            address: data.user.address,
                            dateOfBirth: data.user.dateOfBirth,
                            gender: data.user.gender,
                            image: data.user.image,
                            createdDate: data.user.createdDate,
                            loginTime: new Date().toISOString()
                        };
                        Auth.login(userData);

                        // Show success message
                        statusModal.show('success', 'Safe Travels!', data.message || "Login successful!", 'Continue', function () {
                            // Redirect to the page user was trying to access, or default page
                            const redirectUrl = Auth.getRedirectUrl();
                            window.location.href = redirectUrl;
                        });
                    } else {
                        // Show error message
                        statusModal.show('failed', 'Login Failed', data.message || "Login failed. Please check your credentials.", 'Try Again');

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
