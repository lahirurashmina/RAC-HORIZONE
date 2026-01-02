// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Initialize dashboard functionality
    initNavigation();
    initNotifications();
    initTableInteractions();
    initQuickActions();
    initStatusFilter();
    initPagination();
    initProfile();
    initLogout();

    // Load and update data
    loadBookings();
    updateDashboardStats();
});

// Navigation functionality
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
        });
    });
}

// Notification functionality
function initNotifications() {
    const notificationIcon = document.querySelector('.notification-icon');

    if (notificationIcon) {
        notificationIcon.addEventListener('click', function () {
            // Toggle notification dropdown (can be extended)
            alert('You have 3 unread notifications');
        });
    }
}

// Table interactions
function initTableInteractions() {
    const tableRows = document.querySelectorAll('.booking-table tbody tr');

    tableRows.forEach(row => {
        row.addEventListener('click', function () {
            // Add visual feedback when row is clicked
            tableRows.forEach(r => r.classList.remove('selected'));
            this.classList.add('selected');

            // Can navigate to booking details page
            const carName = this.querySelector('.car-name').textContent;
            console.log('Viewing details for:', carName);
        });
    });
}

// Quick Actions functionality
function initQuickActions() {
    const findCarBtn = document.querySelector('.action-btn.btn-primary');
    const viewCalendarBtn = document.querySelectorAll('.action-btn.btn-outline')[0];
    const contactSupportBtn = document.querySelectorAll('.action-btn.btn-outline')[1];
    const newBookingBtn = document.querySelector('.btn-new-booking');
    const editProfileBtn = document.querySelector('.btn-edit-profile');

    if (findCarBtn) {
        findCarBtn.addEventListener('click', function () {
            window.location.href = 'catalog.html';
        });
    }

    if (viewCalendarBtn) {
        viewCalendarBtn.addEventListener('click', function () {
            const modalEl = document.getElementById('calendarModal');
            if (modalEl) {
                const modal = new bootstrap.Modal(modalEl);
                initCalendar(); // Initialize calendar logic
                modal.show();
            }
        });
    }

    if (contactSupportBtn) {
        contactSupportBtn.addEventListener('click', function () {
            window.location.href = 'contact.html';
        });
    }

    if (newBookingBtn) {
        newBookingBtn.addEventListener('click', function () {
            window.location.href = 'catalog.html';
        });
    }

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function () {
            openProfileModal();
        });
    }
}

// Profile modal logic
function initProfile() {
    const profileNav = document.querySelector('.profile-nav');
    if (profileNav) {
        profileNav.addEventListener('click', function (e) {
            e.preventDefault();
            openProfileSummaryModal();
        });
    }

    // Load saved profile from localStorage
    const savedProfile = loadProfile();
    applyProfileToUI(savedProfile);

    // Modal elements
    const profileForm = document.getElementById('profileForm');
    const profilePhotoInput = document.getElementById('profilePhoto');
    const profilePreview = document.getElementById('profilePreview');

    if (profilePhotoInput && profilePreview) {
        profilePhotoInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file.');
                profilePhotoInput.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = function (ev) {
                profilePreview.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Profile form submission is now handled by js/profile-update-handler.js
}

function openProfileSummaryModal() {
    const savedProfile = loadProfile();
    const activeRentals = document.getElementById('activeRentalsCount') ? document.getElementById('activeRentalsCount').textContent : '0';

    // Populate summary modal
    const summaryName = document.getElementById('summaryName');
    const summaryEmail = document.getElementById('summaryEmail');
    const summaryPhone = document.getElementById('summaryPhone');
    const summaryJoined = document.getElementById('summaryJoined');
    const summaryAddress = document.getElementById('summaryAddress');
    const summaryActiveRentals = document.getElementById('summaryActiveRentals');
    const summaryAvatar = document.getElementById('summaryAvatar');

    const fullName = (savedProfile.firstName && savedProfile.lastName) ?
        `${savedProfile.firstName} ${savedProfile.lastName}` : (savedProfile.fullName || 'Lahiru Rash');

    if (summaryName) summaryName.textContent = fullName;
    if (summaryEmail) summaryEmail.textContent = savedProfile.email || 'lrc2025@email.com';
    if (summaryPhone) summaryPhone.textContent = savedProfile.phone || '+1 (555) 123-4567';
    if (summaryJoined) summaryJoined.textContent = formatMemberSince(savedProfile.createdDate || '2023-01-01');
    if (summaryAddress) summaryAddress.textContent = savedProfile.address || 'Colombo, Sri Lanka';
    if (summaryActiveRentals) summaryActiveRentals.textContent = activeRentals;
    if (summaryAvatar) summaryAvatar.src = savedProfile.photo || 'images/profile.jpg';

    const modalEl = document.getElementById('profileSummaryModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

function openProfileModal() {
    const savedProfile = loadProfile();
    // Populate form with saved data or defaults
    setValue('firstName', savedProfile.firstName || 'Lahiru');
    setValue('lastName', savedProfile.lastName || 'Rash');
    setValue('address', savedProfile.address || 'Colombo, Sri Lanka');
    setValue('dateOfBirth', savedProfile.dateOfBirth || '1995-01-01');
    setValue('email', savedProfile.email || 'lrc2025@email.com');
    setValue('password', savedProfile.password || '');

    const genderValue = savedProfile.gender || 'male';
    const genderInput = document.querySelector(`input[name="gender"][value="${genderValue}"]`);
    if (genderInput) genderInput.checked = true;

    const profilePreview = document.getElementById('profilePreview');
    if (profilePreview) {
        profilePreview.src = savedProfile.photo || 'images/profile.jpg';
    }

    const modalEl = document.getElementById('editProfileModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

function loadProfile() {
    // First check if user is logged in via Auth
    if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
        const user = Auth.getCurrentUser();
        if (user) {
            // Return user data from Auth session
            return {
                firstName: user.name ? user.name.split(' ')[0] : '',
                lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
                fullName: user.name || 'Guest User',
                email: user.email || '',
                phone: user.phone || 'Not provided',
                address: user.address || 'Not provided',
                dateOfBirth: user.dateOfBirth || '',
                gender: user.gender || '',
                photo: user.image || 'images/profile.jpg',
                createdDate: user.createdDate || new Date().toISOString().split('T')[0],
                customerId: user.customerId || null
            };
        }
    }

    // Fallback to localStorage profile
    const saved = localStorage.getItem('horizone_profile');
    if (!saved) return {};
    try {
        return JSON.parse(saved);
    } catch (e) {
        console.error('Failed to parse profile', e);
        return {};
    }
}

function applyProfileToUI(profile) {
    // Get user data from Auth if available
    const user = (typeof Auth !== 'undefined' && Auth.isLoggedIn()) ? Auth.getCurrentUser() : null;

    const fullName = user ? user.name : (profile.fullName || [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Guest User');
    const email = user ? user.email : (profile.email || 'user@example.com');
    const photo = user ? (user.image || 'images/profile.jpg') : (profile.photo || 'images/profile.jpg');
    const phone = user ? (user.phone || 'Not provided') : (profile.phone || 'Not provided');
    const createdDate = user ? user.createdDate : (profile.createdDate || new Date().toISOString().split('T')[0]);

    // Format member since date
    const memberSince = formatMemberSince(createdDate);

    // Update welcome title
    const welcomeTitle = document.querySelector('.welcome-title');
    if (welcomeTitle) {
        const firstName = fullName.split(' ')[0];
        welcomeTitle.textContent = `Welcome back, ${firstName}!`;
    }

    // Update profile sidebar
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAvatar = document.getElementById('profileAvatar');

    if (profileName) profileName.textContent = fullName;
    if (profileEmail) profileEmail.textContent = email;
    if (profileAvatar) profileAvatar.src = photo;

    // Update profile details in sidebar
    const detailRows = document.querySelectorAll('.detail-row');
    if (detailRows.length >= 2) {
        // Update Member Since
        const memberSinceValue = detailRows[0].querySelector('.detail-value');
        if (memberSinceValue) memberSinceValue.textContent = memberSince;

        // Update Phone
        const phoneValue = detailRows[1].querySelector('.detail-value');
        if (phoneValue) phoneValue.textContent = phone;
    }

    // Update header profile
    const headerProfile = document.querySelector('.user-profile-header .user-name-header');
    if (headerProfile) headerProfile.textContent = fullName;

    const headerAvatar = document.querySelector('.user-profile-header .user-avatar-header');
    if (headerAvatar) headerAvatar.src = photo;

    console.log('Dashboard profile updated:', {
        name: fullName,
        email: email,
        photo: photo,
        phone: phone,
        memberSince: memberSince
    });
}

// Helper function to format member since date
function formatMemberSince(dateString) {
    if (!dateString) return 'Recently';

    try {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short' };
        return date.toLocaleDateString('en-US', options);
    } catch (e) {
        return 'Recently';
    }
}

// Status filter functionality
function initStatusFilter() {
    const statusFilter = document.querySelector('.status-filter');

    if (statusFilter) {
        statusFilter.addEventListener('change', function () {
            const selectedStatus = this.value;
            const tableRows = document.querySelectorAll('.booking-table tbody tr');

            tableRows.forEach(row => {
                const statusBadge = row.querySelector('.status-badge');
                if (statusBadge) {
                    const rowStatus = statusBadge.textContent.trim();

                    if (selectedStatus === 'All Status') {
                        row.style.display = '';
                    } else if (rowStatus === selectedStatus) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });

            // Update table info
            updateTableInfo();
        });
    }
}

// Pagination functionality
function initPagination() {
    const pageButtons = document.querySelectorAll('.page-btn');

    pageButtons.forEach(button => {
        button.addEventListener('click', function () {
            if (this.disabled || this.classList.contains('active')) {
                return;
            }

            // Remove active class from all buttons
            pageButtons.forEach(btn => {
                if (!btn.disabled) {
                    btn.classList.remove('active');
                }
            });

            // Add active class to clicked button
            if (this.textContent !== 'Previous' && this.textContent !== 'Next') {
                this.classList.add('active');
            }

            // Handle Previous/Next buttons
            if (this.textContent === 'Previous') {
                const activeBtn = document.querySelector('.page-btn.active');
                if (activeBtn) {
                    const currentPage = parseInt(activeBtn.textContent);
                    if (currentPage > 1) {
                        const prevBtn = Array.from(pageButtons).find(btn =>
                            btn.textContent === (currentPage - 1).toString()
                        );
                        if (prevBtn) {
                            activeBtn.classList.remove('active');
                            prevBtn.classList.add('active');
                        }
                    }
                }
            } else if (this.textContent === 'Next') {
                const activeBtn = document.querySelector('.page-btn.active');
                if (activeBtn) {
                    const currentPage = parseInt(activeBtn.textContent);
                    const nextBtn = Array.from(pageButtons).find(btn =>
                        btn.textContent === (currentPage + 1).toString()
                    );
                    if (nextBtn) {
                        activeBtn.classList.remove('active');
                        nextBtn.classList.add('active');
                    }
                }
            }

            // Update table info
            updateTableInfo();
        });
    });
}

// Update table info text
function updateTableInfo() {
    const visibleRows = Array.from(document.querySelectorAll('.booking-table tbody tr'))
        .filter(row => row.style.display !== 'none');
    const totalRows = document.querySelectorAll('.booking-table tbody tr').length;

    const tableInfo = document.querySelector('.table-info');
    if (tableInfo) {
        const activePage = document.querySelector('.page-btn.active');
        const currentPage = activePage ? parseInt(activePage.textContent) : 1;
        const itemsPerPage = 3;
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(start + itemsPerPage - 1, visibleRows.length);

        tableInfo.textContent = `Showing ${start}-${end} of ${visibleRows.length} bookings`;
    }
}

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation for cards
window.addEventListener('load', function () {
    const cards = document.querySelectorAll('.summary-card, .sidebar-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s, transform 0.5s';

            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        }, index * 100);
    });
});

// User profile link - navigate to dashboard
const userProfileHeader = document.querySelector('.user-profile-header');
if (userProfileHeader) {
    userProfileHeader.addEventListener('click', function (e) {
        // If already on dashboard, scroll to profile section
        if (window.location.pathname.includes('dashboard.html') || window.location.pathname.endsWith('dashboard.html')) {
            e.preventDefault();
            const profileSection = document.querySelector('.right-sidebar');
            if (profileSection) {
                profileSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        // Otherwise, the link will navigate to dashboard.html
    });
}

// Responsive sidebar toggle (for mobile)
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('sidebar-open');
    }
}

// Add hover effects to summary cards
const summaryCards = document.querySelectorAll('.summary-card');
summaryCards.forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-5px)';
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0)';
    });
});

// Logout functionality
function initLogout() {
    const logoutNav = document.querySelector('.logout-nav');
    const logoutModalElement = document.getElementById('logoutModal');

    if (logoutNav && logoutModalElement) {
        const logoutModal = new bootstrap.Modal(logoutModalElement);
        const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');

        logoutNav.addEventListener('click', function (e) {
            e.preventDefault();
            logoutModal.show();
        });

        if (confirmLogoutBtn) {
            confirmLogoutBtn.addEventListener('click', function () {
                // Perform logout actions here
                if (typeof Auth !== 'undefined') {
                    Auth.logout();
                } else {
                    // Fallback if Auth is not available
                    localStorage.removeItem('horizone_user_session');
                }
                // Always redirect to login page
                window.location.href = 'login.html';
            });
        }
    }
}

// Load bookings from local storage
function loadBookings() {
    const tableBody = document.querySelector('.booking-table tbody');
    if (!tableBody) return;

    try {
        const savedBookings = JSON.parse(localStorage.getItem('horizone_bookings') || '[]');

        if (savedBookings.length > 0) {
            savedBookings.forEach(booking => {
                const row = document.createElement('tr');

                // Format dates safely
                let dateStr = 'Date';
                try {
                    const startDate = new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const endDate = new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    dateStr = `${startDate} - ${endDate}`;
                } catch (e) { dateStr = booking.startDate; }

                // Status class map
                const statusMap = {
                    'Active': 'status-active',
                    'Confirmed': 'status-active',
                    'Completed': 'status-completed',
                    'Cancelled': 'status-cancelled',
                    'Pending': 'status-active'
                };
                const statusClass = statusMap[booking.status] || 'status-active';

                row.innerHTML = `
                    <td>
                        <div class="car-info-cell">
                            <i class="fas fa-car car-icon"></i>
                            <div>
                                <div class="car-name">${booking.carName || 'Rental Car'}</div>
                                <div class="car-type">Premium</div>
                            </div>
                        </div>
                    </td>
                    <td>${dateStr}</td>
                    <td>${booking.days || 1} days</td>
                    <td class="amount">$${(booking.totalPrice || 0).toFixed(2)}</td>
                    <td><span class="status-badge ${statusClass}">${booking.status || 'Active'}</span></td>
                `;

                // Insert at the beginning of the table
                tableBody.insertBefore(row, tableBody.firstChild);
            });
        }
    } catch (e) {
        console.error('Error loading bookings:', e);
    }
}

// Update Dashboard Statistics
function updateDashboardStats() {
    const rows = document.querySelectorAll('.booking-table tbody tr');
    const totalBookings = rows.length;
    let activeRentals = 0;

    rows.forEach(row => {
        const badge = row.querySelector('.status-badge');
        if (badge) {
            const status = badge.textContent.trim();
            if (status === 'Active' || status === 'Confirmed' || status === 'Pending') {
                activeRentals++;
            }
        }
    });

    const totalEl = document.getElementById('totalBookingsCount');
    const activeEl = document.getElementById('activeRentalsCount');

    // Update numbers
    if (totalEl) totalEl.textContent = totalBookings;
    if (activeEl) activeEl.textContent = activeRentals;

    // Also update table info immediately
    updateTableInfo();
}

// Calendar Functionality
let currentCalendarDate = new Date();

function initCalendar() {
    renderCalendar(currentCalendarDate);

    // Event listeners for month navigation
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');

    // Remove existing event listeners to avoid duplicates
    if (prevBtn && nextBtn) {
        const newPrevBtn = prevBtn.cloneNode(true);
        const newNextBtn = nextBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

        newPrevBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar(currentCalendarDate);
        });

        newNextBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar(currentCalendarDate);
        });
    }
}

function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Update header
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    document.getElementById('currentMonthYear').textContent = `${monthNames[month]} ${year}`;

    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Get bookings
    const bookings = getBookingsForMonth(year, month);

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        grid.appendChild(emptyCell);
    }

    // Days with data
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        cell.textContent = day;

        // Check if today
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            cell.classList.add('today');
        }

        // Check for bookings
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const booking = bookings.find(b => isDateInRange(dateStr, b.start, b.end));

        if (booking) {
            cell.classList.add('booked');
            const badge = document.createElement('div');
            badge.className = `day-badge ${getBookingClass(booking.status)}`;
            badge.title = `${booking.carName} (${booking.status})`;
            cell.appendChild(badge);
        }

        grid.appendChild(cell);
    }
}

function getBookingsForMonth(year, month) {
    // This example simulates extracting booking ranges.
    // In a real app, you would parse the booking dates more robustly.
    const bookings = [];
    try {
        const storedBookings = JSON.parse(localStorage.getItem('horizone_bookings') || '[]');
        storedBookings.forEach(b => {
            // Basic date parsing logic assuming standard formats or the one we saved
            // We need to normalize dates for comparison
            const start = new Date(b.startDate);
            const end = new Date(b.endDate);

            // Check if booking overlaps with current month
            // Simple check: start or end is in this month, or spans over it
            // Actually, we just return all valid bookings and isDateInRange handles the check
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                bookings.push({
                    start: start,
                    end: end,
                    status: b.status || 'Active',
                    carName: b.carName || 'Car'
                });
            }
        });
    } catch (e) {
        console.error("Error parsing bookings for calendar", e);
    }
    return bookings;
}

function isDateInRange(targetDateStr, startDate, endDate) {
    const target = new Date(targetDateStr);
    // Normalize times to midnight to compare dates only
    target.setHours(0, 0, 0, 0);
    const start = new Date(startDate); start.setHours(0, 0, 0, 0);
    const end = new Date(endDate); end.setHours(0, 0, 0, 0);

    return target >= start && target <= end;
}

function getBookingClass(status) {
    status = status.toLowerCase();
    if (status === 'active' || status === 'confirmed') return 'active-booking';
    if (status === 'completed') return 'completed-booking';
    if (status === 'cancelled') return 'cancelled-booking'; // Maybe red?
    return 'upcoming-booking';
}

