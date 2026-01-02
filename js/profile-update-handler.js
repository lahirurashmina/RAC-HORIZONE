// Profile Update Handler for Dashboard
// This script handles the "Save Changes" button to update customer details in the database

document.addEventListener('DOMContentLoaded', function () {
    const profileForm = document.getElementById('profileForm');

    if (profileForm) {
        profileForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Get current user data
            const currentUser = (typeof Auth !== 'undefined' && Auth.isLoggedIn()) ? Auth.getCurrentUser() : null;

            if (!currentUser || !currentUser.customerId) {
                alert('Please log in to update your profile.');
                window.location.href = 'login.html';
                return;
            }

            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const address = document.getElementById('address').value.trim();
            const dateOfBirth = document.getElementById('dateOfBirth').value;
            const gender = (document.querySelector('input[name="gender"]:checked') || {}).value || '';
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            // Validate required fields
            if (!firstName || !lastName || !address || !dateOfBirth || !gender || !email) {
                statusModal.show('warning', 'Missing Information', 'Please fill in all required fields.');
                return;
            }

            // Basic email validation
            console.log('Validating email:', email);
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                statusModal.show('warning', 'Invalid Email', 'Please enter a valid email address.');
                return;
            }

            // Prepare FormData for API submission
            const formData = new FormData();
            formData.append('customerId', currentUser.customerId);
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);
            formData.append('address', address);
            formData.append('dateOfBirth', dateOfBirth);
            formData.append('gender', gender);
            formData.append('email', email);
            formData.append('phone', currentUser.phone || '');

            // Only include password if it's been changed
            if (password && password.length > 0) {
                formData.append('password', password);
            }

            // Add profile photo if selected
            const profilePhotoInput = document.getElementById('profilePhoto');
            if (profilePhotoInput && profilePhotoInput.files && profilePhotoInput.files[0]) {
                formData.append('profilePhoto', profilePhotoInput.files[0]);
            }

            // Find the submit button
            const submitBtn = profileForm.querySelector('button[type="submit"]') ||
                document.querySelector(`button[type="submit"][form="${profileForm.id}"]`);

            const originalText = submitBtn ? submitBtn.textContent : 'Save Changes';

            try {
                // Show loading state
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Saving...';
                }

                console.log('Sending update request for customer ID:', currentUser.customerId);

                // Send to API
                const response = await fetch('./api/update-profile.php', {
                    method: 'POST',
                    body: formData
                });

                const responseText = await response.text();
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (e) {
                    console.error('Failed to parse JSON response:', responseText);
                    throw new Error('Server returned an invalid response.');
                }

                console.log('API Response:', result);

                if (result.success) {
                    // Update Auth session with new data
                    if (typeof Auth !== 'undefined' && result.customer) {
                        const updatedUser = {
                            customerId: result.customer.id,
                            name: result.customer.name,
                            email: result.customer.email,
                            phone: result.customer.phone || '',
                            address: result.customer.address,
                            dateOfBirth: result.customer.dateOfBirth,
                            gender: result.customer.gender,
                            image: result.customer.image || 'images/profile.jpg'
                        };

                        // Update localStorage
                        localStorage.setItem('horizone_user', JSON.stringify(updatedUser));
                        console.log('Updated user session:', updatedUser);
                    }

                    // Close the edit profile modal first
                    const editModalEl = document.getElementById('editProfileModal');
                    const editModal = bootstrap.Modal.getInstance(editModalEl);
                    if (editModal) editModal.hide();

                    // Show success modal
                    statusModal.show(
                        'success',
                        'Update Successfully',
                        result.message || 'Your profile has been updated successfully.',
                        'View Details',
                        function () {
                            window.location.reload();
                        }
                    );

                } else {
                    // Show failed modal
                    statusModal.show('failed', 'Update Failed', result.message || 'Failed to update profile.', 'Try Again');

                    // Restore button state
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                }

            } catch (error) {
                console.error('Error updating profile:', error);

                // Show failed modal for errors
                statusModal.show('failed', 'Update Failed', 'Error: ' + error.message, 'Try Again');

                // Restore button state
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    }
});
