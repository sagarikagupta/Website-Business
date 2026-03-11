/* ===========================
   HEALTH & WELLNESS – JAVASCRIPT
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==================== SIDEBAR ====================
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            sidebar.classList.toggle('open');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                sidebar.classList.remove('open');
            });
        });
    }

    // ==================== FLOATING CTA ====================
    const floatingCta = document.getElementById('floatingCta');
    window.addEventListener('scroll', () => {
        floatingCta.classList.toggle('visible', window.scrollY > 600);
    });

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
        threshold: 0.12,
        rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ==================== BOOKING FORM ====================
    const bookingForm = document.getElementById('bookingForm');
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = bookingForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;

        btn.textContent = 'Booking Confirmed ✓';
        btn.style.background = 'linear-gradient(135deg, #5e7d52, #7a9b6d)';
        btn.disabled = true;

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
            bookingForm.reset();
        }, 3500);
    });

    // ==================== SMOOTH ANCHORS ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 40; // minimal offset
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ==================== ACTIVE NAV HIGHLIGHT ====================
    const sections = document.querySelectorAll('section[id]');
    const navLinkElements = document.querySelectorAll('.sidebar-links a');

    function highlightNav() {
        const scrollY = window.scrollY + 120;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollY >= top && scrollY < top + height) {
                navLinkElements.forEach(link => {
                    link.style.color = 'var(--text-secondary)';
                    if (link.getAttribute('href') === `#${id}`) {
                        link.style.color = 'var(--accent)';
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNav);
});
