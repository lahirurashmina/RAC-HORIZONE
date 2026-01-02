// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Initialize dashboard functionality
    initAdminProfile();
    initNavigation();
    initNotifications();
    initTabs();
    initAdminLogout();

    // Fetch initial data
    fetchAdminData();

    // Handle vehicle form submission
    const vehicleForm = document.getElementById('vehicleForm');
    if (vehicleForm) {
        vehicleForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleVehicleSubmit(this);
        });
    }
    // Handle customer form submission
    const customerForm = document.getElementById('customerForm');
    if (customerForm) {
        customerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleCustomerSubmit(this);
        });
    }
});

let dashboardData = {
    vehicles: [],
    bookings: [],
    customers: []
};

// Fetch all data for admin dashboard
async function fetchAdminData() {
    try {
        const response = await fetch('api/admin-fetch-data.php');
        const data = await response.json();

        if (data.success) {
            dashboardData = data;
            updateStats(data.stats);
            renderVehicles(data.vehicles);
            renderBookings(data.bookings);
            renderCustomers(data.customers);
        } else {
            console.error('Failed to fetch data:', data.message);
        }
    } catch (error) {
        console.error('Error fetching admin data:', error);
    }
}

function updateStats(stats) {
    document.getElementById('statTotalVehicles').textContent = stats.totalVehicles;
    document.getElementById('statActiveBookings').textContent = stats.activeBookings;
    document.getElementById('statTotalRevenue').textContent = '$' + stats.totalRevenue.toLocaleString();
    document.getElementById('statAvailableVehicles').textContent = stats.availableVehicles;

    // Update Pie chart values
    if (document.getElementById('pieTotal')) {
        document.getElementById('pieTotal').textContent = stats.totalVehicles;
        const availPerc = stats.totalVehicles > 0 ? Math.round((stats.availableVehicles / stats.totalVehicles) * 100) : 0;
        document.getElementById('percAvailable').textContent = availPerc + '%';
        document.getElementById('percRented').textContent = (100 - availPerc) + '%';
    }
}

// NAVIGATION
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            // Map sidebar click to tabs logic
            let text = this.querySelector('span').textContent.toLowerCase();
            if (text === 'dashboard') text = 'summary';

            const tabBtn = document.querySelector(`.tab-btn[data-tab="${text}"]`);
            if (tabBtn) {
                tabBtn.click();
            }
        });
    });
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const navItems = document.querySelectorAll('.nav-item');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetTab = this.getAttribute('data-tab');

            // Update Tabs UI
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            this.classList.add('active');

            const targetContent = document.getElementById(targetTab + '-tab');
            if (targetContent) targetContent.classList.add('active');

            // Sync Sidebar UI
            navItems.forEach(nav => {
                const navText = nav.querySelector('span').textContent.toLowerCase();
                const mappedNavText = navText === 'dashboard' ? 'summary' : navText;
                if (mappedNavText === targetTab) {
                    navItems.forEach(n => n.classList.remove('active'));
                    nav.classList.add('active');
                }
            });

            // Update Page Title
            const pageTitle = document.querySelector('.page-title');
            if (pageTitle) {
                let title = targetTab.charAt(0).toUpperCase() + targetTab.slice(1);
                if (title === 'Summary') title = 'Dashboard Overview';
                else if (title === 'Vehicles') title = 'Vehicle Management';
                else if (title === 'Bookings') title = 'Booking Management';
                else if (title === 'Customers') title = 'Customer Management';
                pageTitle.textContent = title;
            }
        });
    });
}

// RENDERING
function renderVehicles(vehicles) {
    const tbody = document.getElementById('vehicleTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    vehicles.forEach(v => {
        const tr = document.createElement('tr');
        const vImage = v.Vimage ? v.Vimage : 'images/default-car.jpg';
        tr.innerHTML = `
            <td>${v.VehicleId}</td>
            <td>
                <div class="d-flex align-items-center gap-3">
                    <img src="${vImage}" alt="${v.Model}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <span>${v.Model}</span>
                </div>
            </td>
            <td>${v.Type}</td>
            <td>$${v.Price_per_day}</td>
            <td><span class="badge ${v.Available ? 'bg-success' : 'bg-secondary'}">${v.Available ? 'Available' : 'Unavailable'}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="openVehicleModal('edit', ${v.VehicleId})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteVehicle(${v.VehicleId})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderBookings(bookings) {
    const tbody = document.getElementById('bookingTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    bookings.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${b.Bookid}</td>
            <td>${b.CustomerName}</td>
            <td>${b.VehicleName}</td>
            <td class="small">${b.Start_date} to ${b.End_date}</td>
            <td>$${b.Total_price}</td>
            <td><span class="badge bg-${getStatusColor(b.Status)}">${b.Status}</span></td>
            <td>
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Action</button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onclick="updateBookingStatus(${b.Bookid}, 'Approved')">Approve</a></li>
                        <li><a class="dropdown-item" href="#" onclick="updateBookingStatus(${b.Bookid}, 'Rejected')">Reject</a></li>
                        <li><a class="dropdown-item" href="#" onclick="updateBookingStatus(${b.Bookid}, 'Completed')">Complete</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" onclick="deleteBooking(${b.Bookid})">Delete</a></li>
                    </ul>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderCustomers(customers) {
    const tbody = document.getElementById('customerTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    customers.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.Cusid}</td>
            <td>${c.Name}</td>
            <td>${c.Email}</td>
            <td>${c.Ctel || 'N/A'}</td>
            <td>${c.Created_date}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteCustomer(${c.Cusid})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getStatusColor(status) {
    switch (status) {
        case 'Approved': return 'success';
        case 'Pending': return 'warning';
        case 'Rejected':
        case 'Cancelled': return 'danger';
        case 'Completed': return 'info';
        default: return 'secondary';
    }
}

// VEHICLE ACTIONS
function openVehicleModal(action, id = null) {
    const modal = new bootstrap.Modal(document.getElementById('vehicleModal'));
    const form = document.getElementById('vehicleForm');
    form.reset();

    document.getElementById('v_action').value = action === 'edit' ? 'update' : 'add';
    document.getElementById('vehicleModalTitle').textContent = action === 'add' ? 'Add New Vehicle' : 'Edit Vehicle';
    document.getElementById('availableCheckGroup').style.display = action === 'edit' ? 'block' : 'none';

    if (action === 'edit' && id) {
        const v = dashboardData.vehicles.find(v => v.VehicleId == id);
        if (v) {
            document.getElementById('v_id').value = v.VehicleId;
            document.getElementById('v_model').value = v.Model;
            document.getElementById('v_type').value = v.Type;
            document.getElementById('v_price').value = v.Price_per_day;
            document.getElementById('v_capacity').value = v.Capacity;
            document.getElementById('v_available').checked = v.Available == 1;
        }
    }

    modal.show();
}

async function handleVehicleSubmit(form) {
    const adminSession = JSON.parse(localStorage.getItem('horizone_admin_session') || '{}');
    const formData = new FormData(form);
    formData.append('adminId', adminSession.adminId || 1);

    try {
        const response = await fetch('api/admin-manage-vehicles.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            statusModal.show('success', 'Success', data.message);
            bootstrap.Modal.getInstance(document.getElementById('vehicleModal')).hide();
            fetchAdminData();
        } else {
            statusModal.show('failed', 'Error', data.message);
        }
    } catch (error) {
        statusModal.show('failed', 'Error', 'Something went wrong');
    }
}

async function deleteVehicle(id) {
    statusModal.confirm(
        'Confirm Deletion',
        'Are you sure you want to delete this vehicle? This action cannot be undone.',
        'Yes',
        'No',
        async () => {
            const formData = new FormData();
            formData.append('action', 'delete');
            formData.append('vehicleId', id);

            try {
                const response = await fetch('api/admin-manage-vehicles.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    statusModal.show('success', 'Deleted', data.message);
                    fetchAdminData();
                } else {
                    statusModal.show('failed', 'Error', data.message);
                }
            } catch (e) {
                statusModal.show('failed', 'Error', 'Request failed');
            }
        }
    );
}

// BOOKING ACTIONS
async function updateBookingStatus(id, status) {
    const adminSession = JSON.parse(localStorage.getItem('horizone_admin_session') || '{}');
    const formData = new FormData();
    formData.append('action', 'status');
    formData.append('bookid', id);
    formData.append('status', status);
    formData.append('adminId', adminSession.adminId || 1);

    try {
        const response = await fetch('api/admin-manage-bookings.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            statusModal.show('success', 'Updated', data.message);
            fetchAdminData();
        } else {
            statusModal.show('failed', 'Error', data.message);
        }
    } catch (e) { statusModal.show('failed', 'Error', 'Request failed'); }
}

async function deleteBooking(id) {
    statusModal.confirm(
        'Delete Booking',
        'Are you sure you want to delete this booking record?',
        'Yes',
        'No',
        async () => {
            const formData = new FormData();
            formData.append('action', 'delete');
            formData.append('bookid', id);

            try {
                const response = await fetch('api/admin-manage-bookings.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    statusModal.show('success', 'Deleted', data.message);
                    fetchAdminData();
                } else {
                    statusModal.show('failed', 'Error', data.message);
                }
            } catch (e) {
                statusModal.show('failed', 'Error', 'Request failed');
            }
        }
    );
}

// CUSTOMER ACTIONS
async function deleteCustomer(id) {
    statusModal.confirm(
        'Delete Customer',
        'Are you sure you want to delete this customer? This will fail if they have active bookings.',
        'Yes',
        'No',
        async () => {
            const formData = new FormData();
            formData.append('action', 'delete');
            formData.append('cusid', id);

            try {
                const response = await fetch('api/admin-manage-customers.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    statusModal.show('success', 'Deleted', data.message);
                    fetchAdminData();
                } else {
                    statusModal.show('failed', 'Error', data.message);
                }
            } catch (e) {
                statusModal.show('failed', 'Error', 'Request failed');
            }
        }
    );
}

// PROFILE & OTHERS
function initAdminProfile() {
    const adminSession = localStorage.getItem('horizone_admin_session');
    if (!adminSession) { window.location.href = 'admin-login.html'; return; }
    try {
        const adminData = JSON.parse(adminSession);
        const welcomeText = document.getElementById('adminWelcomeText');
        if (welcomeText) welcomeText.textContent = `Welcome back, ${adminData.name}`;
        const displayName = document.getElementById('adminDisplayName');
        if (displayName) displayName.textContent = adminData.name;
    } catch (e) {
        localStorage.removeItem('horizone_admin_session');
        window.location.href = 'admin-login.html';
    }
}

function initAdminLogout() {
    const logoutBtn = document.getElementById('adminLogoutBtn');
    const profileHeader = document.querySelector('.user-profile-header');

    const handleLogout = () => {
        statusModal.logout(() => {
            localStorage.removeItem('horizone_admin_session');
            window.location.href = 'admin-login.html';
        });
    };

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (profileHeader) {
        profileHeader.style.cursor = 'pointer';
        profileHeader.addEventListener('click', handleLogout);
    }
}

function initNotifications() {
    const notificationIcon = document.querySelector('.notification-icon');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', () => alert('No new notifications'));
    }
}

function openCustomerModal() {
    const modal = new bootstrap.Modal(document.getElementById('customerModal'));
    document.getElementById('customerForm').reset();
    modal.show();
}

async function handleCustomerSubmit(form) {
    const formData = new FormData(form);
    try {
        const response = await fetch('api/admin-manage-customers.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            statusModal.show('success', 'Customer Added', data.message);
            bootstrap.Modal.getInstance(document.getElementById('customerModal')).hide();
            fetchAdminData();
        } else {
            statusModal.show('failed', 'Error', data.message);
        }
    } catch (e) {
        statusModal.show('failed', 'Error', 'Something went wrong');
    }
}
