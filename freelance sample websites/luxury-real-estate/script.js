/* ===========================
   LUXURY REAL ESTATE – JAVASCRIPT
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==================== NAVBAR ====================
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    // Scroll style
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    });

    // Mobile toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });

    // ==================== PARALLAX ====================
    const heroParallax = document.querySelector('.hero-parallax');
    if (heroParallax) {
        window.addEventListener('scroll', () => {
            const offset = window.scrollY;
            if (offset < window.innerHeight) {
                heroParallax.style.transform = `translateY(${offset * 0.35}px)`;
            }
        });
    }

    // ==================== SCROLL REVEAL ====================
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ==================== GALLERY (SPOTLIGHT) ====================
    const galleryMain = document.getElementById('galleryMain');
    const thumbs = document.querySelectorAll('.thumb');

    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            galleryMain.style.opacity = 0;
            setTimeout(() => {
                galleryMain.src = thumb.dataset.src;
                galleryMain.style.opacity = 1;
            }, 200);
        });
    });

    // ==================== TESTIMONIAL CAROUSEL ====================
    const track = document.getElementById('testimonialTrack');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let current = 0;
    const total = dots.length;

    function goToSlide(index) {
        if (index < 0) index = total - 1;
        if (index >= total) index = 0;
        current = index;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    prevBtn.addEventListener('click', () => goToSlide(current - 1));
    nextBtn.addEventListener('click', () => goToSlide(current + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goToSlide(i)));

    // Auto-advance
    let autoPlay = setInterval(() => goToSlide(current + 1), 6000);
    const carousel = document.querySelector('.testimonial-carousel');
    carousel.addEventListener('mouseenter', () => clearInterval(autoPlay));
    carousel.addEventListener('mouseleave', () => {
        autoPlay = setInterval(() => goToSlide(current + 1), 6000);
    });

    // ==================== CONTACT FORM ====================
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.textContent = 'Submitted ✓';
        btn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
        btn.disabled = true;
        setTimeout(() => {
            btn.textContent = 'Request Private Viewing';
            btn.style.background = '';
            btn.disabled = false;
            form.reset();
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
