let cart = JSON.parse(localStorage.getItem("cart")) || [];

const products = [
  { name: "Shipping Box", price: 10, category: "boxes" },
  { name: "Elegant Tape", price: 5, category: "tape" },
  { name: "Eco-Friendly Wrap", price: 8, category: "eco" },
  { name: "Luxury Ribbon", price: 6, category: "tape" },
];

let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let currentCategory = "all";

function saveWishlist() {
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}
function isWishlisted(name) {
  return wishlist.includes(name);
}
function toggleWishlist(name) {
  const idx = wishlist.indexOf(name);
  if (idx >= 0) wishlist.splice(idx, 1); else wishlist.push(name);
  saveWishlist();
  renderProducts();
}

// Render products (shop page)
function renderProducts() {
  const container = document.getElementById("products");
  if (!container) return;
  container.innerHTML = "";
  const search = document.getElementById("search")?.value.toLowerCase() || "";
  const selectCategory = document.getElementById("category")?.value || "all";
  const category = currentCategory || selectCategory;
  products
    .filter(p => (category === "all" || p.category === category))
    .filter(p => p.name.toLowerCase().includes(search))
    .forEach((p, i) => {
      const div = document.createElement("div");
      div.className = "product-card";
      const activeClass = isWishlisted(p.name) ? "active" : "";
      const ariaPressed = isWishlisted(p.name) ? "true" : "false";
      div.innerHTML = `
        <div class="product-image image-${p.category}"></div>
        <h4>${p.name}</h4>
        <div class="card-actions">
          <p class="price">$${p.price}</p>
          <button class="wishlist-btn ${activeClass}" aria-label="Add to wishlist" aria-pressed="${ariaPressed}" onclick="toggleWishlist('${p.name.replace(/'/g, "&#39;")}')">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
        </div>
        <button class="btn add-to-cart" onclick="addToCartByName('${p.name.replace(/'/g, "&#39;")}')">
          <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.44A2 2 0 0 0 10 19h9v-2h-9l1.1-2h7.45a2 2 0 0 0 1.79-1.11l3.58-6.89A1 1 0 0 0 22 4H7zM7 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>
          <span>Add to Cart</span>
        </button>
      `;
      container.appendChild(div);
    });
}

// Add to cart (by original index, kept for backwards compatibility)
function addToCart(i) {
  const product = products[i];
  if (!product) return;
  const existing = cart.find(item => item.name === product.name);
  if (existing) existing.qty += 1; else cart.push({ ...product, qty: 1 });
  saveCart();
  updateCartBadge();
}
// Add to cart by product name (stable with filters/search)
function addToCartByName(name) {
  const product = products.find(p => p.name === name);
  if (!product) return;
  const existing = cart.find(item => item.name === product.name);
  if (existing) existing.qty += 1; else cart.push({ ...product, qty: 1 });
  saveCart();
  updateCartBadge();
}

// Render cart
function renderCart() {
  const container = document.getElementById("cart-items");
  const subEl = document.getElementById("cart-subtotal");
  const shipEl = document.getElementById("cart-shipping");
  const grandEl = document.getElementById("cart-grandtotal");
  if (!container) return;
  container.innerHTML = "";
  if (cart.length === 0) {
    container.innerHTML = "<p class=\"empty-cart\">Your cart is feeling lonely 💔 <a class=\"btn\" href='shop.html'>Shop now</a>.</p>";
    if (subEl) subEl.textContent = "0";
    if (shipEl) shipEl.textContent = "0";
    if (grandEl) grandEl.textContent = "0";
    return;
  }
  let total = 0;
  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <button class="remove-item" aria-label="Remove item" onclick="removeFromCart(${idx})">&times;</button>
      <div class="cart-thumb"><span>Image coming soon</span></div>
      <div class="cart-info">
        <h4 class="cart-name">${item.name}</h4>
        <p class="cart-price">$${item.price}</p>
      </div>
      <div class="cart-qty">
        <input class="qty-input" type="number" min="1" value="${item.qty}" onchange="updateQty(${idx}, this.value)">
      </div>
    `;
    container.appendChild(div);
  });
  const shipping = calcShipping(total);
  if (subEl) subEl.textContent = total.toFixed(2);
  if (shipEl) shipEl.textContent = shipping.toFixed(2);
  if (grandEl) grandEl.textContent = (total + shipping).toFixed(2);
}

// Update quantity
function updateQty(i, qty) {
  cart[i].qty = parseInt(qty);
  if (cart[i].qty <= 0) cart.splice(i, 1);
  saveCart();
  renderCart();
  updateCartBadge();
}

function calcShipping(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal > 50 ? 0 : 5;
}

// Remove item
function removeFromCart(i) {
  cart.splice(i, 1);
  saveCart();
  renderCart();
  updateCartBadge();
}

// Save to localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Cart badge
function updateCartBadge() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  ["cart-badge", "cart-badge-2", "cart-badge-3"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = totalQty;
  });
}

// Checkout
const checkoutForm = document.getElementById("checkout-form");
if (checkoutForm) {
  checkoutForm.addEventListener("submit", e => {
    e.preventDefault();
    const submitBtn = checkoutForm.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Processing..."; }
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = calcShipping(subtotal);
    const total = subtotal + shipping;
    setTimeout(() => {
      alert(`Thank you for your order! Total: $${total.toFixed(2)}`);
      cart = [];
      saveCart();
      renderCart();
      updateCartBadge();
      checkoutForm.reset();
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Place Order"; }
    }, 300);
  });
}

const clearCartBtn = document.getElementById("clear-cart");
if (clearCartBtn) {
  clearCartBtn.addEventListener("click", () => {
    cart = [];
    saveCart();
    renderCart();
    updateCartBadge();
  });
}

function syncFilterPills(cat) {
  const pills = document.querySelectorAll('.filter-pill');
  pills.forEach(p => {
    const isActive = p.getAttribute('data-category') === cat;
    p.classList.toggle('active', isActive);
    p.setAttribute('aria-selected', String(isActive));
  });
}
function initFilterPills() {
  const pills = document.querySelectorAll('.filter-pill');
  if (!pills.length) return;
  pills.forEach(p => p.addEventListener('click', () => {
    currentCategory = p.getAttribute('data-category');
    const select = document.getElementById('category');
    if (select) select.value = currentCategory;
    syncFilterPills(currentCategory);
    renderProducts();
  }));
}

function initHeroSlider() {
  const slider = document.getElementById("hero-slider");
  if (!slider) return;
  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  const dotsWrap = document.getElementById("hero-dots");
  let current = 0;
  let timer = null;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle("active", i === current));
    const dots = Array.from(dotsWrap.querySelectorAll(".hero-dot"));
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  function start() {
    stop();
    timer = setInterval(() => goTo(current + 1), 5000);
  }
  function stop() { if (timer) clearInterval(timer); }

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "hero-dot";
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.addEventListener("click", () => { goTo(i); start(); });
    dotsWrap.appendChild(dot);
  });

  const prev = slider.querySelector(".hero-nav.prev");
  const next = slider.querySelector(".hero-nav.next");
  if (prev) prev.addEventListener("click", () => { goTo(current - 1); start(); });
  if (next) next.addEventListener("click", () => { goTo(current + 1); start(); });

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());

  goTo(0);
  start();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderCart();
  updateCartBadge();
  initHeroSlider();
  const search = document.getElementById("search");
  const category = document.getElementById("category");
  if (search) search.addEventListener("input", renderProducts);
  if (category) category.addEventListener("change", (e) => {
    currentCategory = e.target.value;
    syncFilterPills(currentCategory);
    renderProducts();
  });

  initFilterPills();

  const sticky = document.getElementById("checkout-sticky");
  if (sticky) sticky.addEventListener("click", () => {
    const form = document.getElementById("checkout-form");
    if (form && typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  });
});
