/* ===========================
   SCROLL REVEAL
   =========================== */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

/* ===========================
   NAV: scroll class + active link
   =========================== */
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-links a[data-section]');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  // scrolled class
  nav.classList.toggle('scrolled', window.scrollY > 40);

  // active link
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    if (window.scrollY >= top) current = sec.id;
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}, { passive: true });

/* ===========================
   BURGER MENU
   =========================== */
const burger = document.getElementById('burger');
const navLinksContainer = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
  navLinksContainer.classList.toggle('open');
});

// Close on link click
navLinksContainer.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinksContainer.classList.remove('open'));
});

/* ===========================
   HERO PARTICLES
   =========================== */
const particleContainer = document.querySelector('.hero-particles');

function createParticle() {
  const p = document.createElement('div');
  p.classList.add('particle');
  const size = Math.random() * 4 + 2;
  const left = Math.random() * 100;
  const duration = Math.random() * 14 + 8;
  const delay = Math.random() * 12;

  p.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${left}%;
    bottom: -10px;
    animation-duration: ${duration}s;
    animation-delay: ${delay}s;
    opacity: 0;
  `;
  particleContainer.appendChild(p);

  setTimeout(() => {
    if (p.parentNode) p.remove();
    createParticle();
  }, (duration + delay) * 1000);
}

// Spawn initial particles
for (let i = 0; i < 22; i++) createParticle();

/* ===========================
   PORTFOLIO FILTER
   =========================== */
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioCards = document.querySelectorAll('.portfolio-card');
const sitePreviewModal = document.getElementById('sitePreviewModal');
const sitePreviewBackdrop = document.getElementById('sitePreviewBackdrop');
const sitePreviewPanel = sitePreviewModal?.querySelector('.site-preview-panel');
const sitePreviewFrame = document.getElementById('sitePreviewFrame');
const sitePreviewTitle = document.getElementById('sitePreviewTitle');
const sitePreviewClose = document.getElementById('sitePreviewClose');
const sitePreviewBack = document.getElementById('sitePreviewBack');
let lastPreviewTrigger = null;

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    portfolioCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      if (match) {
        card.style.opacity = '1';
        card.style.transform = '';
        card.style.pointerEvents = 'auto';
      } else {
        card.style.opacity = '0.15';
        card.style.transform = 'scale(0.97)';
        card.style.pointerEvents = 'none';
      }
    });
  });
});

function openSitePreview(card) {
  if (!sitePreviewModal || !sitePreviewFrame || !sitePreviewTitle) return;

  lastPreviewTrigger = card;
  sitePreviewFrame.src = card.dataset.previewUrl || '';
  sitePreviewTitle.textContent = card.dataset.previewTitle || 'Website Preview';
  sitePreviewModal.classList.add('open');
  sitePreviewModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeSitePreview() {
  if (!sitePreviewModal || !sitePreviewFrame) return;

  sitePreviewModal.classList.remove('open');
  sitePreviewModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  sitePreviewFrame.src = 'about:blank';

  if (lastPreviewTrigger) {
    lastPreviewTrigger.focus();
  }
}

portfolioCards.forEach(card => {
  const openCardPreview = () => openSitePreview(card);

  card.addEventListener('click', openCardPreview);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openCardPreview();
    }
  });
});

sitePreviewClose?.addEventListener('click', closeSitePreview);
sitePreviewBack?.addEventListener('click', closeSitePreview);
sitePreviewPanel?.addEventListener('click', event => event.stopPropagation());
sitePreviewBackdrop?.addEventListener('click', (event) => {
  if (event.target === sitePreviewBackdrop) {
    closeSitePreview();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sitePreviewModal?.classList.contains('open')) {
    closeSitePreview();
  }
});

/* ===========================
   COUNTER ANIMATION
   =========================== */
function animateCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  let current = 0;
  const step = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current + suffix;
    if (current >= target) clearInterval(timer);
  }, 20);
}

const statNums = document.querySelectorAll('.stat-number[data-target]');
const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => statsObserver.observe(el));

/* ===========================
   CONTACT FORM
   =========================== */
const form = document.getElementById('contactForm');
const toast = document.getElementById('toast');

function showToast(msg, color = '#18C97E') {
  toast.textContent = msg;
  toast.style.background = color;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3800);
}

function validate(field, msg) {
  const errEl = field.nextElementSibling;
  if (!field.value.trim()) {
    field.classList.add('error');
    if (errEl && errEl.classList.contains('form-error-msg')) errEl.textContent = msg;
    return false;
  }
  field.classList.remove('error');
  if (errEl && errEl.classList.contains('form-error-msg')) errEl.textContent = '';
  return true;
}

function validateEmail(field) {
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
  const errEl = field.nextElementSibling;
  field.classList.toggle('error', !ok);
  if (errEl && errEl.classList.contains('form-error-msg')) {
    errEl.textContent = ok ? '' : 'Please enter a valid email address.';
  }
  return ok;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = form.querySelector('#fname');
  const email = form.querySelector('#femail');
  const message = form.querySelector('#fmessage');

  const valid = [
    validate(name, 'Name is required.'),
    validateEmail(email),
    validate(message, 'Message cannot be empty.'),
  ].every(Boolean);

  if (!valid) return;

  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  // Simulate async submit
  setTimeout(() => {
    form.reset();
    btn.textContent = '✓ Message Sent!';
    showToast('🎉 Thanks! We\'ll be in touch within 24 hours.');
    setTimeout(() => {
      btn.textContent = 'Send Message →';
      btn.disabled = false;
    }, 3000);
  }, 1400);
});

// Live clear errors on input
form.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('input', () => {
    field.classList.remove('error');
    const errEl = field.nextElementSibling;
    if (errEl && errEl.classList.contains('form-error-msg')) errEl.textContent = '';
  });
});

/* ===========================
   SMOOTH SCROLL FOR ANCHORS
   =========================== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
