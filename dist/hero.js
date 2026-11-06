'use strict';
(() => {
  const hero = document.querySelector('.immersive-hero');
  if (!hero) return;
  const header = document.querySelector('.home-header');
  const layers = [...hero.querySelectorAll('.hero-slide')];
  const title = hero.querySelector('.heroTitle span');
  const phrases = ['La visión detrás\nde cada espacio.', 'Cada detalle,\nuna experiencia.', 'Espacios que inspiran.\nDetalles que importan.'];
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const logo = hero.querySelector('.heroLogo');
  let logoTimer;
  const resetLogo = () => {
    clearTimeout(logoTimer);
    logo?.classList.remove('is-color');
    logo?.setAttribute('aria-pressed', 'false');
  };
  logo?.addEventListener('click', () => {
    const color = !logo.classList.contains('is-color');
    resetLogo();
    if (color) {
      logo.classList.add('is-color');
      logo.setAttribute('aria-pressed', 'true');
      logoTimer = setTimeout(resetLogo, 3000);
    }
  });
  const scenes = [
    ['assets/hero/01.webp','50% 50%'], ['assets/hero/06.webp','60% 50%'],
    ['assets/hero/02.webp','50% 50%'], ['assets/hero/07.webp','65% 50%'],
    ['assets/hero/03.webp','55% 50%'], ['assets/hero/08.webp','65% 50%'],
    ['assets/hero/04.webp','50% 50%'], ['assets/hero/09.webp','60% 50%'],
    ['assets/hero/05.webp','45% 50%'], ['assets/hero/10.webp','65% 50%']
  ];
  const cache = new Map();
  let current = 0, active = 0, busy = false, timer, revealTimer, transitionTimer;
  let paused = media.matches;
  let introElapsed = 0, introStarted = 0, showingLogo = true, phraseIndex = 0;
  let phaseDuration = 12500;
  const load = src => {
    if (!cache.has(src)) cache.set(src, BluSafety.loadImage(src).catch(error => { cache.delete(src); throw error; }));
    return cache.get(src);
  };
  const warm = () => {
    if (paused || document.hidden || (typeof navigator !== 'undefined' && navigator.connection?.saveData)) return;
    const upcoming = scenes[(current + 1) % scenes.length][0];
    for (const key of cache.keys()) if (cache.size > 3 && key !== scenes[current][0] && key !== upcoming) cache.delete(key);
    load(upcoming).catch(() => {});
  };
  const schedule = () => {
    clearTimeout(timer);
    if (!paused && !document.hidden && !busy) timer = setTimeout(advance, 6000);
  };
  async function advance() {
    if (busy || paused || document.hidden) return;
    busy = true;
    let next = current;
    for (let attempt = 0; attempt < scenes.length - 1; attempt++) {
      next = (next + 1) % scenes.length;
      try {
        const image = await load(scenes[next][0]);
        if (paused || document.hidden) { busy = false; schedule(); return; }
        const old = layers[active], incoming = layers[1 - active];
        incoming.src = image.src; incoming.style.objectPosition = scenes[next][1];
        await incoming.decode().catch(() => {});
        incoming.className = 'hero-slide';
        // Flush opacity: the old layer remains fully opaque underneath this fade.
        void incoming.offsetWidth;
        incoming.classList.add('is-entering');
        const selected = next;
        transitionTimer = setTimeout(() => {
          incoming.className = 'hero-slide is-current';
          old.className = 'hero-slide';
          active = 1 - active; current = selected; busy = false;
          warm(); schedule();
        }, 1250);
        return;
      } catch { /* Keep the current image visible; skip only the failed asset. */ }
    }
    busy = false; schedule();
  }
  function runIntroClock() {
    if (document.hidden || media.matches) return;
    introStarted = performance.now();
    clearTimeout(revealTimer);
    revealTimer = setTimeout(() => {
      showingLogo = !showingLogo;
      resetLogo();
      if (logo) logo.disabled = !showingLogo;
      if (!showingLogo) {
        title.textContent = phrases[phraseIndex];
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
      hero.classList.toggle('is-message', !showingLogo);
      hero.classList.toggle('is-logo', showingLogo);
      phaseDuration = showingLogo ? 12500 : 8500;
      introElapsed = 0; introStarted = 0; runIntroClock();
    }, Math.max(0, phaseDuration - introElapsed));
  }
  const updateScroll = () => {
    const progress = Math.min(1, Math.max(0, scrollY / (hero.offsetHeight * .62)));
    hero.style.setProperty('--intro-opacity', String(1 - progress));
    hero.style.setProperty('--intro-lift', (-progress * 42) + 'px');
    const visible = scrollY > 48;
    header.classList.toggle('is-visible', visible);
    header.inert = !visible;
  };
  let queued = false;
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; updateScroll(); }); }
  }, { passive: true });
  addEventListener('resize', updateScroll);
  media.addEventListener('change', () => {
    paused = media.matches;
    clearTimeout(revealTimer);
    introElapsed = 0; introStarted = 0;
    if (paused) {
      resetLogo();
      if (logo) logo.disabled = false;
      showingLogo = true; phaseDuration = 12500;
      hero.classList.toggle('is-message', false);
      hero.classList.toggle('is-logo', false);
    } else runIntroClock();
    schedule();
  });
  const message = hero.querySelector('.heroMessage');
  message.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const bounds = message.getBoundingClientRect();
    message.style.setProperty('--shine-x', ((event.clientX - bounds.left) / bounds.width * 100) + '%');
    message.style.setProperty('--shine-y', ((event.clientY - bounds.top) / bounds.height * 100) + '%');
  });
  document.addEventListener('visibilitychange', () => {
    clearTimeout(timer);
    if (document.hidden) {
      resetLogo();
      clearTimeout(revealTimer);
      if (introStarted) introElapsed += performance.now() - introStarted;
      introStarted = 0;
    } else { schedule(); runIntroClock(); }
  });
  updateScroll();
  const first = layers[0];
  let started = false, startTimer;
  const start = () => {
    if (started) return; started = true; clearTimeout(startTimer);
    hero.classList.add('hero-ready'); runIntroClock(); warm(); schedule();
  };
  startTimer = setTimeout(start, 10000);
  if (first.complete && first.naturalWidth) first.decode().catch(() => {}).then(start);
  else { first.addEventListener('load', start, { once: true }); first.addEventListener('error', start, { once: true }); }
})();
