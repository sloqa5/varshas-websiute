(function () {
  const video = document.getElementById("bgVideo");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const yearSpan = document.getElementById("year");
  const scrollContainer =
    document.querySelector(".snap-container") || document.documentElement;
  const cards = Array.from(document.querySelectorAll(".scene-card"));
  const scrollTopBtn = document.getElementById("scroll-top");
  const floatingCheckout = document.getElementById("floating-checkout");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileDrawer = document.querySelector(".mobile-drawer");
  const menuClose = document.querySelector(".menu-close");

  const modal = document.getElementById("quick-view-modal");
  const modalImage = document.getElementById("modal-image");
  const modalTitle = document.getElementById("modal-title");
  const modalNotes = document.getElementById("modal-notes");
  const modalDescription = document.getElementById("modal-description");
  const modalIngredients = document.getElementById("modal-ingredients");
  const modalNutrition = document.getElementById("modal-nutrition");
  const modalBadges = document.getElementById("modal-badges");
  const modalReview = document.getElementById("modal-review");
  const modalAddBtn = document.getElementById("modal-add-btn");
  const modalCloseBtn = modal?.querySelector(".modal-close");
  const modalPrev = modal?.querySelector(".modal-prev");
  const modalNext = modal?.querySelector(".modal-next");
  const modalServesInput = document.getElementById("modal-serves-input");
  const modalTotalEl = document.getElementById("modal-total");

  const TESTIMONIALS = [
    "5/5 - Actually makes cocktails taste way cleaner.",
    "5/5 - Perfect for pre-drinks; protein hit without the syrup.",
    "5/5 - Salty lime in a sachet, finally.",
    "5/5 - Slides into a vodka soda without tasting fake.",
  ];

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  /* Video scrubbing on scroll */
  let videoDuration = 0;
  let ticking = false;

  function getVideoProgressFromCards() {
    if (!cards.length) return 0;
    const center = scrollContainer.scrollTop + scrollContainer.clientHeight / 2;
    let prev = cards[0];
    let next = cards[cards.length - 1];
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (card.offsetTop <= center) {
        prev = card;
      }
      if (card.offsetTop > center) {
        next = card;
        break;
      }
    }
    const prevProg = parseFloat(prev.dataset.videoProgress || "0") || 0;
    const nextProg = parseFloat(next.dataset.videoProgress || String(prevProg)) || prevProg;
    const span = Math.max(next.offsetTop - prev.offsetTop, 1);
    const mix = Math.min(Math.max((center - prev.offsetTop) / span, 0), 1);
    return prevProg + (nextProg - prevProg) * mix;
  }

  function updateVideoAndCards() {
    ticking = false;
    if (videoDuration) {
      const progress = getVideoProgressFromCards();
      const targetTime = Math.min(Math.max(progress, 0), 1) * videoDuration;
      if (Number.isFinite(targetTime)) {
        video.currentTime = targetTime;
      }
    }
    updateCardStates();
    toggleScrollTop(scrollContainer.scrollTop);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateVideoAndCards);
    }
  }

  if (video) {
    video.addEventListener("loadedmetadata", () => {
      videoDuration = video.duration || 0;
      video.controls = false;
      video.loop = false;
      video.pause();
      updateVideoAndCards();
    });
  }

  scrollContainer.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateVideoAndCards);
  prefersReducedMotion.addEventListener("change", () => {
    if (prefersReducedMotion.matches) {
      video?.pause();
    } else {
      updateVideoAndCards();
    }
  });

  /* Card visibility / active state */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const card = entry.target;
        if (entry.isIntersecting) {
          card.classList.add("is-visible");
        } else {
          card.classList.remove("is-visible", "is-active");
        }
      });
    },
    {
      root: scrollContainer,
      threshold: 0.25,
    }
  );

  cards.forEach((card) => observer.observe(card));

  function updateCardStates() {
    const viewportHeight = scrollContainer.clientHeight;
    const containerTop = scrollContainer.getBoundingClientRect().top;

    let closestCard = null;
    let minDist = Infinity;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(center - (containerTop + viewportHeight / 2));

      if (dist < minDist) {
        minDist = dist;
        closestCard = card;
      }
    });

    cards.forEach((c) => c.classList.remove("is-active"));
    if (closestCard) {
      closestCard.classList.add("is-active");
    }
  }

  /* Horizontal product scroller arrows + auto snap */
  document.querySelectorAll(".product-scroll-wrapper").forEach((wrapper) => {
    const scrollArea = wrapper.querySelector(".product-scroll");
    const leftBtn = wrapper.querySelector(".left-arrow");
    const rightBtn = wrapper.querySelector(".right-arrow");
    const track = wrapper.querySelector(".product-track");
    if (!scrollArea || !leftBtn || !rightBtn || !track) return;

    const sampleCard = track.querySelector(".product-card");
    let cardWidth = 300;
    let gap = 16;
    if (sampleCard) {
      const rect = sampleCard.getBoundingClientRect();
      cardWidth = rect.width;
      const style = getComputedStyle(track);
      const colGap = parseFloat(style.gap || style.columnGap || "16");
      gap = isNaN(colGap) ? 16 : colGap;
    }
    const scrollAmount = cardWidth + gap;
    leftBtn.addEventListener("click", () => {
      scrollArea.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });
    rightBtn.addEventListener("click", () => {
      scrollArea.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });

    let snapTimer = null;
    const snapToNearest = () => {
      const cards = Array.from(track.querySelectorAll(".product-card"));
      if (!cards.length) return;
      const center = scrollArea.scrollLeft + scrollArea.clientWidth / 2;
      let bestCard = cards[0];
      let minDiff = Infinity;
      cards.forEach((card) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const diff = Math.abs(cardCenter - center);
        if (diff < minDiff) {
          minDiff = diff;
          bestCard = card;
        }
      });
      if (bestCard) {
        const targetLeft =
          bestCard.offsetLeft -
          (scrollArea.clientWidth - bestCard.offsetWidth) / 2;
        scrollArea.scrollTo({ left: targetLeft, behavior: "smooth" });
      }
    };
    const scheduleSnap = () => {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(snapToNearest, 140);
    };
    scrollArea.addEventListener("scroll", scheduleSnap, { passive: true });
  });

  /* Cart helpers */
  const CART_KEY = "procktailsCart";
  const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/test_00000000000000"; // replace with your live checkout link

  let storageErrorShown = false;

  function showSystemToast(message, type = "info") {
    let toast = document.querySelector(".cart-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "cart-toast";
      document.body.appendChild(toast);
    }
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = message;
    toast.classList.remove("error");
    if (type === "error") toast.classList.add("error");
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 2200);
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      if (!storageErrorShown) {
        showSystemToast("Cart storage unavailable. Using a fresh cart.", "error");
        storageErrorShown = true;
      }
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function getCartCount() {
    return loadCart().reduce((sum, item) => sum + (item.qty || 0), 0);
  }

  function toggleFloatingCheckout(count) {
    if (!floatingCheckout) return;
    if (count > 0) {
      floatingCheckout.classList.add("visible");
    } else {
      floatingCheckout.classList.remove("visible");
    }
  }

  function updateCartBadge() {
    const el = document.getElementById("cart-count");
    if (!el) return;
    const count = getCartCount();
    el.textContent = count;
    toggleFloatingCheckout(count);
  }

  function showCartToast(message) {
    showSystemToast(message);
  }

  function addToCart(product, qty = 1) {
    const cart = loadCart();
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        qty,
      });
    }
    saveCart(cart);
    updateCartBadge();
    showCartToast(`${product.name} added to cart`);
  }

  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const id = btn.dataset.productId;
      const name = btn.dataset.productName;
      const price = parseFloat(btn.dataset.productPrice || "0");
      if (!id || !name) return;
      addToCart({ id, name, price }, 1);
    });
  });

  /* Quick view modal */
  let currentProduct = null;
  let testimonialTimer = null;
  let testimonialIndex = 0;
  let lastFocusedElement = null;
  let productCards = Array.from(document.querySelectorAll(".product-card"));
  let currentProductIndex = -1;

  function pickTestimonial() {
    testimonialIndex = Math.floor(Math.random() * TESTIMONIALS.length);
    return TESTIMONIALS[testimonialIndex];
  }

  function startTestimonialCycle() {
    if (!modalReview) return;
    clearInterval(testimonialTimer);
    modalReview.textContent = pickTestimonial();
    testimonialTimer = setInterval(() => {
      testimonialIndex = (testimonialIndex + 1) % TESTIMONIALS.length;
      modalReview.textContent = TESTIMONIALS[testimonialIndex];
    }, 2600);
  }

  function stopTestimonialCycle() {
    clearInterval(testimonialTimer);
    testimonialTimer = null;
  }

  function buildBadges(badges) {
    if (!modalBadges) return;
    modalBadges.innerHTML = "";
    badges.forEach((badge) => {
      const span = document.createElement("span");
      span.className = "badge";
      span.textContent = badge;
      modalBadges.appendChild(span);
    });
  }

  function buildIngredients(list) {
    if (!modalIngredients) return;
    modalIngredients.innerHTML = "";
    list.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      modalIngredients.appendChild(li);
    });
  }

  function setModalTotal() {
    if (!currentProduct || !modalTotalEl) return;
    const qty = Math.max(1, parseInt(modalServesInput?.value || "1", 10) || 1);
    const total = currentProduct.price * qty;
    modalTotalEl.textContent = `$${total.toFixed(2)}`;
  }

  function openQuickView(card) {
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    currentProductIndex = productCards.indexOf(card);
    const data = card.dataset;
    currentProduct = {
      id: data.productId,
      name: data.productName,
      price: parseFloat(data.productPrice || "0"),
    };
    if (modalImage) {
      modalImage.src = data.productImage || "";
      modalImage.alt = data.productName || "Procktails sachet";
    }
    if (modalTitle) modalTitle.textContent = data.productName || "";
    if (modalNotes) modalNotes.textContent = data.notes || "";
    if (modalDescription) {
      modalDescription.textContent =
        data.description || card.querySelector("p")?.textContent || "";
    }
    const badges = (data.badges || "")
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);
    buildBadges(badges);
    const ingredients = (data.ingredients || "")
      .split(";")
      .map((ing) => ing.trim())
      .filter(Boolean);
    buildIngredients(ingredients);
    if (modalNutrition) modalNutrition.textContent = data.nutrition || "";
    if (modalReview) startTestimonialCycle();
    if (modalServesInput) modalServesInput.value = "1";
    setModalTotal();

    modal.classList.remove("hidden");
    modalCloseBtn?.focus();
    trapModalFocus();
  }

  function closeQuickView() {
    if (modal) {
      modal.classList.add("hidden");
    }
    stopTestimonialCycle();
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
    lastFocusedElement = null;
  }

  function showPrevProduct() {
    if (!productCards.length) return;
    if (currentProductIndex <= 0) {
      currentProductIndex = productCards.length - 1;
    } else {
      currentProductIndex -= 1;
    }
    const target = productCards[currentProductIndex];
    if (target) openQuickView(target);
  }

  function showNextProduct() {
    if (!productCards.length) return;
    if (currentProductIndex >= productCards.length - 1) {
      currentProductIndex = 0;
    } else {
      currentProductIndex += 1;
    }
    const target = productCards[currentProductIndex];
    if (target) openQuickView(target);
  }

  modalPrev?.addEventListener("click", showPrevProduct);
  modalNext?.addEventListener("click", showNextProduct);

  modalAddBtn?.addEventListener("click", () => {
    if (!currentProduct) return;
    const qty = Math.max(1, parseInt(modalServesInput?.value || "1", 10) || 1);
    addToCart(currentProduct, qty);
  });

  modalServesInput?.addEventListener("input", setModalTotal);

  modalCloseBtn?.addEventListener("click", closeQuickView);

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeQuickView();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeQuickView();
    }
    if (!modal?.classList.contains("hidden")) {
      if (e.key === "ArrowLeft") {
        showPrevProduct();
      } else if (e.key === "ArrowRight") {
        showNextProduct();
      }
    }
  });

  function trapModalFocus() {
    if (!modal) return;
    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    modal.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".add-to-cart")) return;
      openQuickView(card);
    });
    const quickBtn = card.querySelector(".quick-view-btn");
    quickBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      openQuickView(card);
    });

    const img = card.querySelector(".product-img");
    if (img) {
      const defaultSrc = img.dataset.defaultSrc || img.src;
      const previewSrc = img.dataset.previewSrc;
      card.addEventListener("mouseenter", () => {
        if (previewSrc) img.src = previewSrc;
      });
      card.addEventListener("mouseleave", () => {
        img.src = defaultSrc;
      });
      card.addEventListener("focusin", () => {
        if (previewSrc) img.src = previewSrc;
      });
      card.addEventListener("focusout", () => {
        img.src = defaultSrc;
      });
    }
  });

  document.querySelectorAll(".strength-bar").forEach((bar) => {
    const fill = bar.querySelector("span");
    const val = parseFloat(bar.dataset.strength || "0");
    if (fill) fill.style.width = `${Math.min(Math.max(val, 0), 100)}%`;
  });

  /* Scroll to top */
  function toggleScrollTop(y) {
    if (!scrollTopBtn) return;
    if (y > 240) {
      scrollTopBtn.classList.add("visible");
    } else {
      scrollTopBtn.classList.remove("visible");
    }
  }

  scrollTopBtn?.addEventListener("click", () => {
    scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Mobile drawer
  function closeDrawer() {
    mobileDrawer?.classList.remove("open");
  }

  menuToggle?.addEventListener("click", () => {
    mobileDrawer?.classList.toggle("open");
  });

  menuClose?.addEventListener("click", closeDrawer);

  mobileDrawer?.querySelectorAll(".drawer-link").forEach((link) => {
    link.addEventListener("click", closeDrawer);
  });

  /* Init */
  window.addEventListener("storage", updateCartBadge);
  updateCartBadge();
  updateVideoAndCards();
})();
