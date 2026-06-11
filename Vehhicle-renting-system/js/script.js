const API = "";

// ── TOAST ──────────────────────────────────────────────────
function showToast(msg, type = "success") {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.className = `toast toast-${type} show`;
  t.innerHTML = (type === "success" ? "✅ " : "❌ ") + msg;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 3500);
}

// ── SESSION ─────────────────────────────────────────────────
function getUser() {
  try { return JSON.parse(sessionStorage.getItem("vrs_user")); } catch { return null; }
}
function setUser(u) { sessionStorage.setItem("vrs_user", JSON.stringify(u)); }
function logout() { sessionStorage.removeItem("vrs_user"); window.location.href = "login.html"; }

// ── UPDATE NAV ───────────────────────────────────────────────
function updateNav() {
  const user = getUser();
  const navUser = document.getElementById("navUser");
  const navLogout = document.getElementById("navLogout");
  const navLogin = document.getElementById("navLogin");
  const navRegister = document.getElementById("navRegister");

  if (user) {
    if (navUser) { navUser.textContent = "👋 " + user.name; navUser.style.display = "inline-flex"; }
    if (navLogout) navLogout.style.display = "inline-flex";
    if (navLogin) navLogin.style.display = "none";
    if (navRegister) navRegister.style.display = "none";
  } else {
    if (navUser) navUser.style.display = "none";
    if (navLogout) navLogout.style.display = "none";
    if (navLogin) navLogin.style.display = "inline-flex";
    if (navRegister) navRegister.style.display = "inline-flex";
  }
}

// ── VEHICLE EMOJI ─────────────────────────────────────────────
function vehicleEmoji(type) {
  const m = { "Car": "🚗", "SUV": "🚙", "Bike": "🏍️", "Scooter": "🛵", "Truck": "🚚", "Van": "🚐" };
  return m[type] || "🚗";
}

// ── VEHICLE CARD ─────────────────────────────────────────────
function buildVehicleCard(v) {
  const avail = v.availability;
  return `
    <div class="vehicle-card fade-up" onclick="openBooking('${v._id}')">
      <div class="vehicle-img">${vehicleEmoji(v.type)}</div>
      <div class="vehicle-body">
        <div class="vehicle-type">${v.type}</div>
        <div class="vehicle-name">${v.vehicle_name}</div>
        <div class="vehicle-meta">
          <span>📍 ${v.location}</span>
        </div>
        <div class="vehicle-footer">
          <div class="price">₹${v.price_per_day.toLocaleString()}<span>/day</span></div>
          <span class="badge ${avail ? 'badge-available' : 'badge-unavailable'}">${avail ? '● Available' : '● Booked'}</span>
        </div>
      </div>
    </div>`;
}

// ── VEHICLES PAGE ─────────────────────────────────────────────
async function loadVehicles(filterType = "") {
  const grid = document.getElementById("vehicleGrid");
  if (!grid) return;
  grid.innerHTML = '<div class="spinner"></div>';

  const url = filterType ? `${API}/vehicles?type=${filterType}` : `${API}/vehicles`;
  try {
    const res = await fetch(url);
    const vehicles = await res.json();
    if (!vehicles.length) {
      grid.innerHTML = `<div class="empty-state"><div class="icon">🔍</div><h3>No vehicles found</h3><p>Try a different filter</p></div>`;
      return;
    }
    grid.innerHTML = vehicles.map(buildVehicleCard).join("");
    window._vehicles = vehicles;
  } catch {
    grid.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><h3>Connection error</h3><p>Make sure Flask server is running</p></div>`;
  }
}

// ── FILTER BUTTONS ───────────────────────────────────────────
function initFilters() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadVehicles(btn.dataset.type || "");
    });
  });
}

// ── BOOKING MODAL ─────────────────────────────────────────────
function openBooking(vehicleId) {
  const user = getUser();
  if (!user) { showToast("Please login to book a vehicle", "error"); setTimeout(() => window.location.href = "login.html", 1200); return; }

  const v = (window._vehicles || []).find(x => x._id === vehicleId);
  if (!v) return;
  if (!v.availability) { showToast("This vehicle is not available", "error"); return; }

  window._bookingVehicle = v;

  const modal = document.getElementById("bookingModal");
  document.getElementById("modalVehicleName").textContent = v.vehicle_name;
  document.getElementById("modalVehicleInfo").textContent = `${v.type} · ${v.location} · ₹${v.price_per_day}/day`;
  document.getElementById("modalVehicleEmoji").textContent = vehicleEmoji(v.type);

  // Set min dates
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("bookingDate").min = today;
  document.getElementById("returnDate").min = today;
  document.getElementById("bookingDate").value = today;

  updatePriceCalc();
  modal.classList.add("active");
}

function closeModal() {
  document.getElementById("bookingModal").classList.remove("active");
}

function updatePriceCalc() {
  const v = window._bookingVehicle;
  if (!v) return;
  const bd = document.getElementById("bookingDate").value;
  const rd = document.getElementById("returnDate").value;
  const calc = document.getElementById("priceCalc");
  if (!bd || !rd) { calc.style.display = "none"; return; }

  const days = Math.max(Math.ceil((new Date(rd) - new Date(bd)) / 86400000), 1);
  const total = days * v.price_per_day;
  calc.style.display = "block";
  calc.innerHTML = `
    <div>📅 ${days} day${days > 1 ? 's' : ''} × ₹${v.price_per_day}/day</div>
    <div class="total">₹${total.toLocaleString()} total</div>`;
}

async function confirmBooking() {
  const user = getUser();
  const v = window._bookingVehicle;
  const bd = document.getElementById("bookingDate").value;
  const rd = document.getElementById("returnDate").value;

  if (!bd || !rd) { showToast("Select booking and return dates", "error"); return; }
  if (new Date(rd) <= new Date(bd)) { showToast("Return date must be after booking date", "error"); return; }

  const btn = document.getElementById("confirmBtn");
  btn.textContent = "Confirming...";
  btn.disabled = true;

  try {
    const res = await fetch(`${API}/book_vehicle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.user_id, vehicle_id: v._id, booking_date: bd, return_date: rd })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`Booked! Total: ₹${data.total_price.toLocaleString()} for ${data.days} day(s)`);
      closeModal();
      loadVehicles();
    } else {
      showToast(data.error || "Booking failed", "error");
    }
  } catch {
    showToast("Server error", "error");
  }
  btn.textContent = "Confirm Booking";
  btn.disabled = false;
}

// ── AUTH ──────────────────────────────────────────────────────
async function handleRegister(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    license_number: document.getElementById("license").value,
    password: document.getElementById("password").value
  };
  const btn = e.target.querySelector("button[type=submit]");
  btn.textContent = "Registering..."; btn.disabled = true;
  try {
    const res = await fetch(`${API}/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (res.ok) {
      showToast("Registered successfully! Redirecting...");
      setTimeout(() => window.location.href = "login.html", 1500);
    } else {
      showToast(data.error || "Registration failed", "error");
    }
  } catch { showToast("Server error", "error"); }
  btn.textContent = "Create Account"; btn.disabled = false;
}

async function handleLogin(e) {
  e.preventDefault();
  const payload = { email: document.getElementById("email").value, password: document.getElementById("password").value };
  const btn = e.target.querySelector("button[type=submit]");
  btn.textContent = "Signing in..."; btn.disabled = true;
  try {
    const res = await fetch(`${API}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (res.ok) {
      setUser(data);
      showToast(`Welcome back, ${data.name}!`);
      setTimeout(() => window.location.href = "/", 1200);
    } else {
      showToast(data.error || "Login failed", "error");
    }
  } catch { showToast("Server error", "error"); }
  btn.textContent = "Sign In"; btn.disabled = false;
}

// ── MY BOOKINGS ───────────────────────────────────────────────
async function loadMyBookings() {
  const tbody = document.getElementById("bookingsBody");
  if (!tbody) return;
  const user = getUser();
  if (!user) { window.location.href = "login.html"; return; }

  tbody.innerHTML = '<tr><td colspan="6"><div class="spinner"></div></td></tr>';
  try {
    const res = await fetch(`${API}/my_bookings/${user.user_id}`);
    const bookings = await res.json();
    if (!bookings.length) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="icon">📋</div><h3>No bookings yet</h3><p>Go rent a vehicle!</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = bookings.map(b => `
      <tr>
        <td><strong>${b.vehicle_name}</strong></td>
        <td>${b.booking_date}</td>
        <td>${b.return_date}</td>
        <td>₹${(b.total_price || 0).toLocaleString()}</td>
        <td><span class="badge ${b.status === 'Booked' ? 'badge-available' : 'badge-unavailable'}">${b.status}</span></td>
        <td>${b.status === 'Booked' ? `<button class="btn btn-outline" style="padding:0.4rem 0.8rem;font-size:0.8rem" onclick="returnVehicle('${b._id}')">Return</button>` : '—'}</td>
      </tr>`).join("");
  } catch {
    tbody.innerHTML = '<tr><td colspan="6">Error loading bookings</td></tr>';
  }
}

async function returnVehicle(bookingId) {
  if (!confirm("Confirm vehicle return?")) return;
  try {
    const res = await fetch(`${API}/return_vehicle`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ booking_id: bookingId }) });
    const data = await res.json();
    if (res.ok) { showToast("Vehicle returned!"); loadMyBookings(); }
    else showToast(data.error, "error");
  } catch { showToast("Error", "error"); }
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  updateNav();

  const page = document.body.dataset.page;

  if (page === "vehicles") {
    loadVehicles();
    initFilters();
    document.getElementById("bookingDate")?.addEventListener("change", updatePriceCalc);
    document.getElementById("returnDate")?.addEventListener("change", updatePriceCalc);
    document.getElementById("bookingModal")?.addEventListener("click", (e) => {
      if (e.target === document.getElementById("bookingModal")) closeModal();
    });
  }
  if (page === "register") {
    document.getElementById("registerForm")?.addEventListener("submit", handleRegister);
  }
  if (page === "login") {
    document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
  }
  if (page === "booking") {
    loadMyBookings();
  }
});
