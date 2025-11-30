// cart.js: Handles rendering of the cart page and cart interactions

const CART_KEY = "procktailsCart";
const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/test_00000000000000"; // replace with live link

// Retrieve cart from localStorage
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save cart back to localStorage
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Update the cart badge in the header
function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const cart = loadCart();
  const totalItems = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  badge.textContent = totalItems;
}

// Format a number as currency
function formatMoney(value) {
  return `$${value.toFixed(2)}`;
}

// Render the cart contents
function renderCart() {
  const cart = loadCart();
  const container = document.getElementById("cart-container");
  const totalEl = document.getElementById("cart-total-amount");
  const emptyMsg = document.getElementById("cart-empty");

  if (!container || !totalEl || !emptyMsg) return;

  container.innerHTML = "";

  if (cart.length === 0) {
    // Show empty cart message
    emptyMsg.style.display = "block";
    totalEl.textContent = "$0.00";
    return;
  }

  emptyMsg.style.display = "none";

  let total = 0;

  cart.forEach((item, index) => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div class="cart-item-main">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">Price: ${formatMoney(item.price)}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn minus" data-index="${index}">-</button>
        <span class="cart-qty">${item.qty}</span>
        <button class="qty-btn plus" data-index="${index}">+</button>
      </div>
      <div class="cart-item-line-total">${formatMoney(lineTotal)}</div>
      <button class="cart-remove-btn" data-index="${index}">Remove</button>
    `;
    container.appendChild(row);
  });
  totalEl.textContent = formatMoney(total);
  updateCartBadge();
}

// Adjust quantity of an item
function updateQty(index, delta) {
  const cart = loadCart();
  const item = cart[index];
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart(cart);
  renderCart();
}

// Remove an item entirely
function removeItem(index) {
  const cart = loadCart();
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
  }
}

// Hook up event listeners for quantity controls and remove buttons
document.addEventListener("click", (e) => {
  const minus = e.target.closest(".qty-btn.minus");
  const plus = e.target.closest(".qty-btn.plus");
  const remove = e.target.closest(".cart-remove-btn");
  if (minus) {
    const index = parseInt(minus.dataset.index, 10);
    updateQty(index, -1);
  } else if (plus) {
    const index = parseInt(plus.dataset.index, 10);
    updateQty(index, +1);
  } else if (remove) {
    const index = parseInt(remove.dataset.index, 10);
    removeItem(index);
  }
});

// Checkout button navigates to checkout page
document.getElementById("checkout-btn")?.addEventListener("click", () => {
  const cart = loadCart();
  if (cart.length === 0) {
    alert("Your cart is empty. Add items before proceeding to checkout.");
    return;
  }
  // Navigate to checkout
  window.location.href = "checkout.html";
});

// Stripe checkout link
(function () {
  const stripeLink = document.getElementById("stripe-checkout-link");
  if (stripeLink && typeof STRIPE_CHECKOUT_URL !== "undefined") {
    stripeLink.href = STRIPE_CHECKOUT_URL;
  } else if (stripeLink) {
    stripeLink.style.display = "none";
  }
})();

// Fill current year in footer
const footerYear = document.getElementById("year");
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

window.addEventListener("storage", () => {
  renderCart();
  updateCartBadge();
});

// Render cart on page load
renderCart();
updateCartBadge();
