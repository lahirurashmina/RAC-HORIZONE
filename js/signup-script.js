document.addEventListener("DOMContentLoaded", function () {
    // Check if already logged in (requires auth.js to be loaded)
    if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
        window.location.href = 'index-registered.html';
        return;
    }

    // Set created date to today
    const createdDateInput = document.getElementById("createdDate");
    if (createdDateInput) {
        const today = new Date().toISOString().split('T')[0];
        createdDateInput.value = today;
    }

    // Profile photo upload and preview
    const profilePhotoInput = document.getElementById("profilePhoto");
    const photoPreview = document.getElementById("photoPreview");
    const photoText = document.getElementById("photoText");

    if (profilePhotoInput && photoPreview && photoText) {
        profilePhotoInput.addEventListener("change", function (e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    CustomAlert.error("Please select an image file.");
                    profilePhotoInput.value = '';
                    return;
                }

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    CustomAlert.warning("Image size should be less than 5MB.");
                    profilePhotoInput.value = '';
                    return;
                }

                // Show preview
                const reader = new FileReader();
                reader.onload = function (e) {
                    photoPreview.innerHTML = `<img src="${e.target.result}" alt="Profile Preview">`;
                    photoPreview.classList.add('active');
                    photoText.textContent = 'Change Photo';
                    // Optional: Show success message for upload
                    // CustomAlert.success("Photo selected successfully!");
                };
                reader.readAsDataURL(file);
            }
        });
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

    // Google Signup
    const googleSignupBtn = document.getElementById("googleSignup");
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener("click", function () {
            // In a real application, you would implement Google OAuth here
            console.log("Google signup clicked");

            // Simulate Google signup
            alert("Google signup functionality would be implemented here.\nIn a real application, this would redirect to Google OAuth.");

            // Example: window.location.href = 'https://accounts.google.com/o/oauth2/auth?...';
        });
    }

    // Handle form submission
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const firstName = document.getElementById("firstName").value.trim();
            const lastName = document.getElementById("lastName").value.trim();
            const email = document.getElementById("email").value.trim();
            const address = document.getElementById("address").value.trim();
            const dateOfBirth = document.getElementById("dateOfBirth").value;
            const gender = document.querySelector('input[name="gender"]:checked');
            const phone = document.getElementById("phone").value.trim();
            const password = document.getElementById("password").value;
            const createdDate = document.getElementById("createdDate").value;
            const profilePhoto = document.getElementById("profilePhoto").files[0];

            // Basic validation
            if (!firstName || !lastName || !email || !phone || !address || !dateOfBirth || !gender || !password) {
                statusModal.show('warning', 'Missing Information', "Please fill in all required fields.");
                return;
            }

            // First name and last name validation
            if (firstName.length < 2) {
                statusModal.show('warning', 'Invalid Input', "First name must be at least 2 characters long.");
                return;
            }

            if (lastName.length < 2) {
                statusModal.show('warning', 'Invalid Input', "Last name must be at least 2 characters long.");
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                statusModal.show('warning', 'Invalid Email', "Please enter a valid email address.");
                return;
            }

            // Phone validation
            const phoneRegex = /^\+?[\d\s-]{10,}$/;
            if (!phoneRegex.test(phone)) {
                statusModal.show('warning', 'Invalid Phone', "Please enter a valid phone number (at least 10 digits).");
                return;
            }

            // Address validation
            if (address.length < 5) {
                statusModal.show('warning', 'Invalid Address', "Please enter a valid address.");
                return;
            }

            // Date of birth validation
            const dob = new Date(dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();

            if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < dob.getDate())) {
                statusModal.show('failed', 'Age Restriction', "You must be at least 18 years old to register.");
                return;
            }

            if (dob > today) {
                statusModal.show('warning', 'Invalid Date', "Date of birth cannot be in the future.");
                return;
            }

            // Password validation
            if (password.length < 6) {
                statusModal.show('warning', 'Weak Password', "Password must be at least 6 characters long.");
                return;
            }

            // Password strength check (optional)
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
            if (!passwordRegex.test(password)) {
                statusModal.show('warning', 'Weak Password', "For better security, please include at least one uppercase letter, one lowercase letter, and one number.");
                return;
            }

            // Profile photo validation (optional but check if provided)
            if (profilePhoto) {
                if (!profilePhoto.type.startsWith('image/')) {
                    statusModal.show('warning', 'Invalid File', "Profile photo must be an image file.");
                    return;
                }
                if (profilePhoto.size > 5 * 1024 * 1024) {
                    statusModal.show('warning', 'File Too Large', "Profile photo size should be less than 5MB.");
                    return;
                }
            }

            // Prepare form data for API
            const formDataToSend = new FormData();
            formDataToSend.append('firstName', firstName);
            formDataToSend.append('lastName', lastName);
            formDataToSend.append('email', email);
            formDataToSend.append('phone', phone);
            formDataToSend.append('address', address);
            formDataToSend.append('dateOfBirth', dateOfBirth);
            formDataToSend.append('gender', gender.value);
            formDataToSend.append('password', password);
            formDataToSend.append('createdDate', createdDate);

            // Append profile photo if selected
            if (profilePhoto) {
                formDataToSend.append('profilePhoto', profilePhoto);
            }

            // Disable submit button and show loading state
            const submitBtn = document.getElementById("registerBtn");
            const originalBtnText = submitBtn.value;
            submitBtn.value = "REGISTERING...";
            submitBtn.disabled = true;

            // Send data to backend API
            fetch('api/signup.php', {
                method: 'POST',
                body: formDataToSend
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Show success message
                        statusModal.show('success', 'Signup Successful', data.message || "Account created successfully!", 'Login Now', function () {
                            // Redirect to login page
                            window.location.href = 'login.html';
                        });
                    } else {
                        // Show error message
                        statusModal.show('failed', 'Signup Failed', data.message || "Registration failed. Please try again.", 'Try Again');

                        // Re-enable submit button
                        submitBtn.value = originalBtnText;
                        submitBtn.disabled = false;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    statusModal.show('failed', 'Connection Error', "An error occurred during registration. Please check your connection and try again.", 'Try Again');

                    // Re-enable submit button
                    submitBtn.value = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }
});

