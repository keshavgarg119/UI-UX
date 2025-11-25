
// Shared Data & Utilities

// Array of package objects (data structure)
const travelPackages = [
  { id: "P1", destination: "Paris, France", durationDays: 7, basePrice: 1200, season: "peak" },
  { id: "P2", destination: "Bali, Indonesia", durationDays: 5, basePrice: 950, season: "regular" },
  { id: "P3", destination: "Dubai, UAE", durationDays: 4, basePrice: 800, season: "off" },
  { id: "P4", destination: "Switzerland", durationDays: 8, basePrice: 1500, season: "peak" }
];

// Seasonal multiplier using switch (operators + control flow)
function getSeasonalMultiplier(season) {
  switch (season) {
    case "peak":
      return 1.3;   // +30% in peak season
    case "off":
      return 0.85;  // -15% in off season
    case "regular":
    default:
      return 1.0;
  }
}

// Compute final package price (base + seasonal + "weekend" style surcharge)
function computeFinalPackagePrice(pkg) {
  let price = pkg.basePrice;

  // Apply seasonal multiplier
  price = price * getSeasonalMultiplier(pkg.season);

  // "Weekend surcharge" style rule:
  // If trip is 6 days or more, add 10% extra
  if (pkg.durationDays >= 6) {
    price = price * 1.10;
  }

  // Round to nearest whole number
  return Math.round(price);
}

// Nav Highlight + Scroll Behavior
function initNavHighlightAndScroll() {
  const navLinks = document.querySelectorAll("nav a");
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Scroll behavior: add shadow after scrolling down
  const header = document.querySelector("header");
  if (!header) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

// Packages Table Rendering
// (loops + functions)
function initPackagesTable() {
  const tableBody = document.querySelector("#packages-body");
  if (!tableBody) return; // Not on packages page

  // Clear any existing rows
  tableBody.innerHTML = "";

  // Loop through array and render rows
  travelPackages.forEach(pkg => {
    const finalPrice = computeFinalPackagePrice(pkg);

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${pkg.id}</td>
      <td>${pkg.destination}</td>
      <td>${pkg.durationDays} Days</td>
      <td>$${pkg.basePrice}</td>
      <td>${pkg.season.toUpperCase()}</td>
      <td>$${finalPrice}</td>
    `;

    tableBody.appendChild(tr);
  });
}

// Booking Price Estimator
// (form + control flow)
function initBookingEstimator() {
  const form = document.querySelector("#booking-form");
  if (!form) return; // Not on booking page

  const nameInput = document.querySelector("#name");
  const checkInInput = document.querySelector("#checkIn");
  const checkOutInput = document.querySelector("#checkOut");
  const guestsInput = document.querySelector("#guests");
  const packageSelect = document.querySelector("#packageSelect");
  const promoInput = document.querySelector("#promoCode");
  const totalSpan = document.querySelector("#totalPrice");
  const submitBtn = form.querySelector('input[type="submit"]');
  const errorBox = document.querySelector("#formErrors");

  // Populate package dropdown from data (loop)
  if (packageSelect && packageSelect.options.length <= 1) {
    travelPackages.forEach(pkg => {
      const option = document.createElement("option");
      option.value = pkg.id;
      option.textContent = `${pkg.destination} (${pkg.durationDays} days)`;
      packageSelect.appendChild(option);
    });
  }

  function validateFormAndCalculate() {
    let isValid = true;
    let messages = [];

    const nameVal = nameInput.value.trim();
    if (!nameVal) {
      isValid = false;
      messages.push("Name is required.");
    }

    const checkInVal = checkInInput.value;
    const checkOutVal = checkOutInput.value;

    let nights = 0;

    if (!checkInVal || !checkOutVal) {
      isValid = false;
      messages.push("Both check-in and check-out dates are required.");
    } else {
      const checkInDate = new Date(checkInVal);
      const checkOutDate = new Date(checkOutVal);
      const diffMs = checkOutDate - checkInDate;
      nights = diffMs / (1000 * 60 * 60 * 24);

      if (isNaN(nights) || nights <= 0) {
        isValid = false;
        messages.push("Check-out date must be after check-in date.");
      }
    }

    const guests = parseInt(guestsInput.value, 10);
    if (isNaN(guests) || guests < 1) {
      isValid = false;
      messages.push("Number of guests must be at least 1.");
    }

    const selectedPackageId = packageSelect.value;
    const selectedPackage = travelPackages.find(p => p.id === selectedPackageId);
    if (!selectedPackage) {
      isValid = false;
      messages.push("Please select a tour package.");
    }

    let totalPrice = 0;

    if (isValid && selectedPackage) {
      // Base per-night rate derived from package
      const perNight = selectedPackage.basePrice / selectedPackage.durationDays;
      totalPrice = perNight * nights;

      // Guests multiplier: +20% if > 2 guests
      let guestsMultiplier = 1;
      if (guests > 2) {
        guestsMultiplier = 1.2;
      }
      totalPrice = totalPrice * guestsMultiplier;

      // Apply seasonal multiplier from package season
      totalPrice = totalPrice * getSeasonalMultiplier(selectedPackage.season);

      // Promo code switch-case
      let promoCode = promoInput.value.trim().toUpperCase();
      let discount = 0;
      switch (promoCode) {
        case "EARLYBIRD":
          discount = 0.10; // 10% off
          break;
        case "FAMILY":
          discount = 0.15; // 15% off for families
          break;
        case "":
          // No promo entered
          break;
        default:
          // Unknown code – small message, no discount
          messages.push("Unknown promo code. No discount applied.");
          break;
      }

      totalPrice = totalPrice * (1 - discount);
    }

    // Update UI
    if (isValid) {
      totalSpan.textContent = `$${totalPrice.toFixed(2)}`;
      errorBox.textContent = "";
    } else {
      totalSpan.textContent = "--";
      errorBox.textContent = messages.join(" ");
    }

    // Disable/enable submit based on validity
    if (submitBtn) {
      submitBtn.disabled = !isValid;
    }
  }

  // Listen to changes for live total
  [nameInput, checkInInput, checkOutInput, guestsInput, packageSelect, promoInput].forEach(el => {
    if (!el) return;
    el.addEventListener("input", validateFormAndCalculate);
    el.addEventListener("change", validateFormAndCalculate);
  });

  // Initial state
  validateFormAndCalculate();

  // Prevent actual submit for demo (optional)
  form.addEventListener("submit", (e) => {
    if (submitBtn && submitBtn.disabled) {
      e.preventDefault();
    } else {
      alert("Booking submitted successfully (demo)!");
      e.preventDefault();
    }
  });
}

// Gallery: data-* attributes + Modal + Layout Toggle
function initGalleryModalAndLayout() {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return; // Not on gallery page

  // Layout toggle buttons
  const gridBtn = document.querySelector("#gridViewBtn");
  const listBtn = document.querySelector("#listViewBtn");

  function setGalleryLayout(layout) {
    if (layout === "list") {
      gallery.classList.add("list-view");
      gallery.dataset.layout = "list";
      if (listBtn) listBtn.classList.add("active");
      if (gridBtn) gridBtn.classList.remove("active");
    } else {
      gallery.classList.remove("list-view");
      gallery.dataset.layout = "grid";
      if (gridBtn) gridBtn.classList.add("active");
      if (listBtn) listBtn.classList.remove("active");
    }
  }

  if (gridBtn) {
    gridBtn.addEventListener("click", () => setGalleryLayout("grid"));
  }
  if (listBtn) {
    listBtn.addEventListener("click", () => setGalleryLayout("list"));
  }

  // Default layout
  setGalleryLayout("grid");

  // Modal elements
  const modal = document.querySelector("#image-modal");
  const modalImg = document.querySelector("#modal-img");
  const modalCaption = document.querySelector("#modal-caption");
  const modalClose = document.querySelector("#modal-close");

  if (!modal || !modalImg || !modalCaption) return;

  // Thumbnails with data-large attribute
  const thumbnails = gallery.querySelectorAll("img[data-large]");

  thumbnails.forEach(img => {
    img.addEventListener("click", () => {
      const largeSrc = img.getAttribute("data-large") || img.getAttribute("src");
      const altText = img.getAttribute("alt") || "";
      const figure = img.closest("figure");
      const titleText = figure && figure.querySelector("figcaption")
        ? figure.querySelector("figcaption").textContent
        : altText;

      // Set attributes dynamically (read/modify attributes)
      modalImg.setAttribute("src", largeSrc);
      modalImg.setAttribute("alt", altText);
      modalImg.setAttribute("title", titleText);
      modalCaption.textContent = titleText;

      modal.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  });

  // Close modal handlers
  function closeModal() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });
}

// Init on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  initNavHighlightAndScroll();
  initPackagesTable();
  initBookingEstimator();
  initGalleryModalAndLayout();
});
