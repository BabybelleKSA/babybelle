
(() => {
  'use strict';

  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const productDescriptions = {
    footies: 'Baby Belle bamboo footies are made from ultra-soft 99% bamboo and 1% spandex. Breathable, moisture-wicking, and gentle on sensitive skin. Our convertible hand covers and grippy feet keep your little one cozy while growing with them.',
    rompers: 'Our convertible bamboo rompers are lightweight, airy, and ultra-soft. Designed to grow with your little one using fold-over hands and fold-over feet. Durable, breathable, and 3x longer-lasting than traditional cotton.'
  };

  const baseInventory = {
    footies: {
      blush_pink: { '0-3': 4 },
      lavender: { '0-3': 3, '3-6': 1 },
      pastel_pea: { '0-3': 4, '3-6': 1 },
      pure_white: { '0-3': 1, '3-6': 1 }
    },
    rompers: {
      pastel_pea: { '0-3': 3, '3-6': 1 },
      ocean_blue: { '0-3': 4 },
      blush_pink: { '0-3': 3, '3-6': 4 },
      pure_white: { '0-3': 3, '3-6': 3 }
    }
  };

  const productCatalog = {
    footies: {
      blush_pink: { title: 'Blush Pink Footie', image: 'assets/blush_pink_footie.png', price: 23.50, type: 'Footie' },
      lavender: { title: 'Lavender Footie', image: 'assets/lavender_footie.png', price: 23.50, type: 'Footie' },
      pastel_pea: { title: 'Pastel Pea Footie', image: 'assets/pastel_pea_footie.png', price: 23.50, type: 'Footie' },
      pure_white: { title: 'Pure White Footie', image: 'assets/pure_white_footie.png', price: 23.50, type: 'Footie' }
    },
    rompers: {
      blush_pink: { title: 'Blush Pink Romper', image: 'assets/blush_pink_romper.png', price: 23.50, type: 'Romper' },
      ocean_blue: { title: 'Ocean Blue Romper', image: 'assets/ocean_blue_romper.png', price: 23.50, type: 'Romper' },
      pastel_pea: { title: 'Pastel Pea Romper', image: 'assets/pastel_pea_romper.png', price: 23.50, type: 'Romper' },
      pure_white: { title: 'Pure White Romper', image: 'assets/pure_white_romper.png', price: 23.50, type: 'Romper' }
    }
  };

  const formatPrice = (num) => `$${num.toFixed(2)}`;
  const clone = (obj) => JSON.parse(JSON.stringify(obj));

  const storage = window.localStorage;
  const CART_KEY = 'babybelle-cart';
  const THEME_KEY = 'babybelle-theme';
  const EMAIL_KEY = 'babybelle-email';

  const loadCart = () => {
    try { return JSON.parse(storage.getItem(CART_KEY) || '[]'); } catch { return []; }
  };
  let cart = loadCart();

  const saveCart = () => storage.setItem(CART_KEY, JSON.stringify(cart));

  const nav = qs('#topNav');
  const navMenu = qs('#navMenu');
  const navToggle = qs('#navToggle');
  const cartDrawer = qs('#cartDrawer');
  const cartOverlay = qs('#cartOverlay');
  const cartButton = qs('#cartButton');
  const cartFab = qs('#cartFab');
  const cartClose = qs('#cartClose');
  const cartItemsEl = qs('#cartItems');
  const cartTotalEl = qs('#cartTotal');
  const checkoutBtn = qs('#checkoutBtn');
  const darkToggle = qs('#darkToggle');
  const heroParallax = qs('[data-parallax]');
  const heroSection = qs('.hero');
  const snowCanvas = qs('#snowCanvas');

  // Theme
  const setTheme = (mode) => {
    document.body.classList.toggle('theme-dark', mode === 'dark');
    document.body.classList.toggle('theme-light', mode !== 'dark');
    if (darkToggle) darkToggle.setAttribute('aria-pressed', mode === 'dark');
    storage.setItem(THEME_KEY, mode);
  };
  const initialTheme = storage.getItem(THEME_KEY) || 'light';
  setTheme(initialTheme);
  darkToggle?.addEventListener('click', () => {
    const next = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
    setTheme(next);
  });

  // Smooth scroll with offset
  const smoothScroll = (target) => {
    if (!target) return;
    const offset = (nav?.offsetHeight || 72) + 6;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  qsa('[data-scroll]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      const target = href ? document.querySelector(href) : null;
      smoothScroll(target);
      if (navMenu?.classList.contains('open')) navMenu.classList.remove('open');
    });
  });

  // Mobile nav toggle
  navToggle?.addEventListener('click', () => {
    const open = navMenu?.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Scroll effects
  const onScroll = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
    if (heroParallax) {
      const y = Math.min(window.scrollY, 280);
      heroParallax.style.transform = `translateY(${y * -0.12}px)`;
      heroParallax.style.opacity = `${1 - Math.min(y / 480, 0.25)}`;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Snowfall (hero only)
  let snowCtx;
  let snowFlakes = [];
  let snowActive = false;
  let snowRaf = null;
  let snowResizeTimer;

  const createFlake = (w, h) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 1 + Math.random() * 2.2,
    s: 0.4 + Math.random() * 0.7,
    drift: Math.random() * 0.6 - 0.3
  });

  const drawSnow = () => {
    if (!snowActive || !snowCtx || !snowCanvas) return;
    const { width: w, height: h } = snowCanvas;
    snowCtx.clearRect(0, 0, w, h);
    snowFlakes.forEach((f) => {
      f.y += f.s;
      f.x += f.drift;
      if (f.y > h) { f.y = -4; f.x = Math.random() * w; }
      if (f.x > w) f.x = 0;
      if (f.x < 0) f.x = w;
      snowCtx.beginPath();
      snowCtx.fillStyle = 'rgba(255,255,255,0.7)';
      snowCtx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      snowCtx.fill();
    });
    snowRaf = requestAnimationFrame(drawSnow);
  };

  const initSnow = () => {
    if (!snowCanvas || !heroSection) return;
    const disable = window.matchMedia('(max-width: 768px)').matches;
    if (snowRaf) cancelAnimationFrame(snowRaf);
    if (disable) {
      snowActive = false;
      snowCanvas.classList.remove('show');
      snowCanvas.width = 0;
      snowCanvas.height = 0;
      return;
    }
    const rect = heroSection.getBoundingClientRect();
    snowCanvas.width = heroSection.clientWidth;
    snowCanvas.height = rect.height;
    snowCtx = snowCanvas.getContext('2d');
    snowFlakes = Array.from({ length: 70 }, () => createFlake(snowCanvas.width, snowCanvas.height));
    snowActive = true;
    snowCanvas.classList.add('show');
    drawSnow();
  };

  window.addEventListener('resize', () => {
    clearTimeout(snowResizeTimer);
    snowResizeTimer = setTimeout(initSnow, 180);
  });

  // Intersection fade
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const observeFade = (el) => el && fadeObserver.observe(el);
  qsa('.soft-fade').forEach(observeFade);

  // Inventory helpers
  const inventoryAfterCart = () => {
    const snapshot = clone(baseInventory);
    cart.forEach((item) => {
      const sizes = snapshot[item.type]?.[item.slug];
      if (!sizes) return;
      if (sizes[item.size] !== undefined) {
        sizes[item.size] = Math.max(0, sizes[item.size] - item.qty);
      }
    });
    return snapshot;
  };

  let availableInventory = inventoryAfterCart();

  const availableQty = (type, slug, size) => (availableInventory[type]?.[slug]?.[size] ?? 0);
  const baseQty = (type, slug, size) => (baseInventory[type]?.[slug]?.[size] ?? 0);

  // Render products
  const renderCategory = (gridId, typeKey) => {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '';
    const copy = productDescriptions[typeKey];

    Object.entries(productCatalog[typeKey]).forEach(([slug, data]) => {
      const sizes = availableInventory[typeKey]?.[slug] || {};
      const availableSizes = Object.entries(sizes).filter(([, qty]) => qty > 0);
      const total = availableSizes.reduce((sum, [, qty]) => sum + qty, 0);

      const card = document.createElement('article');
      card.className = 'product-card soft-fade';
      card.dataset.slug = slug;
      card.dataset.type = typeKey;
      const optionsString = availableSizes.map(([size]) => size).join('|');
      const firstSize = availableSizes[0]?.[0] || '';
      card.innerHTML = `
        <div class="product-top">
          <div>
            <p class="product-type">${data.type}</p>
            <h3 class="product-name">${data.title}</h3>
            <p class="product-price">${formatPrice(data.price)}</p>
          </div>
          <div class="stock-chip">${total > 0 ? `${total} in stock` : 'Sold out'}</div>
        </div>
        <div class="media-frame">
          <img src="${data.image}" alt="${data.title}" loading="lazy" />
        </div>
        <p class="product-desc">${copy}</p>
        <div class="product-meta">
          <div class="field">
            <label for="${gridId}-${slug}-size">Size</label>
            <select class="select size-select" id="${gridId}-${slug}-size" ${availableSizes.length ? '' : 'disabled'}></select>
          </div>
          <div class="field">
            <label for="${gridId}-${slug}-qty">Qty</label>
            <input class="qty-input" id="${gridId}-${slug}-qty" type="number" min="1" value="${availableSizes.length ? 1 : 0}" ${availableSizes.length ? '' : 'disabled'} />
          </div>
        </div>
        <div class="buy-row">
          <button
            class="btn primary buy snipcart-add-item"
            type="button"
            data-item-id="${typeKey}-${slug}"
            data-item-price="${Number(data.price).toFixed(2)}"
            data-item-url="/"
            data-item-description="${copy}"
            data-item-name="${data.title}"
            data-item-custom1-name="Size"
            data-item-custom1-options="${optionsString}"
            data-item-custom1-value="${firstSize}"
            ${total === 0 ? 'disabled' : ''}
          >${total === 0 ? 'Sold out' : 'Add to Cart'}</button>
        </div>
      `;
      grid.appendChild(card);

      const sizeSelect = card.querySelector('.size-select');
      const qtyInput = card.querySelector('.qty-input');
      const buyBtn = card.querySelector('.buy');

      availableSizes.forEach(([size, qty]) => {
        const opt = document.createElement('option');
        opt.value = size;
        opt.textContent = `${size} (${qty} left)`;
        sizeSelect?.appendChild(opt);
      });

      const syncControls = () => {
        const size = sizeSelect?.value;
        const avail = size ? sizes[size] || 0 : 0;
        if (qtyInput) {
          qtyInput.max = Math.max(avail, 1);
          if (Number(qtyInput.value) < 1) qtyInput.value = 1;
          if (Number(qtyInput.value) > avail) qtyInput.value = avail;
        }
        const disabled = !size || avail <= 0;
        if (buyBtn) {
          buyBtn.disabled = disabled;
          buyBtn.textContent = disabled ? 'Sold out' : 'Add to Cart';
          buyBtn.dataset.itemCustom1Value = size || '';
          buyBtn.dataset.itemQuantity = qtyInput ? String(qtyInput.value) : '1';
        }
        if (qtyInput) qtyInput.disabled = disabled;
      };

      syncControls();
      sizeSelect?.addEventListener('change', syncControls);
      qtyInput?.addEventListener('input', syncControls);

      buyBtn?.addEventListener('click', () => {
        const size = sizeSelect?.value;
        if (!size) return;
        const avail = availableQty(typeKey, slug, size);
        if (avail <= 0) { syncControls(); return; }
        const qty = Math.min(Math.max(parseInt(qtyInput?.value || '1', 10) || 1, 1), avail);
        buyBtn.dataset.itemCustom1Value = size;
        buyBtn.dataset.itemQuantity = String(qty);
        addToCart({ type: typeKey, slug, size, qty });
        buyBtn.textContent = 'Added!';
        setTimeout(() => { buyBtn.textContent = 'Add to Cart'; }, 900);
      });

      observeFade(card);
    });
  };

  const renderProducts = () => {
    availableInventory = inventoryAfterCart();
    renderCategory('footiesGrid', 'footies');
    renderCategory('rompersGrid', 'rompers');
  };

  // Cart rendering
  const cartCountEls = [qs('#navCartCount'), qs('#fabCartCount')].filter(Boolean);

  const cartCount = () => cart.reduce((sum, item) => sum + item.qty, 0);
  const updateCartCount = () => {
    const count = cartCount();
    cartCountEls.forEach((el) => { el.textContent = String(count); });
  };

  const openCart = () => {
    cartDrawer?.classList.add('open');
    cartOverlay?.classList.add('show');
  };
  const closeCart = () => {
    cartDrawer?.classList.remove('open');
    cartOverlay?.classList.remove('show');
  };

  cartButton?.addEventListener('click', openCart);
  cartFab?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  const addToCart = ({ type, slug, size, qty }) => {
    const available = availableQty(type, slug, size);
    if (available <= 0) return;
    const safeQty = Math.min(qty, available);
    const existing = cart.find((c) => c.type === type && c.slug === slug && c.size === size);
    if (existing) {
      existing.qty = Math.min(existing.qty + safeQty, baseQty(type, slug, size));
    } else {
      cart.push({ type, slug, size, qty: safeQty });
    }
    saveCart();
    renderAll();
    openCart();
  };

  const updateCartQty = (index, nextQty) => {
    const item = cart[index];
    if (!item) return;
    const base = baseQty(item.type, item.slug, item.size);
    const otherReserved = cart.reduce((sum, curr, idx) => {
      if (idx === index) return sum;
      if (curr.type === item.type && curr.slug === item.slug && curr.size === item.size) return sum + curr.qty;
      return sum;
    }, 0);
    const maxAllowed = Math.max(base - otherReserved, 0);
    const safe = Math.min(Math.max(nextQty, 1), maxAllowed || item.qty);
    item.qty = safe;
    if (item.qty <= 0) cart.splice(index, 1);
    saveCart();
    renderAll();
  };

  const removeCartItem = (index) => {
    cart.splice(index, 1);
    saveCart();
    renderAll();
  };

  const renderCart = () => {
    if (!cartItemsEl || !cartTotalEl) return;
    cartItemsEl.innerHTML = '';
    if (!cart.length) {
      cartItemsEl.innerHTML = '<p class="product-desc">Your cart is empty. Add a footie or romper to begin.</p>';
      cartTotalEl.textContent = '$0.00';
      updateCartCount();
      return;
    }

    let subtotal = 0;
    cart.forEach((item, index) => {
      const meta = productCatalog[item.type]?.[item.slug];
      if (!meta) return;
      const price = meta.price * item.qty;
      subtotal += price;
      const base = baseQty(item.type, item.slug, item.size);
      const otherReserved = cart.reduce((sum, curr, idx) => {
        if (idx === index) return sum;
        if (curr.type === item.type && curr.slug === item.slug && curr.size === item.size) return sum + curr.qty;
        return sum;
      }, 0);
      const maxAllowed = Math.max(base - otherReserved, 0);

      const row = document.createElement('div');
      row.className = 'cart-item soft-fade';
      row.innerHTML = `
        <img src="${meta.image}" alt="${meta.title}" />
        <div>
          <h4>${meta.title}</h4>
          <div class="muted">Size ${item.size}</div>
          <div class="cart-qty">
            <button type="button" aria-label="Decrease quantity">-</button>
            <span>${item.qty}</span>
            <button type="button" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="cart-actions">
          <div class="product-price">${formatPrice(price)}</div>
          <button class="icon-btn" type="button" aria-label="Remove item">Remove</button>
        </div>
      `;
      const qtyButtons = row.querySelectorAll('.cart-qty button');
      const decBtn = qtyButtons[0];
      const incBtn = qtyButtons[1];
      const removeBtn = row.querySelector('.cart-actions .icon-btn');

      decBtn?.addEventListener('click', () => updateCartQty(index, item.qty - 1));
      incBtn?.addEventListener('click', () => updateCartQty(index, Math.min(item.qty + 1, Math.max(maxAllowed, item.qty))));
      removeBtn?.addEventListener('click', () => removeCartItem(index));

      observeFade(row);
      cartItemsEl.appendChild(row);
    });

    cartTotalEl.textContent = formatPrice(subtotal);
    updateCartCount();
  };

  const renderAll = () => {
    availableInventory = inventoryAfterCart();
    renderProducts();
    renderCart();
  };

  // Email signup
  const emailForm = qs('#emailForm');
  const emailInput = qs('#emailInput');
  const formMessage = qs('#formMessage');
  const emailList = () => {
    try { return JSON.parse(storage.getItem(EMAIL_KEY) || '[]'); } catch { return []; }
  };
  const saveEmail = (email) => {
    const existing = emailList();
    if (!existing.includes(email)) {
      existing.push(email);
      storage.setItem(EMAIL_KEY, JSON.stringify(existing));
    }
  };

  emailForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (emailInput?.value || '').trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      if (formMessage) formMessage.textContent = 'Please enter a valid email.';
      return;
    }
    saveEmail(email);
    if (formMessage) formMessage.textContent = 'Thanks! You are on the list.';
    if (emailInput) emailInput.value = '';
  });

  // Footer year
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Checkout with Snipcart (payment only; drawer UI remains custom)
  checkoutBtn?.addEventListener('click', async () => {
    if (!window.Snipcart || !Snipcart.api) {
      alert("Checkout is loading. Please try again.");
      return;
    }

    // 1. Clear Snipcart cart
    await Snipcart.api.cart.clear();

    // 2. Add each drawer-cart item into Snipcart
    for (const item of cart) {
      const meta = productCatalog[item.type]?.[item.slug];
      if (!meta) continue;

      await Snipcart.api.cart.addItem({
        id: `${item.type}-${item.slug}`,
        name: meta.title,
        price: meta.price,
        quantity: item.qty,
        description: productDescriptions[item.type],
        url: '/',
        customFields: [
          { name: 'Size', value: item.size }
        ]
      });
    }

    // 3. Open Snipcart checkout modal (payment only)
    Snipcart.api.theme.checkout.open();
  });

  // Keyboard close for cart
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });

  window.addEventListener('load', initSnow);

  // Initial render
  renderAll();
})();
