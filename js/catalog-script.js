document.addEventListener("DOMContentLoaded", function () {
  // Set minimum date for date inputs
  const today = new Date().toISOString().split("T")[0];
  const dateInputs = document.querySelectorAll('input[type="date"]');
  dateInputs.forEach((input) => {
    input.setAttribute("min", today);
  });

  // Global vehicles data
  let allVehicles = [];

  // Fetch cars from API
  async function fetchCars() {
    try {
      const response = await fetch('api/get-vehicles.php');
      const data = await response.json();
      if (data.success) {
        allVehicles = data.vehicles;
        renderCars(allVehicles);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  }

  function renderCars(vehicles) {
    const carsGrid = document.getElementById("carsGrid");
    if (!carsGrid) return;

    carsGrid.innerHTML = '';

    if (vehicles.length === 0) {
      carsGrid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No vehicles found matching your criteria.</p></div>';
      updateCount(0);
      return;
    }

    vehicles.forEach(v => {
      const vImage = v.Vimage ? v.Vimage : 'images/default-car.jpg';
      const card = `
        <a href="car-details.html?id=${v.VehicleId}" class="car-card-link">
            <div class="car-card">
                <img src="${vImage}" alt="${v.Model}" class="car-image">
                <div class="car-info">
                    <h3 class="car-name">${v.Model}</h3>
                    <div class="car-rating">
                        <i class="fas fa-star"></i>
                        <span>${v.Rating || '4.8'}</span>
                    </div>
                    <p class="car-details">${v.Type} • ${v.Transmission || 'Automatic'} • ${v.Capacity} Seats</p>
                    <div class="car-features">
                        <span class="feature-icon">
                            <i class="fas fa-users"></i>
                            <span class="feature-text">${v.Capacity}</span>
                        </span>
                        <span class="feature-icon">
                            <i class="fas fa-suitcase"></i>
                        </span>
                        <span class="feature-icon">
                            <i class="fas fa-cog"></i>
                            <span class="feature-text">Auto</span>
                        </span>
                    </div>
                    <div class="car-footer">
                        <span class="car-price">$${parseInt(v.Price_per_day)} <small>/day</small></span>
                        <button class="btn btn-primary btn-book" onclick="event.preventDefault(); window.location.href='car-details.html?id=${v.VehicleId}'">Book Now</button>
                    </div>
                </div>
            </div>
        </a>
      `;
      carsGrid.insertAdjacentHTML('beforeend', card);
    });

    updateCount(vehicles.length);
    initBookButtons();
  }

  function updateCount(count) {
    const countDisplay = document.querySelector(".catalog-count");
    if (countDisplay) {
      countDisplay.textContent = `${count} vehicles found`;
    }
  }

  function initBookButtons() {
    const bookButtons = document.querySelectorAll(".btn-book");
    bookButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        if (typeof Auth !== 'undefined' && !Auth.isLoggedIn()) {
          e.preventDefault();
          e.stopPropagation();
          CustomAlert.warning("Please login to book a car. Redirecting to login page...", function () {
            const currentPage = window.location.pathname + window.location.search;
            localStorage.setItem('horizone_redirect_after_login', currentPage);
            window.location.href = 'login.html';
          });
        }
      });
    });
  }

  fetchCars();

  // Handle search form submission
  const searchForm = document.querySelector(".search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      applyFilters();
    });
  }

  // Handle filter checkboxes
  const filterCheckboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"]');
  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", applyFilters);
  });

  // Clear all filters
  const clearFiltersBtn = document.querySelector(".btn-clear-filters");
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", function () {
      filterCheckboxes.forEach((checkbox) => checkbox.checked = false);
      applyFilters();
    });
  }

  // Sort functionality
  const sortSelect = document.querySelector(".sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", applyFilters);
  }

  // View toggle
  const viewButtons = document.querySelectorAll(".view-btn");
  const carsGrid = document.getElementById("carsGrid");
  viewButtons.forEach((button) => {
    button.addEventListener("click", function () {
      viewButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      const view = this.getAttribute("data-view");
      if (view === "list") carsGrid.classList.add("list-view");
      else carsGrid.classList.remove("list-view");
    });
  });

  function applyFilters() {
    // Get conditions
    const selectedPrices = Array.from(document.querySelectorAll('input[name="price"]:checked')).map(cb => cb.value);
    const selectedTypes = Array.from(document.querySelectorAll('input[name="type"]:checked')).map(cb => cb.value.toLowerCase());
    const selectedSeats = Array.from(document.querySelectorAll('input[name="seats"]:checked')).map(cb => cb.value);

    const pickupLocationInput = document.querySelector('.search-form input[placeholder*="location"]');
    const query = pickupLocationInput ? pickupLocationInput.value.toLowerCase() : "";

    let filtered = allVehicles.filter(v => {
      // Search query
      if (query && !v.Model.toLowerCase().includes(query) && !v.Type.toLowerCase().includes(query)) return false;

      // Price
      if (selectedPrices.length > 0) {
        const price = parseFloat(v.Price_per_day);
        const matchesPrice = selectedPrices.some(range => {
          if (range === "under50") return price < 50;
          if (range === "50-100") return price >= 50 && price <= 100;
          if (range === "100-200") return price > 100 && price <= 200;
          if (range === "over200") return price > 200;
          return false;
        });
        if (!matchesPrice) return false;
      }

      // Type
      if (selectedTypes.length > 0) {
        if (!selectedTypes.includes(v.Type.toLowerCase())) return false;
      }

      // Seats
      if (selectedSeats.length > 0) {
        const matchesSeats = selectedSeats.some(s => {
          if (s === "2") return v.Capacity == 2;
          if (s === "4") return v.Capacity == 4;
          if (s === "5") return v.Capacity >= 5;
          if (s === "7") return v.Capacity >= 7;
          return false;
        });
        if (!matchesSeats) return false;
      }

      return true;
    });

    // Sorting
    const sortValue = document.querySelector(".sort-select")?.value || "";
    if (sortValue.includes("Low to High")) filtered.sort((a, b) => a.Price_per_day - b.Price_per_day);
    else if (sortValue.includes("High to Low")) filtered.sort((a, b) => b.Price_per_day - a.Price_per_day);
    else if (sortValue.includes("Name")) filtered.sort((a, b) => a.Model.localeCompare(b.Model));
    else if (sortValue.includes("Rating")) filtered.sort((a, b) => b.Rating - a.Rating);

    renderCars(filtered);
  }
});

