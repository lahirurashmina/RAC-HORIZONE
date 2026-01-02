document.addEventListener("DOMContentLoaded", function () {
  // Set minimum date for date inputs
  const today = new Date().toISOString().split("T")[0];
  const pickupDateInputs = document.querySelectorAll('input[type="date"]');
  pickupDateInputs.forEach((input) => {
    input.setAttribute("min", today);
  });

  // Handle search form submission
  const searchForm = document.querySelector(".search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const pickupDate = this.querySelector('input[type="date"]').value;
      const returnDate = this.querySelectorAll('input[type="date"]')[1]?.value;

      if (!pickupDate || !returnDate) {
        CustomAlert.warning("Please select both pickup and return dates.");
        return;
      }

      if (new Date(returnDate) <= new Date(pickupDate)) {
        CustomAlert.warning("Return date must be after pickup date.");
        return;
      }

      // In a real application, this would filter/search cars
      CustomAlert.info("Searching for available cars...", function () {
        window.location.href = "#catalog";
      });
    });
  }

  // Handle Book Now buttons
  const bookButtons = document.querySelectorAll(".btn-book");
  bookButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Check if user is logged in
      if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) {
        CustomAlert.warning("Please login to book a car. Redirecting to login page...", function () {
          // Store current page to redirect back after login
          const currentPage = window.location.pathname + window.location.search;
          localStorage.setItem('horizone_redirect_after_login', currentPage);
          window.location.href = 'login.html';
        });
        return;
      }

      const carCard = this.closest(".car-card");
      const carModel = carCard.querySelector(".car-model").textContent;
      const carPrice = carCard.querySelector(".car-price").textContent;

      // In a real application, this would redirect to booking page
      CustomAlert.success(`Booking ${carModel} at ${carPrice}`);
    });
  });

  // Handle View Details buttons
  const viewDetailsButtons = document.querySelectorAll(".btn-view-details");
  viewDetailsButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const bookingCard = this.closest(".booking-card");
      const bookingId = bookingCard.querySelector(".booking-id").textContent;

      // In a real application, this would show booking details
      CustomAlert.info(`Viewing details for ${bookingId}`);
    });
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href !== "#" && href !== "#all-cars") {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });

  // Mobile Menu Toggle
  const menuToggler = document.getElementById("menuToggler");
  const navMenu = document.getElementById("navMenu");

  if (menuToggler && navMenu) {
    menuToggler.addEventListener("click", () => {
      navMenu.classList.toggle("active");

      // Toggle icon
      const icon = menuToggler.querySelector("i");
      if (navMenu.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
      } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !navMenu.contains(e.target) &&
        !menuToggler.contains(e.target) &&
        navMenu.classList.contains("active")
      ) {
        navMenu.classList.remove("active");
        const icon = menuToggler.querySelector("i");
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    });

    // Close menu when clicking links
    navMenu.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        const icon = menuToggler.querySelector("i");
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      });
    });
  }

  // Fetch Featured Cars
  async function fetchFeaturedCars() {
    const featuredGrid = document.getElementById('featuredCarsGrid');
    if (!featuredGrid) return;

    try {
      const response = await fetch('api/get-vehicles.php');
      const data = await response.json();
      if (data.success) {
        // Show first 6 available vehicles as featured
        const featured = data.vehicles.slice(0, 6);
        renderFeatured(featured);
      }
    } catch (error) {
      console.error('Error fetching featured cars:', error);
    }
  }

  function renderFeatured(vehicles) {
    const featuredGrid = document.getElementById('featuredCarsGrid');
    if (!featuredGrid) return;

    featuredGrid.innerHTML = '';

    vehicles.forEach(v => {
      const vImage = v.Vimage ? v.Vimage : 'images/default-car.jpg';
      const card = `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="car-card h-100 shadow-sm border-0">
                <div class="car-image-wrapper">
                    <img src="${vImage}" alt="${v.Model}" class="car-image">
                    <span class="car-tag tag-${v.Type.toLowerCase().includes('luxury') ? 'premium' : (v.Type.toLowerCase().includes('electric') ? 'electric' : 'premium')}">${v.Type}</span>
                </div>
                <div class="p-4">
                    <div class="car-rating text-warning mb-2">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                    <h3 class="car-model h5 mb-1">${v.Model}</h3>
                    <p class="car-type text-muted small mb-3">${v.Type}</p>
                    <div class="car-features d-flex justify-content-between mb-4 text-muted small">
                        <span><i class="fas fa-users me-1"></i> ${v.Capacity} Seats</span>
                        <span><i class="fas fa-cog me-1"></i> Auto</span>
                        <span><i class="fas fa-suitcase me-1"></i> 2 Bags</span>
                    </div>
                    <div class="car-footer d-flex justify-content-between align-items-center pt-3 border-top">
                        <span class="car-price fw-bold text-primary">$${parseInt(v.Price_per_day)} <small class="text-muted fw-normal">/day</small></span>
                        <button class="btn btn-primary btn-sm rounded-pill px-3" onclick="window.location.href='car-details.html?id=${v.VehicleId}'">Book Now</button>
                    </div>
                </div>
            </div>
        </div>
      `;
      featuredGrid.insertAdjacentHTML('beforeend', card);
    });
  }

  fetchFeaturedCars();
});
