
(() => {
  'use strict';

  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const SALE_MULTIPLIER = 0.85;
  const SALE_LABEL = '15% Off Limited Launch Sale';

  const productDescriptions = {
    footies: {
      plain: 'BabyBelle Premium Bamboo Onesie / Footie. Ultra-soft 99% bamboo fabric designed for breathable, temperature-regulating comfort. Perfect for sensitive skin and everyday wear. Built-in stretch grows with your little one, keeping them comfy longer than traditional cotton. Features: Cloud-soft bamboo; Temp-regulating + breathable; Stretch that extends wear-time; Hypoallergenic + eco-friendly; Durable, fade-resistant colors; Reinforced snaps. Why Parents Love It: Lasts twice as long. Feels incredible. Looks premium, wash after wash.',
      html: `
        <p class="desc-lede">BabyBelle Premium Bamboo Onesie / Footie</p>
        <p>Ultra-soft 99% bamboo fabric designed for breathable, temperature-regulating comfort. Perfect for sensitive skin and everyday wear. Built-in stretch grows with your little one, keeping them comfy longer than traditional cotton.</p>
        <p class="desc-subhead">Features:</p>
        <ul class="desc-list">
          <li>Cloud-soft bamboo</li>
          <li>Temp-regulating + breathable</li>
          <li>Stretch that extends wear-time</li>
          <li>Hypoallergenic + eco-friendly</li>
          <li>Durable, fade-resistant colors</li>
          <li>Reinforced snaps</li>
        </ul>
        <p class="desc-subhead">Why Parents Love It:</p>
        <ul class="desc-list">
          <li>Lasts twice as long.</li>
          <li>Feels incredible.</li>
          <li>Looks premium, wash after wash.</li>
        </ul>
      `
    },
    rompers: {
      plain: 'BabyBelle Premium Bamboo Romper (Convertible). Lightweight, breathable, and unbelievably soft. Designed to move with your baby's body while keeping them cool and cozy. Perfect for daytime play and nighttime comfort. Features: 99% premium bamboo; Moisture-wicking; Long-lasting stretch; Hypoallergenic; Fade-resistant, luxury colors; Easy-change snaps. Why Parents Love It: Perfect for warm sleepers. Ultra-soft on sensitive skin. Premium look + feel without the premium price tag.',
      html: `
        <p class="desc-lede">BabyBelle Premium Bamboo Romper (Convertible)</p>
        <p>Lightweight, breathable, and unbelievably soft. Designed to move with your baby's body while keeping them cool and cozy. Perfect for daytime play and nighttime comfort.</p>
        <p class="desc-subhead">Features:</p>
        <ul class="desc-list">
          <li>99% premium bamboo</li>
          <li>Moisture-wicking</li>
          <li>Long-lasting stretch</li>
          <li>Hypoallergenic</li>
          <li>Fade-resistant, luxury colors</li>
          <li>Easy-change snaps</li>
        </ul>
        <p class="desc-subhead">Why Parents Love It:</p>
        <ul class="desc-list">
          <li>Perfect for warm sleepers.</li>
          <li>Ultra-soft on sensitive skin.</li>
          <li>Premium look + feel without the premium price tag.</li>
        </ul>
      `
    }
  };

  const snugNote = `
    <div class="snug-note">
      <strong>Meant to be worn snug.</strong>
      <p>Baby Belle onesies are intentionally snug-fit to mimic the safe, secure feeling of being swaddled in softness. They stretch naturally and move with your baby.</p>
    </div>
  `;

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
      blush_pink: { title: 'Blush Pink Footie', image: 'assets/blush_pink_footie.png', price: 33.00, type: 'Footie' },
      lavender: { title: 'Lavender Footie', image: 'assets/lavender_footie.png', price: 33.00, type: 'Footie' },
      pastel_pea: { title: 'Pastel Pea Footie', image: 'assets/pastel_pea_footie.png', price: 33.00, type: 'Footie' },
      pure_white: { title: 'Pure White Footie', image: 'assets/pure_white_footie.png', price: 33.00, type: 'Footie' }
    },
    rompers: {
      blush_pink: { title: 'Blush Pink Romper', image: 'assets/blush_pink_romper.png', price: 29.00, type: 'Romper' },
      ocean_blue: { title: 'Ocean Blue Romper', image: 'assets/ocean_blue_romper.png', price: 29.00, type: 'Romper' },
      pastel_pea: { title: 'Pastel Pea Romper', image: 'assets/pastel_pea_romper.png', price: 29.00, type: 'Romper' },
      pure_white: { title: 'Pure White Romper', image: 'assets/pure_white_romper.png', price: 29.00, type: 'Romper' }
    }
  };

  const formatPrice = (num) => `$${num.toFixed(2)}`;
  const applySalePrice = (price) => Math.round(Number(price || 0) * SALE_MULTIPLIER * 100) / 100;
  const clone = (obj) => JSON.parse(JSON.stringify(obj));

  const storage = window.localStorage;
  const CART_KEY = 'babybelle-cart';
  const THEME_KEY = 'babybelle-theme';
  const EMAIL_KEY = 'babybelle-email';

  const loadCart = () => {
    try { return JSON.parse(storage.getItem(CART_KEY) || '[]'); } catch { return []; }
  };
  let cart = loadCart();

  const persistCart = () => {
    storage.setItem(CART_KEY, JSON.stringify(cart));
    window.cartItems = cart.map((item) => ({ ...item }));
  };

  persistCart();

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
  const cartOriginalEl = qs('#cartOriginal');
  const checkoutBtn = qs('#checkoutBtn');
  const darkToggle = qs('#darkToggle');
  const heroParallax = qs('[data-parallax]');
  const heroSection = qs('.hero');
  const snowCanvas = qs('#snowCanvas');
  const reviewTrack = qs('#reviewTrack');
  const reviewNavPrev = qs('.review-nav.prev');
  const reviewNavNext = qs('.review-nav.next');

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

  // Review carousel
  let reviewTimer;
  const reviewGap = () => {
    if (!reviewTrack) return 0;
    const style = getComputedStyle(reviewTrack);
    const gap = Number.parseFloat(style.gap || style.columnGap || '0');
    return Number.isNaN(gap) ? 0 : gap;
  };

  const scrollReviews = (dir = 1) => {
    if (!reviewTrack) return;
    const firstCard = reviewTrack.querySelector('.review-card');
    const width = firstCard ? firstCard.getBoundingClientRect().width : reviewTrack.clientWidth;
    reviewTrack.scrollBy({ left: (width + reviewGap()) * dir, behavior: 'smooth' });
  };

  const updateReviewNavState = () => {
    if (!reviewTrack) return;
    const max = reviewTrack.scrollWidth - reviewTrack.clientWidth;
    const left = reviewTrack.scrollLeft;
    const atStart = left <= 6;
    const atEnd = left >= max - 6;
    reviewNavPrev?.classList.toggle('disabled', atStart);
    reviewNavNext?.classList.toggle('disabled', atEnd);
  };

  const startReviewAuto = () => {
    if (!reviewTrack) return;
    clearInterval(reviewTimer);
    reviewTimer = setInterval(() => scrollReviews(1), 5200);
  };

  const stopReviewAuto = () => clearInterval(reviewTimer);

  reviewNavPrev?.addEventListener('click', () => { stopReviewAuto(); scrollReviews(-1); });
  reviewNavNext?.addEventListener('click', () => { stopReviewAuto(); scrollReviews(1); });
  reviewTrack?.addEventListener('scroll', updateReviewNavState, { passive: true });
  reviewTrack?.addEventListener('pointerdown', stopReviewAuto);
  reviewTrack?.addEventListener('focusin', stopReviewAuto);
  reviewTrack?.addEventListener('mouseenter', stopReviewAuto);
  reviewTrack?.addEventListener('mouseleave', startReviewAuto);
  reviewTrack?.addEventListener('wheel', stopReviewAuto, { passive: true });
  if (reviewTrack) {
    updateReviewNavState();
    startReviewAuto();
  }

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
      const basePrice = Number(data.price) || 0;
      const salePriceValue = applySalePrice(basePrice);

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
            <div class="price-wrap">
              <div class="price-stack">
                <span class="sale-price">${formatPrice(salePriceValue)}</span>
                <span class="price-original">${formatPrice(basePrice)}</span>
              </div>
              <span class="sale-chip">${SALE_LABEL}</span>
            </div>
          </div>
          <div class="stock-chip">${total > 0 ? `${total} in stock` : 'Sold out'}</div>
        </div>
        <div class="media-frame">
          <img src="${data.image}" alt="${data.title}" loading="lazy" />
        </div>
        <div class="product-desc">${copy?.html || ''}</div>
        ${snugNote}
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
            data-item-price="${salePriceValue.toFixed(2)}"
            data-item-url="/"
            data-item-description="${copy?.plain || ''}"
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

  const updateCheckoutButtonState = () => {
    if (!checkoutBtn) return;
    checkoutBtn.disabled = cart.length === 0;
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
    persistCart();
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
    persistCart();
    renderAll();
  };

  const removeCartItem = (index) => {
    cart.splice(index, 1);
    persistCart();
    renderAll();
  };

  const renderCart = () => {
    if (!cartItemsEl || !cartTotalEl) return;
    cartItemsEl.innerHTML = '';
    if (!cart.length) {
      cartItemsEl.innerHTML = '<p class="product-desc">Your bag is empty. Add a premium bamboo footie or romper to begin.</p>';
      cartTotalEl.textContent = '$0.00';
      if (cartOriginalEl) cartOriginalEl.textContent = '$0.00';
      updateCartCount();
      updateCheckoutButtonState();
      return;
    }

    let baseSubtotal = 0;
    let saleSubtotal = 0;
    cart.forEach((item, index) => {
      const meta = productCatalog[item.type]?.[item.slug];
      if (!meta) return;
      const basePrice = Number(meta.price) || 0;
      const salePriceValue = applySalePrice(basePrice);
      const lineBase = basePrice * item.qty;
      const lineSale = salePriceValue * item.qty;
      baseSubtotal += lineBase;
      saleSubtotal += lineSale;
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
          <div class="cart-pricing">
            <span class="sale-price">${formatPrice(lineSale)}</span>
            <span class="price-original">${formatPrice(lineBase)}</span>
            <span class="sale-chip inline-sale">${SALE_LABEL}</span>
          </div>
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

    cartTotalEl.textContent = formatPrice(saleSubtotal);
    if (cartOriginalEl) cartOriginalEl.textContent = formatPrice(baseSubtotal);
    updateCartCount();
    updateCheckoutButtonState();
  };

  const renderAll = () => {
    availableInventory = inventoryAfterCart();
    renderProducts();
    renderCart();
  };

  // Stripe checkout integration
  const checkoutCartSnapshot = () => {
    if (Array.isArray(window.cartItems) && window.cartItems.length) return window.cartItems;
    const stored = loadCart();
    if (Array.isArray(stored) && stored.length) return stored;
    return cart;
  };

  const sanitizedCartForCheckout = () => checkoutCartSnapshot()
    .map((item) => {
      const meta = productCatalog[item?.type]?.[item?.slug];
      const quantity = Number(item?.qty) || Number(item?.quantity) || 0;
      const basePrice = Number(meta?.price) || 0;
      const salePriceValue = applySalePrice(basePrice);
      return {
        type: item?.type,
        slug: item?.slug,
        size: item?.size,
        qty: quantity,
        quantity,
        price: salePriceValue,
        basePrice
      };
    })
    .filter((item) => item.type && item.slug && item.size && item.qty > 0 && item.price > 0);

  const startStripeCheckout = async () => {
    if (!checkoutBtn) return;
    const cart = sanitizedCartForCheckout();
    if (!cart.length) {
      updateCheckoutButtonState();
      return;
    }

    const previousText = checkoutBtn.textContent;
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Redirecting...';

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, saleMultiplier: SALE_MULTIPLIER })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.url) {
        throw new Error(data?.error || 'Checkout could not start.');
      }
      window.location = data.url;
    } catch (err) {
      console.error('Checkout failed', err);
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = previousText || 'Checkout';
      alert('Sorry, we could not start checkout. Please try again.');
    }
  };

  checkoutBtn?.addEventListener('click', startStripeCheckout);

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

  // Keyboard close for cart
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });

  window.addEventListener('load', initSnow);

  // Initial render
  renderAll();
})();
