let cart = JSON.parse(localStorage.getItem("cart")) || [];

const products = [
  { name: "Shipping Box", price: 10, category: "boxes" },
  { name: "Elegant Tape", price: 5, category: "tape" },
  { name: "Eco-Friendly Wrap", price: 8, category: "eco" },
  { name: "Luxury Ribbon", price: 6, category: "tape" },
];

// Render products (shop page)
function renderProducts() {
  const container = document.getElementById("products");
  if (!container) return;
  container.innerHTML = "";
  const search = document.getElementById("search")?.value.toLowerCase() || "";
  const category = document.getElementById("category")?.value || "all";
  products
    .filter(p => (category === "all" || p.category === category))
    .filter(p => p.name.toLowerCase().includes(search))
    .forEach((p, i) => {
      const div = document.createElement("div");
      div.className = "product-card";
      div.innerHTML = `
        <img src="" alt="${p.name} image">
        <h4>${p.name}</h4>
        <p class="price">$${p.price}</p>
        <button onclick="addToCart(${i})">Add to Cart</button>
      `;
      container.appendChild(div);
    });
}

// Add to cart
function addToCart(i) {
  const product = products[i];
  const existing = cart.find(item => item.name === product.name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartBadge();
}

// Render cart
function renderCart() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!container) return;
  container.innerHTML = "";
  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty. <a href='shop.html'>Go shopping</a>.</p>";
    if (totalEl) totalEl.textContent = "0";
    return;
  }
  let total = 0;
  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.innerHTML = `
      <span>${item.name} - $${item.price}</span>
      <input type="number" min="1" value="${item.qty}" onchange="updateQty(${idx}, this.value)">
      <button onclick="removeFromCart(${idx})">Remove</button>
    `;
    container.appendChild(div);
  });
  if (totalEl) totalEl.textContent = total;
}

// Update quantity
function updateQty(i, qty) {
  cart[i].qty = parseInt(qty);
  if (cart[i].qty <= 0) cart.splice(i, 1);
  saveCart();
  renderCart();
  updateCartBadge();
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
    alert("Thank you for your order! Total: $" + document.getElementById("cart-total").textContent);
    cart = [];
    saveCart();
    renderCart();
    updateCartBadge();
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
  if (category) category.addEventListener("change", renderProducts);
});
