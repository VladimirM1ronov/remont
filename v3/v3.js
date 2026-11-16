// Вариант 3: плавный скролл (Lenis), появление блоков, параллакс фото, дрейф фонового слова,
// слайдер этапов, шапка и мобильное меню. Под «уменьшить движение» всё стоит на месте.
(() => {
  const root = document.documentElement;
  const still = root.classList.contains('still');
  const hdH = () => (document.querySelector('[data-hd]')?.offsetHeight || 70);

  // плавный скролл
  let lenis = null;
  if (!still && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    root.classList.add('lenis-on');
  }
  const goTo = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: -hdH() + 1, duration: 1.4 });
    else window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - hdH() + 1, behavior: still ? 'auto' : 'smooth' });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || url.origin !== location.origin) return;
    const id = url.hash.slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    goTo(target);
    history.replaceState(null, '', '#' + id);
  });

  // шапка: прозрачная над первым экраном, плотная дальше
  const hd = document.querySelector('[data-hd]');
  const onScroll = () => hd && hd.classList.toggle('is-solid', scrollY > 40 || hd.classList.contains('hd--fixed'));

  // мобильное меню
  const burger = document.querySelector('[data-burger]');
  const menu = document.querySelector('[data-menu]');
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); hd.classList.remove('menu-open');
    lenis?.start(); document.body.style.overflow = '';
  }
  burger?.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open; burger.setAttribute('aria-expanded', String(open)); hd.classList.toggle('menu-open', open);
    if (open) { lenis?.stop(); document.body.style.overflow = 'hidden'; } else { lenis?.start(); document.body.style.overflow = ''; }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(() => goTo(t), 150); }

  // первый экран: текст и фото въезжают при загрузке
  const hero = document.querySelector('[data-hero]');
  requestAnimationFrame(() => hero?.classList.add('is-in'));

  // появление блоков при прокрутке
  const items = document.querySelectorAll('[data-a]');
  if (still || !('IntersectionObserver' in window)) items.forEach((el) => el.classList.add('in'));
  else {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  }

  // параллакс фото внутри рамок и дрейф фонового слова
  const par = [...document.querySelectorAll('[data-parallax]')];
  const drift = [...document.querySelectorAll('[data-drift]')];
  const frame = () => {
    const vh = innerHeight;
    par.forEach((img) => {
      const box = img.parentElement.getBoundingClientRect();
      if (box.bottom < -100 || box.top > vh + 100) return;
      const k = parseFloat(img.dataset.parallax) || 0.1;
      const p = (box.top + box.height / 2 - vh / 2) / vh; // -1..1
      img.style.transform = `translate3d(0, ${(-p * k * 100 - 8).toFixed(2)}%, 0)`;
    });
    drift.forEach((el) => {
      const box = el.parentElement.getBoundingClientRect();
      if (box.bottom < 0 || box.top > vh) return;
      const p = (vh - box.top) / (vh + box.height); // 0..1
      el.style.transform = `translate3d(${(-p * 30 + 5).toFixed(2)}%, 0, 0)`;
    });
  };
  let ticking = false;
  const tick = () => { onScroll(); if (!still && !ticking) { ticking = true; requestAnimationFrame(() => { frame(); ticking = false; }); } };
  if (lenis) lenis.on('scroll', tick); else addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', tick);
  tick();

  // слайдер этапов
  document.querySelectorAll('[data-slider]').forEach((sl) => {
    const slides = [...sl.querySelectorAll('[data-slide]')];
    const bar = sl.querySelector('[data-bar]');
    const count = sl.querySelector('[data-count]');
    let i = 0;
    const show = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('is-on', k === i); s.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
      if (bar) bar.style.transform = `translateX(${i * 100}%)`;
      if (count) count.textContent = String(i + 1).padStart(2, '0');
    };
    sl.querySelector('[data-prev]')?.addEventListener('click', () => show(i - 1));
    sl.querySelector('[data-next]')?.addEventListener('click', () => show(i + 1));
    sl.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1); });
    let x0 = null;
    sl.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    sl.addEventListener('pointerup', (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 60) show(i + (e.clientX < x0 ? 1 : -1)); x0 = null; });
    show(0);
  });
})();
