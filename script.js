// ========================
// STACKLY — script.js
// ========================

(function () {
  'use strict';

  // ── LOADER ──────────────────────────────────────
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
    }, 2200);
  });
  document.body.style.overflow = 'hidden';

  // ── HEADER SCROLL ───────────────────────────────
  const header = document.getElementById('header');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 60);
    backToTop.classList.toggle('visible', y > 400);
    updateActiveNav();
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── MOBILE NAV ──────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavClose = document.getElementById('mobileNavClose');
  const backdrop = document.getElementById('mobileNavBackdrop');

  function openMobileNav() {
    mobileNav.classList.add('open');
    backdrop.classList.add('visible');
    document.body.classList.add('nav-open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeMobileNav() {
    mobileNav.classList.remove('open');
    backdrop.classList.remove('visible');
    document.body.classList.remove('nav-open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', openMobileNav);
  mobileNavClose.addEventListener('click', closeMobileNav);
  backdrop.addEventListener('click', closeMobileNav);

  document.querySelectorAll('.mobile-nav__link, .mobile-nav__cta').forEach(el => {
    el.addEventListener('click', closeMobileNav);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileNav();
  });

  // ── SMOOTH SCROLL (anchors) ──────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = header.offsetHeight + 8;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── ACTIVE NAV LINK ─────────────────────────────
  const sections = ['home', 'services', 'about', 'stats', 'contact'];

  function updateActiveNav() {
    const y = window.scrollY + header.offsetHeight + 40;
    let current = sections[0];
    sections.forEach(id => {
      const sec = document.getElementById(id);
      if (sec && sec.offsetTop <= y) current = id;
    });
    document.querySelectorAll('.nav__link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  // ── FOOTER YEAR ─────────────────────────────────
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── SCROLL REVEAL ───────────────────────────────
  const revealEls = document.querySelectorAll(
    '.service-card, .stat-item, .testimonial-card, .about__feature, .section-header, .about__img'
  );
  revealEls.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach(el => revealObserver.observe(el));

  // ── STAT COUNTER ────────────────────────────────
  const statNumbers = document.querySelectorAll('.stat-item__number');
  let counted = false;

  function animateCounters() {
    if (counted) return;
    counted = true;
    statNumbers.forEach(el => {
      const target = +el.dataset.target;
      const duration = 1800;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          el.textContent = target.toLocaleString();
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current).toLocaleString();
        }
      }, 16);
    });
  }

  const statsSection = document.getElementById('stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        animateCounters();
        statsObserver.disconnect();
      }
    }, { threshold: 0.3 });
    statsObserver.observe(statsSection);
  }

  // ── TESTIMONIAL SLIDER ──────────────────────────
  const track = document.getElementById('testimonialsTrack');
  const outer = track ? track.parentElement : null; // .testimonials__outer
  const dotsContainer = document.getElementById('testimonialsDotsContainer');

  if (track && outer) {
    const cards = Array.from(track.querySelectorAll('.testimonial-card'));
    let current = 0;
    let autoTimer;

    function visibleCount() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    function maxIndex() {
      return Math.max(0, cards.length - visibleCount());
    }

    // Slide distance = card width + gap (24px)
    // Card width = (outer width - gaps between visible cards) / visibleCount
    function slideWidth() {
      const vis   = visibleCount();
      const gaps  = (vis - 1) * 24;
      return (outer.offsetWidth - gaps) / vis + 24;
    }

    function buildDots() {
      dotsContainer.innerHTML = '';
      const count = maxIndex() + 1;
      for (let i = 0; i < count; i++) {
        const btn = document.createElement('button');
        btn.className = 'dot' + (i === current ? ' active' : '');
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-label', `Testimonial ${i + 1}`);
        btn.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(btn);
      }
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, maxIndex()));
      const offset = current * slideWidth();
      track.style.transition = 'transform .5s cubic-bezier(.77,0,.175,1)';
      track.style.transform  = `translateX(-${offset}px)`;
      dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
      resetAuto();
    }

    function next() { goTo(current >= maxIndex() ? 0 : current + 1); }
    function prev() { goTo(current <= 0 ? maxIndex() : current - 1); }

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(next, 4500);
    }

    // Touch / swipe support
    let touchStartX = 0;
    outer.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    outer.addEventListener('touchend',   e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    }, { passive: true });

    buildDots();
    resetAuto();
    window.addEventListener('resize', () => {
      // Snap without animation on resize
      track.style.transition = 'none';
      track.style.transform  = `translateX(-${current * slideWidth()}px)`;
      buildDots();
    }, { passive: true });
  }

  // ── HERO PARTICLES ──────────────────────────────
  const particleContainer = document.getElementById('heroParticles');
  if (particleContainer) {
    const count = window.innerWidth < 768 ? 18 : 36;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 4 + 2;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const delay = Math.random() * 5;
      const dur = 4 + Math.random() * 6;
      p.style.cssText = `
        position:absolute; width:${size}px; height:${size}px;
        left:${x}%; top:${y}%; border-radius:50%;
        background:rgba(92,200,176,${Math.random() * 0.5 + 0.1});
        animation:particleFloat ${dur}s ${delay}s ease-in-out infinite alternate;
        pointer-events:none;
      `;
      particleContainer.appendChild(p);
    }

    const styleEl = document.createElement('style');
    styleEl.textContent = `@keyframes particleFloat {
      from { transform: translateY(0) scale(1); opacity:.6; }
      to   { transform: translateY(-20px) scale(1.4); opacity:.1; }
    }`;
    document.head.appendChild(styleEl);
  }

  // ── CONTACT FORM ────────────────────────────────
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;

      const name = document.getElementById('form-name');
      const email = document.getElementById('form-email');
      const message = document.getElementById('form-message');

      // Reset errors
      ['error-name', 'error-email', 'error-message'].forEach(id => {
        document.getElementById(id).textContent = '';
      });

      if (!name.value.trim()) {
        document.getElementById('error-name').textContent = 'Please enter your name.';
        valid = false;
      }
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        document.getElementById('error-email').textContent = 'Please enter a valid email.';
        valid = false;
      }
      if (!message.value.trim()) {
        document.getElementById('error-message').textContent = 'Please enter a message.';
        valid = false;
      }

      if (!valid) return;

      const btn = document.getElementById('form-submit');
      btn.disabled = true;
      btn.textContent = 'Sending…';

      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Send Message';
        form.reset();
        const success = document.getElementById('form-success');
        success.textContent = '✓ Message sent! We\'ll be in touch within 24 hours.';
        setTimeout(() => { success.textContent = ''; }, 5000);
      }, 1600);
    });
  }
  updateActiveNav();
})();
