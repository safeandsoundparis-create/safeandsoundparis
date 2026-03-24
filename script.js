/* ============================================
   SAFE & SOUND — script.js  (global, toutes pages)
   ============================================ */

/* ── Nav scroll ── */
const nav    = document.getElementById('nav');
const burger = document.getElementById('burger');
const mobile = document.getElementById('mobileMenu');

if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

if (burger && mobile) {
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    if (open) {
      mobile.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      mobile.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
  mobile.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', () => {
      burger.classList.remove('open');
      mobile.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ── Lang toggle — géré par translations.js (initLang) ── */

/* ── Intersection Observer — fade-in ── */
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    // stagger siblings
    const siblings = [...entry.target.parentElement.querySelectorAll('.fade-in:not(.visible)')];
    const idx = siblings.indexOf(entry.target);
    entry.target.style.transitionDelay = `${Math.min(idx, 4) * 0.08}s`;
    entry.target.classList.add('visible');
    io.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

/* ── Gallery strip pause on hover ── */
const strip = document.getElementById('strip');
if (strip) {
  strip.addEventListener('mouseenter', () => { strip.style.animationPlayState = 'paused'; });
  strip.addEventListener('mouseleave', () => { strip.style.animationPlayState = 'running'; });
}

/* ── Hero parallax ── */
const heroBgImg = document.querySelector('.home-hero__bg img');
if (heroBgImg) {
  window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight) {
      heroBgImg.style.transform = `scale(1.05) translateY(${window.scrollY * 0.12}px)`;
    }
  }, { passive: true });
}

/* ── Price counter animation ── */
const priceEl = document.getElementById('priceCounter');
if (priceEl) {
  let animated = false;
  const counterIO = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting || animated) return;
    animated = true;
    let start = null;
    const end = 9380;
    const duration = 1500;
    function step(ts) {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      const val  = Math.round(ease * end);
      priceEl.innerHTML = val.toLocaleString('fr-FR') + ' <sup>€</sup>';
      if (prog < 1) requestAnimationFrame(step);
      else priceEl.innerHTML = '9 380 <sup>€</sup>';
    }
    requestAnimationFrame(step);
    counterIO.unobserve(priceEl);
  }, { threshold: 0.6 });
  counterIO.observe(priceEl);
}

/* ── Contact form → Formspree ── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  let lastSubmitTime = 0;
  const RATE_LIMIT_MS = 5000;

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    // Rate limiting
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_MS) return;
    lastSubmitTime = now;

    // Honeypot check
    const honeypot = contactForm.querySelector('[name="_honeypot"]');
    if (honeypot && honeypot.value) return;

    const btn     = document.getElementById('submitBtn');
    const success = document.getElementById('formSuccess');

    const hotel   = contactForm.querySelector('#hotel')?.value   || '';
    const name    = contactForm.querySelector('#fullname')?.value || '';
    const email   = contactForm.querySelector('#email')?.value   || '';
    const phone   = contactForm.querySelector('#phone')?.value   || '';
    const message = contactForm.querySelector('#message')?.value || '';
    const lang    = localStorage.getItem('sas-lang') || 'fr';

    const subject = lang === 'fr'
      ? `Demande Safe & Sound — ${hotel}`
      : lang === 'ar'
      ? `طلب Safe & Sound — ${hotel}`
      : `Safe & Sound enquiry — ${hotel}`;

    if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; }

    try {
      const res = await fetch('https://formspree.io/f/mwvrdjee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ subject, hotel, name, email, phone, message, lang })
      });

      if (res.ok) {
        if (success) { success.style.display = 'block'; }
        contactForm.reset();
        setTimeout(() => { if (success) success.style.display = 'none'; }, 5000);
      } else {
        alert(lang === 'fr' ? 'Erreur lors de l\'envoi. Veuillez réessayer.' : 'Error sending. Please try again.');
      }
    } catch {
      alert(lang === 'fr' ? 'Erreur réseau. Veuillez réessayer.' : 'Network error. Please try again.');
    } finally {
      if (btn) { btn.disabled = false; btn.style.opacity = ''; }
    }
  });
}

/* ── Cursor glow (desktop only) ── */
const glowEl = document.getElementById('cursor-glow');
if (glowEl && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('mousemove', e => {
    glowEl.style.left = e.clientX + 'px';
    glowEl.style.top  = e.clientY + 'px';
  }, { passive: true });
} else if (glowEl) {
  glowEl.style.display = 'none';
}

/* ── Active nav link highlight ── */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__link[href]').forEach(a => {
  const page = a.getAttribute('href');
  if (page === currentPage || (currentPage === '' && page === 'index.html')) {
    a.classList.add('active');
  }
});
