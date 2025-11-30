const productCatalog = [
  {
    id: 'sunset-saffron',
    name: 'Sunset Saffron Spritz',
    price: 18,
    accent: 'var(--accent-pink)',
    badge: 'Citrus · Glow',
    description:
      'A bright citrus base with saffron warmth and a prismatic shimmer that turns any fizz into a rooftop-ready serve.',
    ingredients: ['Blood orange', 'Saffron extract', 'Sparkle tonic', 'Cane sugar'],
    benefits: ['Low prep ritual', 'Vegan shimmer', 'No artificial syrups'],
    how: ['Pour sachet into a chilled glass', 'Add sparkling water or bubbles', 'Garnish with a twist and watch the glow'],
    nutrition: 'Per sachet: 40 calories · 0g fat · 9g carbs · 0g protein',
    palette: ['#ff9ec9', '#f6d68c'],
  },
  {
    id: 'cocoa-smoke',
    name: 'Cocoa Smoke Old Fashioned',
    price: 20,
    accent: 'var(--gold)',
    badge: 'Rich · Slow Sipper',
    description:
      'Bittersweet cacao, smoked vanilla, and a silky amber pour that drapes over a slow-melt cube.',
    ingredients: ['Cocoa nib', 'Smoked vanilla', 'Orange oil', 'Bitters concentrate'],
    benefits: ['Designed for slow sipping', 'Pairs with or without spirits', 'Bar cart depth without the prep'],
    how: ['Stir sachet with 2oz spirit or water', 'Add clear ice cube', 'Express orange peel'],
    nutrition: 'Per sachet: 60 calories · 1g fat · 11g carbs · 1g protein',
    palette: ['#7b4a2f', '#d6a354'],
  },
  {
    id: 'mint-zen',
    name: 'Mint Zen Highball',
    price: 17,
    accent: 'var(--accent-cyan)',
    badge: 'Fresh · Crisp',
    description:
      'Glacier mint meets cucumber calm with a high-clarity sheen that keeps the highball refreshing and camera-ready.',
    ingredients: ['Garden mint', 'Cucumber water', 'Citrus mist', 'Micro-shimmer'],
    benefits: ['Cooling aromatics', 'Zero artificial colors', 'Pairs with sparkling water'],
    how: ['Pour sachet into tall glass', 'Add crushed ice + soda', 'Top with mint plume'],
    nutrition: 'Per sachet: 30 calories · 0g fat · 7g carbs · 0g protein',
    palette: ['#7ee0ff', '#c8ff67'],
  },
  {
    id: 'ruby-ginger',
    name: 'Ruby Ginger Mule',
    price: 19,
    accent: 'var(--accent-pink)',
    badge: 'Spiced · Effervescent',
    description:
      'Ruby ginger heat layered with hibiscus brightness and a metallic glint that lights up any copper mug.',
    ingredients: ['Young ginger', 'Hibiscus', 'Lime peel', 'Spark shimmer'],
    benefits: ['Fiery but balanced', 'Real botanicals', 'Quick pour mule ritual'],
    how: ['Pour over ice', 'Add soda or ginger beer', 'Lime wheel to finish'],
    nutrition: 'Per sachet: 45 calories · 0g fat · 10g carbs · 0g protein',
    palette: ['#ff7cc8', '#ffb899'],
  },
];

const recipes = [
  {
    icon: '🍊',
    title: 'Citrus loft spritz',
    copy: 'Sunset Saffron + bubbles + orange twist for a rooftop-ready glow.',
  },
  {
    icon: '🥥',
    title: 'Coconut slow roll',
    copy: 'Cocoa Smoke over coconut water for a decadent, zero-proof sipper.',
  },
  {
    icon: '🍃',
    title: 'Spa highball',
    copy: 'Mint Zen over crushed ice, topped with soda and cucumber ribbon.',
  },
  {
    icon: '🌶️',
    title: 'Heat wave mule',
    copy: 'Ruby Ginger with ginger beer and lime, served in copper for instant drama.',
  },
];

const benefits = [
  'Micro-shimmer built for socials',
  'Alt-text ready imagery on every card',
  'Keyboard-friendly modals and controls',
  'Mobile-first layouts that stay premium',
];

const tutorials = [
  {
    id: 'hero-pour',
    title: 'Pour & shimmer walkthrough',
    detail: 'See how the sachet blooms, with timing tips for the perfect swirl.',
  },
  {
    id: 'serve-bar',
    title: 'Host like a pro',
    detail: 'Set the stage with glassware, light, and garnish that photographs well.',
  },
  {
    id: 'zero-proof',
    title: 'Zero-proof pairings',
    detail: 'Build layered, non-alcoholic serves without sacrificing depth.',
  },
];

const toast = document.getElementById('toast');
const cartCountEls = document.querySelectorAll('.cart-count');
let activeProductId = null;

function gradientStyle([start, end]) {
  return `linear-gradient(135deg, ${start}, ${end})`;
}

function buildProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.productId = product.id;

  const media = document.createElement('div');
  media.className = 'card-media';

  const primary = document.createElement('div');
  primary.className = 'layer primary';
  primary.style.background = gradientStyle(product.palette);

  const secondary = document.createElement('div');
  secondary.className = 'layer secondary';
  secondary.style.background = gradientStyle(product.palette.slice().reverse());

  media.append(primary, secondary);

  const content = document.createElement('div');
  content.className = 'card-content';
  const title = document.createElement('h3');
  title.textContent = product.name;
  const price = document.createElement('p');
  price.className = 'card-price';
  price.textContent = `$${product.price}`;
  const badge = document.createElement('p');
  badge.className = 'muted';
  badge.textContent = product.badge;
  content.append(title, price, badge);

  const actions = document.createElement('div');
  actions.className = 'card-actions';
  const addBtn = document.createElement('button');
  addBtn.className = 'btn primary';
  addBtn.textContent = 'Add to Bag';
  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    addToCart(product.id);
  });

  const openLink = document.createElement('a');
  openLink.href = '#';
  openLink.textContent = 'Details';
  openLink.addEventListener('click', (e) => {
    e.preventDefault();
    openProductModal(product.id);
  });

  actions.append(addBtn, openLink);

  card.append(media, content, actions);
  card.addEventListener('click', () => openProductModal(product.id));
  return card;
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = '';
  productCatalog.forEach((product) => grid.appendChild(buildProductCard(product)));
}

function renderRecipes() {
  const recipeGrid = document.getElementById('recipeGrid');
  if (!recipeGrid) return;
  recipeGrid.innerHTML = '';
  recipes.forEach((recipe) => {
    const card = document.createElement('article');
    card.className = 'recipe-card';
    const icon = document.createElement('div');
    icon.className = 'icon';
    icon.textContent = recipe.icon;
    const copy = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = recipe.title;
    const desc = document.createElement('p');
    desc.className = 'section-subtitle';
    desc.textContent = recipe.copy;
    copy.append(title, desc);
    card.append(icon, copy);
    recipeGrid.appendChild(card);
  });
}

function renderBenefits() {
  const strip = document.getElementById('benefitsStrip');
  if (!strip) return;
  strip.innerHTML = '';
  benefits.forEach((benefit) => {
    const pill = document.createElement('div');
    pill.className = 'benefit-pill';
    pill.textContent = benefit;
    strip.appendChild(pill);
  });
}

function renderVideos() {
  const videoGrid = document.getElementById('videoGrid');
  if (!videoGrid) return;
  videoGrid.innerHTML = '';
  tutorials.forEach((video) => {
    const card = document.createElement('article');
    card.className = 'video-card';
    const button = document.createElement('button');
    button.innerHTML = `▶ ${video.title}`;
    button.addEventListener('click', () => openVideo(video));
    const detail = document.createElement('p');
    detail.className = 'section-subtitle';
    detail.textContent = video.detail;
    card.append(button, detail);
    videoGrid.appendChild(card);
  });
}

function getCart() {
  const stored = localStorage.getItem('procktails-cart');
  return stored ? JSON.parse(stored) : [];
}

function saveCart(cart) {
  localStorage.setItem('procktails-cart', JSON.stringify(cart));
}

function addToCart(productId) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }
  saveCart(cart);
  updateCartCount();
  showToast('Added to bag');
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCountEls.forEach((el) => (el.textContent = count));
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1600);
}

function openProductModal(productId) {
  activeProductId = productId;
  const product = productCatalog.find((item) => item.id === productId);
  const modal = document.getElementById('productModal');
  if (!product || !modal) return;

  modal.querySelector('#modalBadge').textContent = product.badge;
  modal.querySelector('#modalTitle').textContent = product.name;
  modal.querySelector('#modalPrice').textContent = `$${product.price}`;
  const media = modal.querySelector('#modalMedia');
  media.style.background = gradientStyle(product.palette);

  modal.querySelector('#tab-description').textContent = product.description;
  modal.querySelector('#tab-ingredients').innerHTML = buildList(product.ingredients);
  modal.querySelector('#tab-benefits').innerHTML = buildList(product.benefits);
  modal.querySelector('#tab-how').innerHTML = buildList(product.how);
  modal.querySelector('#tab-nutrition').textContent = product.nutrition;
  setActiveTab('description');

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function setActiveTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `tab-${tab}`);
  });
}

function buildList(items) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function handleTabs() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
  });
}

function handleModalEvents() {
  document.querySelectorAll('[data-close-modal]').forEach((el) =>
    el.addEventListener('click', closeProductModal)
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeVideo();
    }
  });
}

function openVideo(video) {
  const lightbox = document.getElementById('videoLightbox');
  const frame = document.getElementById('lightboxFrame');
  if (!lightbox || !frame) return;
  frame.innerHTML = `<div class="lightbox-poster"><p>${video.title}</p><span>${video.detail}</span></div>`;
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
}

function closeVideo() {
  const lightbox = document.getElementById('videoLightbox');
  if (lightbox) {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
  }
}

function handleVideoEvents() {
  document.querySelectorAll('[data-close-video]').forEach((el) =>
    el.addEventListener('click', closeVideo)
  );
}

function renderCartPage() {
  const cartContainer = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('cartSubtotal');
  if (!cartContainer || !subtotalEl) return;
  const cart = getCart();
  cartContainer.innerHTML = '';

  if (!cart.length) {
    cartContainer.innerHTML = '<p class="muted">Your bag is empty. Add a sachet to start pouring.</p>';
    subtotalEl.textContent = '$0';
    return;
  }

  let subtotal = 0;
  cart.forEach((item) => {
    const product = productCatalog.find((p) => p.id === item.id);
    if (!product) return;
    const row = document.createElement('div');
    row.className = 'cart-item';

    const thumb = document.createElement('div');
    thumb.className = 'cart-thumb';
    thumb.style.background = gradientStyle(product.palette);

    const info = document.createElement('div');
    info.className = 'cart-info';
    const title = document.createElement('h3');
    title.textContent = product.name;
    const badge = document.createElement('p');
    badge.className = 'muted';
    badge.textContent = product.badge;
    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = `$${product.price * item.qty}`;
    info.append(title, badge, price);

    const controls = document.createElement('div');
    controls.className = 'quantity-controls';
    const minus = document.createElement('button');
    minus.textContent = '−';
    minus.addEventListener('click', () => changeQty(item.id, -1));
    const qty = document.createElement('span');
    qty.textContent = item.qty;
    const plus = document.createElement('button');
    plus.textContent = '+';
    plus.addEventListener('click', () => changeQty(item.id, 1));
    const remove = document.createElement('button');
    remove.className = 'remove-btn';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => removeItem(item.id));
    controls.append(minus, qty, plus, remove);

    row.append(thumb, info, controls);
    cartContainer.appendChild(row);

    subtotal += product.price * item.qty;
  });

  subtotalEl.textContent = `$${subtotal}`;
}

function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  updateCartCount();
  renderCartPage();
}

function removeItem(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
  updateCartCount();
  renderCartPage();
}

function initHeroScroll() {
  const hero = document.querySelector('.hero');
  const media = document.querySelector('.hero-video-fallback');
  if (!hero || !media) return;
  window.addEventListener('scroll', () => {
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(Math.max((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0), 1);
    media.style.transform = `scale(${1 + progress * 0.04}) translateY(${progress * -12}px)`;
    media.style.opacity = 0.7 + progress * 0.2;
  });
}

function init() {
  renderProducts();
  renderRecipes();
  renderBenefits();
  renderVideos();
  renderCartPage();
  updateCartCount();
  handleTabs();
  handleModalEvents();
  handleVideoEvents();
  initHeroScroll();

  const modalAddBtn = document.getElementById('modalAddBtn');
  if (modalAddBtn) {
    modalAddBtn.addEventListener('click', () => {
      if (activeProductId) addToCart(activeProductId);
    });
  }
}

window.addEventListener('DOMContentLoaded', init);
