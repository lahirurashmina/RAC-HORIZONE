document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const carId = urlParams.get('id');

  if (!carId) {
    window.location.href = 'catalog.html';
    return;
  }

  // Fetch Car Details from API
  async function fetchCarDetails(id) {
    try {
      const response = await fetch(`api/get-vehicle-details.php?id=${id}`);
      const data = await response.json();
      if (data.success) {
        renderCarDetails(data.car);
      } else {
        // If not found in DB, try static data as fallback (for backward compatibility if needed)
        if (typeof CarData !== 'undefined') {
          const staticCar = CarData.getCarById(id);
          if (staticCar) renderCarDetailsStatic(staticCar);
          else window.location.href = 'catalog.html';
        } else {
          // If no CarData and no API success, redirect
          window.location.href = 'catalog.html';
        }
      }
    } catch (error) {
      console.error('Error fetching car details:', error);
      // Fallback to static data if API call fails
      if (typeof CarData !== 'undefined') {
        const staticCar = CarData.getCarById(id);
        if (staticCar) renderCarDetailsStatic(staticCar);
        else window.location.href = 'catalog.html';
      } else {
        window.location.href = 'catalog.html';
      }
    }
  }

  function renderCarDetails(car) {
    document.title = `${car.Model} - HORIZONE`;

    // Header Info
    const carTitle = document.querySelector(".car-title");
    if (carTitle) carTitle.textContent = car.Model;

    const carSubtitle = document.querySelector(".car-subtitle");
    if (carSubtitle) carSubtitle.textContent = `${car.Type} • ${car.Transmission || 'Automatic'} • ${car.Capacity} Seats`;

    const carPriceValue = document.querySelector(".car-price-section .car-price");
    if (carPriceValue) carPriceValue.textContent = `$${parseInt(car.Price_per_day)}`;

    const carDescription = document.querySelector(".description-text");
    if (carDescription) carDescription.textContent = car.Description;

    const mainImage = document.getElementById("mainImage");
    if (mainImage) {
      mainImage.src = car.Vimage || 'images/default-car.jpg';
      mainImage.alt = car.Model;
    }

    // Update Specs
    const specValues = document.querySelectorAll(".spec-value");
    if (specValues.length >= 4) {
      specValues[0].textContent = `${car.Capacity} Seats`;
      specValues[1].textContent = car.Transmission || 'Automatic';
      specValues[2].textContent = car.Specs?.fuel || 'Petrol';
      specValues[3].textContent = car.Specs?.mileage || '28 MPG';
    }

    // Refresh everything else like the map and booking logic after data is loaded
    initBookingLogic(car);
  }

  // Helper for static data fallback
  function renderCarDetailsStatic(c) {
    renderCarDetails({
      Model: c.name,
      Type: c.type,
      Transmission: c.transmission,
      Capacity: c.seats,
      Price_per_day: c.price,
      Description: c.description,
      Vimage: c.image,
      Specs: c.specs,
      VehicleId: c.id,
      features: c.features // Pass features for static fallback
    });
  }

  fetchCarDetails(carId);

  function initBookingLogic(car) {
    // Update Features
    const featuresList = document.querySelector(".features-list");
    if (featuresList && car.features) {
      featuresList.innerHTML = '';
      car.features.forEach(feature => {
        const item = document.createElement('div');
        item.className = 'feature-item';
        item.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>${feature}</span>
                `;
        featuresList.appendChild(item);
      });
    }

    // Update Thumbnail Gallery (Simplistic approach: main image as first thumb + others)
    const thumbnailGallery = document.querySelector(".thumbnail-gallery");
    if (thumbnailGallery) {
      // We'll keep the existing structure but update images
      // In a real app, CarData would have multiple images
      const thumbnails = thumbnailGallery.querySelectorAll('.thumbnail-item img');
      thumbnails.forEach((t, index) => {
        t.src = car.Vimage || 'images/default-car.jpg';
      });
    }

    // Pricing variables
    const dailyRate = parseFloat(car.Price_per_day);

    // Set daily rate display in pricing summary
    const dailyRatePriceValue = document.querySelector(".pricing-item .pricing-value");
    if (dailyRatePriceValue) {
      dailyRatePriceValue.textContent = `$${dailyRate.toFixed(2)}`;
    }

    // --- Booking Logic ---

    // Set current date as booking date (non-editable)
    const bookingDateInput = document.getElementById("bookingDate");
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (bookingDateInput) {
      bookingDateInput.value = formattedDate;
    }

    // Set minimum date for date inputs
    const todayISO = today.toISOString().split("T")[0];
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const totalPriceInput = document.getElementById("totalPrice");
    const statusSelect = document.getElementById("bookingStatus");

    if (startDateInput) {
      startDateInput.setAttribute("min", todayISO);
    }

    if (endDateInput) {
      endDateInput.setAttribute("min", todayISO);
    }

    // Calculate pricing and rental days
    function calculatePricing() {
      if (!startDateInput || !endDateInput) return;
      const startDate = startDateInput.value;
      const endDate = endDateInput.value;

      if (!startDate || !endDate) {
        updatePricing(0, 0);
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        updatePricing(0, 0);
        return;
      }

      // Calculate days between start and end date
      const diffTime = Math.abs(end - start);
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      // Calculate total: days × daily rate
      const total = dailyRate * days;

      // Update display and auto-populate total price
      updatePricing(days, total);
    }

    function updatePricing(days, total) {
      const rentalDaysEl = document.getElementById("rentalDays");
      const estimatedTotalEl = document.getElementById("estimatedTotal");

      // Update rental days display
      if (rentalDaysEl) {
        rentalDaysEl.textContent = `${days || 0} day${days !== 1 ? 's' : ''}`;
      }

      // Update estimated total display
      if (estimatedTotalEl) {
        estimatedTotalEl.textContent = `$${total.toFixed(2)}`;
        // Add animation effect
        estimatedTotalEl.style.transform = "scale(1.1)";
        setTimeout(() => {
          estimatedTotalEl.style.transform = "scale(1)";
        }, 200);
      }

      // Auto-populate total price input field
      if (totalPriceInput) {
        totalPriceInput.value = total > 0 ? total.toFixed(2) : '';
        if (total > 0) {
          totalPriceInput.style.borderColor = "#4A90E2";
          setTimeout(() => {
            totalPriceInput.style.borderColor = "";
          }, 500);
        }
      }
    }

    // Event listeners for date changes
    if (startDateInput) {
      startDateInput.addEventListener("change", function () {
        if (endDateInput && this.value) {
          const minDate = new Date(this.value);
          minDate.setDate(minDate.getDate() + 1);
          endDateInput.setAttribute(
            "min",
            minDate.toISOString().split("T")[0]
          );
        }
        calculatePricing();
      });
    }

    if (endDateInput) {
      endDateInput.addEventListener("change", function () {
        calculatePricing();
      });
    }

    // Handle form submission
    const bookingForm = document.getElementById("bookingForm");
    if (bookingForm) {
      bookingForm.addEventListener("submit", function (e) {
        e.preventDefault();

        // Check if user is logged in
        if (typeof Auth !== 'undefined' && !Auth.isLoggedIn()) {
          statusModal.show('warning', 'Login Required', "Please login to book a car.", 'Login Now', function () {
            const currentPage = window.location.pathname + window.location.search;
            localStorage.setItem('horizone_redirect_after_login', currentPage);
            window.location.href = 'login.html';
          });
          return;
        }

        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const totalPrice = parseFloat(totalPriceInput.value);
        const status = statusSelect.value;

        // Validation
        if (!startDate || !endDate) {
          statusModal.show('warning', 'Missing Dates', "Please select both start and end dates.");
          return;
        }

        if (!status) {
          statusModal.show('warning', 'Missing Status', "Please select a booking status.");
          return;
        }

        if (!totalPrice || totalPrice <= 0) {
          statusModal.show('warning', 'Invalid Price', "Please enter a valid total price.");
          return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end <= start) {
          statusModal.show('warning', 'Invalid Date Range', "End date must be after start date.");
          return;
        }

        // Calculate days for confirmation message
        const diffTime = Math.abs(end - start);
        const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        // Get customer ID
        let customerId = null;
        if (typeof Auth !== 'undefined') {
          const user = Auth.getCurrentUser();
          if (user) {
            customerId = user.customerId || user.id || user.Cusid;
          }
        }

        if (!customerId) {
          statusModal.show('failed', 'Session Expired', "Session expired. Please login again.", 'Login', function () {
            window.location.href = 'login.html';
          });
          return;
        }

        const bookingData = {
          start_date: startDate,
          end_date: endDate,
          total_price: totalPrice,
          status: status,
          customer_id: customerId,
          vehicle_id: car.VehicleId || car.id || 1
        };

        // Show loading state
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Send booking to API
        fetch('./api/create-booking.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bookingData)
        })
          .then(response => response.json())
          .then(data => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;

            if (data.success) {
              // Also save to localStorage for local display
              let bookings = [];
              const savedBookings = localStorage.getItem('horizone_bookings');
              if (savedBookings) {
                try { bookings = JSON.parse(savedBookings); } catch (e) { }
              }

              const newBooking = {
                id: 'BK-' + data.booking.Bookid,
                bookingId: data.booking.Bookid,
                carName: car.Model,
                carImage: car.Vimage || 'images/default-car.jpg',
                status: data.booking.Status.toLowerCase(), // my-bookings uses lowercase for status matching
                pickupDate: data.booking.Start_date,
                returnDate: data.booking.End_date,
                pickupLocation: 'Main Office', // Default location
                returnLocation: 'Main Office', // Default location
                totalPrice: parseFloat(data.booking.Total_price),
                dailyRate: dailyRate,
                days: daysCount,
                bookingDate: data.booking.Booking_date,
                insurance: 45, // Adding default values for breakdown display
                taxes: 28,
                extras: []
              };

              bookings.unshift(newBooking);
              localStorage.setItem('horizone_bookings', JSON.stringify(bookings));

              statusModal.show('success', 'Booking Successful',
                `Booking Confirmed!\nBooking ID: BK-${data.booking.Bookid}`,
                'View My Bookings',
                function () {
                  window.location.href = 'my-bookings.html';
                }
              );

            } else {
              statusModal.show('failed', 'Booking Failed', data.message || 'Failed to create booking.');
            }
          })
          .catch(error => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            console.error('Booking error:', error);
            statusModal.show('failed', 'Network Error', 'Network error. Please try again.');
          });
      });
    }

    // Initialize pricing calculation
    calculatePricing();
  }
});
