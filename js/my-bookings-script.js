document.addEventListener("DOMContentLoaded", function () {
    // Check authentication
    if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) {
        alert("Please login to view your bookings. Redirecting to login page...");
        localStorage.setItem('horizone_redirect_after_login', 'my-bookings.html');
        window.location.href = 'login.html';
        return;
    }

    // Get current user
    const currentUser = Auth.getCurrentUser();
    if (currentUser) {
        const userNameEl = document.getElementById('userName');
        if (userNameEl && currentUser.name) {
            userNameEl.textContent = currentUser.name;
        }
    }

    // Sample bookings data (in real app, this would come from an API)
    let bookings = [
        {
            id: 'BK-2847',
            carName: 'BMW 5 Series',
            carImage: 'images/car1.jpg',
            status: 'active',
            pickupDate: '2025-01-15',
            returnDate: '2025-01-20',
            pickupLocation: 'Downtown Office',
            returnLocation: 'Downtown Office',
            totalPrice: 445.00,
            dailyRate: 89,
            insurance: 45,
            taxes: 28,
            extras: ['Child Safety Seat', 'GPS Device'],
            bookingDate: '2025-01-10'
        },
        {
            id: 'BK-2891',
            carName: 'Tesla Model 3',
            carImage: 'images/car2.jpg',
            status: 'upcoming',
            pickupDate: '2025-02-01',
            returnDate: '2025-02-05',
            pickupLocation: 'Airport Terminal',
            returnLocation: 'Airport Terminal',
            totalPrice: 570.00,
            dailyRate: 95,
            insurance: 45,
            taxes: 28,
            extras: ['Additional Driver'],
            bookingDate: '2025-01-12'
        },
        {
            id: 'BK-2756',
            carName: 'Mercedes GLE',
            carImage: 'images/car3.jpg',
            status: 'completed',
            pickupDate: '2024-12-10',
            returnDate: '2024-12-15',
            pickupLocation: 'Central Station',
            returnLocation: 'Central Station',
            totalPrice: 720.00,
            dailyRate: 120,
            insurance: 45,
            taxes: 28,
            extras: [],
            bookingDate: '2024-12-05'
        },
        {
            id: 'BK-2634',
            carName: 'Audi A4',
            carImage: 'images/car4.jpg',
            status: 'cancelled',
            pickupDate: '2024-11-20',
            returnDate: '2024-11-25',
            pickupLocation: 'North Branch',
            returnLocation: 'North Branch',
            totalPrice: 510.00,
            dailyRate: 85,
            insurance: 45,
            taxes: 28,
            extras: ['GPS Device'],
            bookingDate: '2024-11-15'
        }
    ];

    // Load bookings from localStorage if available
    const savedBookings = localStorage.getItem('horizone_bookings');
    if (savedBookings) {
        try {
            const parsed = JSON.parse(savedBookings);
            if (Array.isArray(parsed) && parsed.length > 0) {
                bookings = parsed;
            }
        } catch (e) {
            console.error('Error loading bookings:', e);
        }
    }

    let currentFilter = 'all';

    // Initialize
    renderBookings(bookings);

    // Filter tabs event listeners
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            filterBookings(currentFilter);
        });
    });

    function filterBookings(filter) {
        let filteredBookings = bookings;
        
        if (filter !== 'all') {
            filteredBookings = bookings.filter(booking => booking.status === filter);
        }

        renderBookings(filteredBookings);
    }

    function renderBookings(bookingsToRender) {
        const container = document.getElementById('bookingsContainer');
        const emptyState = document.getElementById('emptyState');

        if (bookingsToRender.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        emptyState.style.display = 'none';

        container.innerHTML = bookingsToRender.map(booking => createBookingCard(booking)).join('');

        // Add event listeners to view details buttons
        document.querySelectorAll('.btn-view-details').forEach(btn => {
            btn.addEventListener('click', function () {
                const bookingId = this.getAttribute('data-booking-id');
                showBookingDetails(bookingId);
            });
        });

        // Add event listeners to cancel buttons
        document.querySelectorAll('.btn-cancel-booking').forEach(btn => {
            btn.addEventListener('click', function () {
                const bookingId = this.getAttribute('data-booking-id');
                cancelBooking(bookingId);
            });
        });
    }

    function createBookingCard(booking) {
        const statusClass = `status-${booking.status}`;
        const statusText = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
        const days = calculateDays(booking.pickupDate, booking.returnDate);
        const canCancel = booking.status === 'upcoming' || booking.status === 'active';

        return `
            <div class="booking-card">
                <div class="booking-header">
                    <span class="booking-status ${statusClass}">${statusText}</span>
                </div>
                <div class="booking-content">
                    <div class="booking-car-info">
                        <img src="${booking.carImage}" alt="${booking.carName}" class="booking-car-image">
                        <div class="booking-car-details">
                            <h3>${booking.carName}</h3>
                            <p class="booking-id">#${booking.id}</p>
                        </div>
                    </div>
                    <div class="booking-info-grid">
                        <div class="booking-info-item">
                            <i class="fas fa-calendar"></i>
                            <div>
                                <div class="booking-info-label">Pickup Date</div>
                                <div class="booking-info-value">${formatDate(booking.pickupDate)}</div>
                            </div>
                        </div>
                        <div class="booking-info-item">
                            <i class="fas fa-calendar-check"></i>
                            <div>
                                <div class="booking-info-label">Return Date</div>
                                <div class="booking-info-value">${formatDate(booking.returnDate)}</div>
                            </div>
                        </div>
                        <div class="booking-info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <div>
                                <div class="booking-info-label">Pickup Location</div>
                                <div class="booking-info-value">${booking.pickupLocation}</div>
                            </div>
                        </div>
                        <div class="booking-info-item">
                            <i class="fas fa-clock"></i>
                            <div>
                                <div class="booking-info-label">Duration</div>
                                <div class="booking-info-value">${days} ${days === 1 ? 'day' : 'days'}</div>
                            </div>
                        </div>
                    </div>
                    <div class="booking-total">
                        <span class="total-label">Total Amount</span>
                        <span class="total-amount">$${booking.totalPrice.toFixed(2)}</span>
                    </div>
                    <div class="booking-actions">
                        <button class="btn btn-primary btn-view-details" data-booking-id="${booking.id}">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        ${canCancel ? `
                            <button class="btn-cancel-booking" data-booking-id="${booking.id}">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    function showBookingDetails(bookingId) {
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return;

        const modal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'));
        const content = document.getElementById('bookingDetailsContent');
        const cancelBtn = document.getElementById('cancelBookingBtn');
        const days = calculateDays(booking.pickupDate, booking.returnDate);

        const canCancel = booking.status === 'upcoming' || booking.status === 'active';
        cancelBtn.style.display = canCancel ? 'block' : 'none';
        cancelBtn.setAttribute('data-booking-id', bookingId);

        content.innerHTML = `
            <div class="booking-details-header mb-4">
                <div class="d-flex align-items-center gap-3 mb-3">
                    <img src="${booking.carImage}" alt="${booking.carName}" style="width: 150px; height: 100px; object-fit: cover; border-radius: 8px;">
                    <div>
                        <h4>${booking.carName}</h4>
                        <p class="text-muted mb-0">Booking ID: #${booking.id}</p>
                        <span class="booking-status status-${booking.status} mt-2 d-inline-block">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                    </div>
                </div>
            </div>
            <div class="booking-details-grid">
                <div class="detail-group">
                    <div class="detail-label">Pickup Date</div>
                    <div class="detail-value">${formatDate(booking.pickupDate)}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Return Date</div>
                    <div class="detail-value">${formatDate(booking.returnDate)}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Duration</div>
                    <div class="detail-value">${days} ${days === 1 ? 'day' : 'days'}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Pickup Location</div>
                    <div class="detail-value">${booking.pickupLocation}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Return Location</div>
                    <div class="detail-value">${booking.returnLocation}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Booking Date</div>
                    <div class="detail-value">${formatDate(booking.bookingDate)}</div>
                </div>
            </div>
            <div class="pricing-breakdown mt-4 p-3 bg-light rounded">
                <h5 class="mb-3">Pricing Breakdown</h5>
                <div class="d-flex justify-content-between mb-2">
                    <span>Daily Rate (${days} days × $${booking.dailyRate}/day)</span>
                    <span>$${(booking.dailyRate * days).toFixed(2)}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Insurance</span>
                    <span>$${booking.insurance.toFixed(2)}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Taxes & Fees</span>
                    <span>$${booking.taxes.toFixed(2)}</span>
                </div>
                ${booking.extras.length > 0 ? `
                    <div class="d-flex justify-content-between mb-2">
                        <span>Extras</span>
                        <span>$${(booking.totalPrice - booking.dailyRate * days - booking.insurance - booking.taxes).toFixed(2)}</span>
                    </div>
                ` : ''}
                <hr>
                <div class="d-flex justify-content-between">
                    <strong>Total</strong>
                    <strong class="text-primary">$${booking.totalPrice.toFixed(2)}</strong>
                </div>
            </div>
            ${booking.extras.length > 0 ? `
                <div class="booking-extras">
                    <h5 class="mb-3">Selected Extras</h5>
                    <ul class="extras-list">
                        ${booking.extras.map(extra => `<li><i class="fas fa-check"></i> ${extra}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;

        modal.show();
    }

    function cancelBooking(bookingId) {
        if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            return;
        }

        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        if (bookingIndex !== -1) {
            bookings[bookingIndex].status = 'cancelled';
            saveBookings();
            filterBookings(currentFilter);
            
            // Close modal if open
            const modal = bootstrap.Modal.getInstance(document.getElementById('bookingDetailsModal'));
            if (modal) {
                modal.hide();
            }

            alert('Booking cancelled successfully.');
        }
    }

    function saveBookings() {
        localStorage.setItem('horizone_bookings', JSON.stringify(bookings));
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    function calculateDays(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    }

    // Handle cancel button in modal
    document.getElementById('cancelBookingBtn').addEventListener('click', function() {
        const bookingId = this.getAttribute('data-booking-id');
        if (bookingId) {
            cancelBooking(bookingId);
        }
    });

    // Function to add new booking (can be called from car-details page)
    window.addBooking = function(bookingData) {
        const newBooking = {
            id: 'BK-' + Math.floor(1000 + Math.random() * 9000),
            carName: bookingData.carName || 'BMW 5 Series',
            carImage: bookingData.carImage || 'images/car1.jpg',
            status: 'upcoming',
            pickupDate: bookingData.pickupDate,
            returnDate: bookingData.returnDate,
            pickupLocation: bookingData.pickupLocation,
            returnLocation: bookingData.returnLocation,
            totalPrice: bookingData.totalPrice,
            dailyRate: bookingData.dailyRate || 89,
            insurance: 45,
            taxes: 28,
            extras: bookingData.extras || [],
            bookingDate: new Date().toISOString().split('T')[0]
        };

        bookings.unshift(newBooking);
        saveBookings();
        filterBookings(currentFilter);
    };
});






