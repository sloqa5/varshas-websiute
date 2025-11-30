// checkout.js: Handles rendering and completion of the checkout process

const CHECKOUT_CART_KEY = "procktailsCart";
const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/test_00000000000000"; // replace with your live checkout link

// Load cart from storage
function loadCheckoutCart() {
  try {
    const raw = localStorage.getItem(CHECKOUT_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Format as currency
function fmtMoney(v) {
  return `$${v.toFixed(2)}`;
}

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const cart = loadCheckoutCart();
  const totalItems = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  badge.textContent = totalItems;
}

// Render order summary
function renderOrderSummary() {
  const cart = loadCheckoutCart();
  const summaryEl = document.getElementById("order-summary");
  const totalEl = document.getElementById("checkout-total");
  if (!summaryEl || !totalEl) return;
  summaryEl.innerHTML = "";
  let total = 0;
  if (cart.length === 0) {
    summaryEl.innerHTML = "<p>Your cart is empty. <a href='index.html#card-store'>Add some items</a> before checking out.</p>";
    totalEl.textContent = "$0.00";
    return;
  }
  const list = document.createElement("div");
  list.className = "checkout-list";
  cart.forEach((item) => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;
    const row = document.createElement("div");
    row.className = "checkout-row";
    row.innerHTML = `
      <div class="checkout-item-name">${item.name} - ${item.qty}</div>
      <div class="checkout-item-total">${fmtMoney(lineTotal)}</div>
    `;
    list.appendChild(row);
  });
  summaryEl.appendChild(list);
  totalEl.textContent = fmtMoney(total);
  updateCartBadge();
}

// Complete order: simple confirmation and clear cart
document.getElementById("confirm-order-btn")?.addEventListener("click", () => {
  const form = document.getElementById("checkout-form");
  if (form && !form.reportValidity()) {
    showFormMessage("Please complete the required fields.", "error");
    return;
  }
  const cart = loadCheckoutCart();
  if (cart.length === 0) {
    showFormMessage("Your cart is empty. Add items before completing your purchase.", "error");
    return;
  }
  if (STRIPE_CHECKOUT_URL && STRIPE_CHECKOUT_URL.includes("http")) {
    window.location.href = STRIPE_CHECKOUT_URL;
  } else {
    showFormMessage("Thank you for your purchase! Your order has been placed.", "success");
    localStorage.removeItem(CHECKOUT_CART_KEY);
    window.location.href = "index.html";
  }
});

document.getElementById("checkout-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("confirm-order-btn")?.click();
});

function showFormMessage(text, status) {
  const el = document.getElementById("form-message");
  if (!el) return;
  el.textContent = text;
  el.classList.remove("error", "success");
  if (status) el.classList.add(status);
}

// Set year in footer
const footerYearEl = document.getElementById("year");
if (footerYearEl) {
  footerYearEl.textContent = new Date().getFullYear();
}

window.addEventListener("storage", () => {
  renderOrderSummary();
  updateCartBadge();
});

// Render summary on load
renderOrderSummary();
updateCartBadge();
