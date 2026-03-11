/* ===========================
   BOUTIQUE E-COMMERCE – JAVASCRIPT
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==================== PRODUCT DATA ====================
    const products = [
        {
            id: 1,
            name: 'Terracotta Serving Bowl',
            price: 68,
            tag: 'Best Seller',
            image: 'images/product-bowl.png',
            category: 'Bowls',
            desc: 'A generously sized serving bowl hand-thrown from red stoneware clay, finished in our signature terracotta glaze. Perfect for salads, pasta, or as a stunning centerpiece.',
            colors: ['#c4704b', '#8a9a7b', '#2c2c2c']
        },
        {
            id: 2,
            name: 'Sage Bud Vase',
            price: 45,
            tag: '',
            image: 'images/product-vase.png',
            category: 'Vases',
            desc: 'An organic, asymmetric bud vase in our calming sage glaze. Each one is uniquely shaped on the wheel — no two are alike. Ideal for wildflowers or a single stem.',
            colors: ['#8a9a7b', '#d4a19a', '#f3ede4']
        },
        {
            id: 3,
            name: 'Speckled Dinner Plate',
            price: 42,
            originalPrice: 52,
            tag: 'Sale',
            image: 'images/product-plate.png',
            category: 'Plates',
            desc: 'Our classic dinner plate in a creamy white glaze with characteristic speckles from the iron-rich clay. Microwave and dishwasher safe. Set of 1.',
            colors: ['#f3ede4', '#c4704b', '#3a3632']
        },
        {
            id: 4,
            name: 'Charcoal Everyday Mug',
            price: 36,
            tag: 'New',
            image: 'images/product-mug.png',
            category: 'Mugs',
            desc: 'A chunky, satisfyingly weighty mug in matte charcoal. The wide handle fits two fingers comfortably. Holds 12oz of your favorite brew.',
            colors: ['#3a3632', '#c4704b', '#8a9a7b']
        },
        {
            id: 5,
            name: 'Blush Planter',
            price: 54,
            tag: '',
            image: 'images/product-planter.png',
            category: 'Planters',
            desc: 'A soft blush-pink planter with a built-in drainage hole and matching saucer. Perfectly sized for small succulents, herbs, or trailing plants.',
            colors: ['#d4a19a', '#f3ede4', '#8a9a7b']
        },
        {
            id: 6,
            name: 'Sand Pitcher',
            price: 78,
            tag: 'Limited',
            image: 'images/product-pitcher.png',
            category: 'Serveware',
            desc: 'An elegant pitcher in sandy beige, designed for water, juice, or as a flower arrangement vessel. The pulled handle and pouring spout are shaped by hand.',
            colors: ['#d5cdc2', '#c4704b', '#3a3632']
        }
    ];

    // ==================== CART STATE ====================
    let cart = [];

    function updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        const count = cart.reduce((sum, item) => sum + item.qty, 0);
        badge.textContent = count;
        badge.classList.add('bump');
        setTimeout(() => badge.classList.remove('bump'), 300);
    }

    function addToCart(productId, qty = 1) {
        const product = products.find(p => p.id === productId);
        const existing = cart.find(c => c.id === productId);
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({ ...product, qty });
        }
        updateCartBadge();
        renderCart();
        openCart();
    }

    function removeFromCart(productId) {
        cart = cart.filter(c => c.id !== productId);
        updateCartBadge();
        renderCart();
    }

    function updateCartQty(productId, delta) {
        const item = cart.find(c => c.id === productId);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) {
            removeFromCart(productId);
            return;
        }
        updateCartBadge();
        renderCart();
    }

    function renderCart() {
        const container = document.getElementById('cartItems');
        const footer = document.getElementById('cartFooter');
        const emptyEl = document.getElementById('cartEmpty');
        const subtotalEl = document.getElementById('cartSubtotal');

        // Remove old items (keep empty state element)
        container.querySelectorAll('.cart-item').forEach(el => el.remove());

        if (cart.length === 0) {
            emptyEl.style.display = 'flex';
            footer.style.display = 'none';
            return;
        }

        emptyEl.style.display = 'none';
        footer.style.display = 'block';

        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.price * item.qty;
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
        <div class="cart-item-img"><img src="${item.image}" alt="${item.name}" /></div>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span class="item-price">$${item.price}</span>
          <div class="cart-item-actions">
            <button class="cart-qty-btn" data-id="${item.id}" data-delta="-1">−</button>
            <span class="cart-item-qty">${item.qty}</span>
            <button class="cart-qty-btn" data-id="${item.id}" data-delta="1">+</button>
            <button class="cart-item-remove" data-id="${item.id}">Remove</button>
          </div>
        </div>
      `;
            container.appendChild(el);
        });

        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;

        // Bind events
        container.querySelectorAll('.cart-qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                updateCartQty(Number(btn.dataset.id), Number(btn.dataset.delta));
            });
        });
        container.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                removeFromCart(Number(btn.dataset.id));
            });
        });
    }

    // ==================== RENDER PRODUCT GRID ====================
    const productGrid = document.querySelector('.product-grid');

    products.forEach((product, i) => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.style.transitionDelay = `${i * 0.1}s`;

        let priceHTML = `<span class="price">$${product.price}</span>`;
        if (product.originalPrice) {
            priceHTML = `<span class="price">$${product.price}<span class="original">$${product.originalPrice}</span></span>`;
        }

        let tagHTML = '';
        if (product.tag) {
            tagHTML = `<span class="product-tag">${product.tag}</span>`;
        }

        card.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        ${tagHTML}
        <div class="product-overlay">
          <button class="overlay-btn quick-view-btn" data-id="${product.id}">Quick View</button>
          <button class="overlay-btn add-btn" data-id="${product.id}">Add to Cart</button>
        </div>
      </div>
      <div class="product-body">
        <h3>${product.name}</h3>
        ${priceHTML}
      </div>
    `;

        productGrid.appendChild(card);
    });

    // Observe cards for stagger animation
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.product-card').forEach(card => cardObserver.observe(card));

    // Quick view + add to cart listeners
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(Number(btn.dataset.id));
        });
    });

    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(Number(btn.dataset.id));
        });
    });

    // ==================== PRODUCT MODAL ====================
    const modal = document.getElementById('productModal');
    const modalClose = document.getElementById('modalClose');
    let modalQty = 1;
    let modalProductId = null;

    function openModal(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        modalProductId = productId;
        modalQty = 1;

        document.getElementById('modalImg').src = product.image;
        document.getElementById('modalImg').alt = product.name;
        document.getElementById('modalTag').textContent = product.category;
        document.getElementById('modalName').textContent = product.name;
        document.getElementById('modalPrice').textContent = `$${product.price}`;
        document.getElementById('modalDesc').textContent = product.desc;
        document.getElementById('qtyValue').textContent = 1;

        // Colors
        const colorContainer = document.getElementById('modalColors');
        colorContainer.innerHTML = '';
        product.colors.forEach((color, i) => {
            const swatch = document.createElement('button');
            swatch.className = `color-swatch${i === 0 ? ' active' : ''}`;
            swatch.style.background = color;
            swatch.addEventListener('click', () => {
                colorContainer.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
            });
            colorContainer.appendChild(swatch);
        });

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.getElementById('qtyMinus').addEventListener('click', () => {
        if (modalQty > 1) {
            modalQty--;
            document.getElementById('qtyValue').textContent = modalQty;
        }
    });

    document.getElementById('qtyPlus').addEventListener('click', () => {
        modalQty++;
        document.getElementById('qtyValue').textContent = modalQty;
    });

    document.getElementById('modalAddBtn').addEventListener('click', () => {
        if (modalProductId) {
            addToCart(modalProductId, modalQty);
            closeModal();
        }
    });

    // ==================== CART DRAWER ====================
    const cartDrawer = document.getElementById('cartDrawer');
    const cartBackdrop = document.getElementById('cartBackdrop');
    const cartToggle = document.getElementById('cartToggle');
    const cartCloseBtn = document.getElementById('cartClose');
    const cartShopLink = document.getElementById('cartShopLink');

    function openCart() {
        cartDrawer.classList.add('open');
        cartBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartDrawer.classList.remove('open');
        cartBackdrop.classList.remove('open');
        document.body.style.overflow = '';
    }

    cartToggle.addEventListener('click', openCart);
    cartCloseBtn.addEventListener('click', closeCart);
    cartBackdrop.addEventListener('click', closeCart);
    cartShopLink.addEventListener('click', closeCart);

    // ==================== NAVBAR ====================
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    });

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });

    // ==================== SCROLL REVEAL ====================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ==================== NEWSLETTER ====================
    const newsletterForm = document.getElementById('newsletterForm');
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = newsletterForm.querySelector('button');
        btn.textContent = 'Subscribed ✓';
        btn.style.background = '#8a9a7b';
        btn.disabled = true;
        setTimeout(() => {
            btn.textContent = 'Subscribe';
            btn.style.background = '';
            btn.disabled = false;
            newsletterForm.reset();
        }, 3000);
    });

    // ==================== SMOOTH ANCHORS ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
