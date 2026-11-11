// Slide navigation shared by both decks: scales the 1920 × 1080 stage to the window and moves with the keys a
// presentation clicker sends (arrows, Page Up / Page Down, space), with the buttons or with a click.
// The address keeps the slide: #7, or the slide's key (#A.9.1) when it has one, so the main deck can open a criterion.
// A text block marked data-fit shrinks until it fits its box; a video plays only while its slide is shown.
(function () {
  const stage = document.querySelector('.stage');
  const slides = [...document.querySelectorAll('.slide')];
  const panel = document.querySelector('.notes-panel');
  const counter = document.querySelector('[data-counter]');
  let current = 0;

  function fit() {
    const k = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = `translate(${-960 * k}px, ${-540 * k}px) scale(${k})`;
  }

  // Shrinks the text of a box until it no longer overflows, down to 60 % of its size
  function fitText(slide) {
    slide.querySelectorAll('[data-fit]').forEach((box) => {
      box.dataset.fs ??= getComputedStyle(box).fontSize;
      box.style.fontSize = box.dataset.fs;
      let size = parseFloat(box.dataset.fs);
      const floor = size * 0.6;
      while (box.scrollHeight > box.clientHeight + 1 && size > floor) { size -= 1; box.style.fontSize = `${size}px`; }
    });
  }

  function media(slide, on) {
    slide.querySelectorAll('video[data-src]').forEach((v) => {
      if (on) {
        v.preload = 'auto';
        if (!v.src) { v.src = v.dataset.src; v.load(); }
        // data-start: where the loop begins, as a fraction of the clip, to skip a test's setup
        const begin = () => { v.currentTime = (v.duration || 0) * (+v.dataset.start || 0); v.play().catch(() => {}); };
        v.readyState >= 1 ? begin() : v.addEventListener('loadedmetadata', begin, { once: true });
      }
      else if (v.src) { v.pause(); }
    });
  }

  // Builds: elements marked data-step="n" appear one press at a time; a number marked data-count counts up when it appears
  let step = 0;
  const maxStep = (s) => Math.max(0, ...[...s.querySelectorAll('[data-step]')].map((el) => +el.dataset.step));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function count(el) {
    const target = parseFloat(el.dataset.count), dec = +(el.dataset.dec ?? 0), t0 = performance.now(), dur = reduced ? 0 : 900;
    const fmt = (v) => (dec ? v.toFixed(dec).replace('.', ',') : Math.round(v).toLocaleString('es-AR'));
    const tick = (t) => { const k = dur ? Math.min(1, (t - t0) / dur) : 1; el.textContent = fmt(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  function reveal(s, k) {
    step = k;
    s.querySelectorAll('[data-step]').forEach((el) => {
      const on = +el.dataset.step <= k;
      if (on && !el.classList.contains('on')) el.querySelectorAll('[data-count]').forEach(count), el.matches('[data-count]') && count(el);
      el.classList.toggle('on', on);
    });
  }

  function show(i, atEnd = false) {
    const prev = slides[current];
    current = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((s, n) => {
      const on = n === current;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    const s = slides[current];
    s.querySelectorAll('[data-in]').forEach((el, k) => el.style.setProperty('--i', Math.min(k, 8)));
    if (prev !== s) media(prev, false);
    fitText(s);
    media(s, true);
    s.querySelectorAll('[data-count]').forEach((el) => { if (!el.closest('[data-step]')) count(el); });
    reveal(s, atEnd ? maxStep(s) : 0);
    const notes = s.querySelector('.notes');
    if (panel) panel.innerHTML = `<h3>Notas · diapositiva ${current + 1} de ${slides.length}</h3>${notes ? notes.innerHTML : '<p>Sin notas.</p>'}`;
    if (counter) counter.textContent = `${current + 1} / ${slides.length}`;
    history.replaceState(null, '', `#${s.dataset.key ?? current + 1}`);
  }

  function fromHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    const byKey = slides.findIndex((s) => s.dataset.key === h);
    return byKey >= 0 ? byKey : (parseInt(h, 10) || 1) - 1;
  }

  const next = () => (step < maxStep(slides[current]) ? reveal(slides[current], step + 1) : show(current + 1));
  const prev = () => (step > 0 ? reveal(slides[current], step - 1) : show(current - 1, true));
  const toggleNotes = () => {
    if (!panel) return;
    const open = panel.classList.toggle('is-open');
    document.querySelector('[data-action=notes]')?.setAttribute('aria-pressed', String(open));
  };

  // Typing a criterion code (A912 or A.9.1) and Enter jumps to it, for when there is a keyboard
  let typed = '', typedAt = 0;
  function jump(key) {
    const code = key.toUpperCase().replace(/[^AB0-9]/g, '').replace(/^(\d)/, 'A$1');
    const candidates = slides.map((s, n) => [s.dataset.key, n]).filter(([k]) => k && k.replace(/\./g, '') === code.replace(/\./g, ''));
    if (candidates.length) show(candidates[0][1]);
  }

  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === 'Home') show(0);
    else if (e.key === 'End') show(slides.length - 1);
    else if (e.key === 'Enter' && typed) { jump(typed); typed = ''; }
    else if (/^[abAB0-9.]$/.test(e.key)) {
      if (Date.now() - typedAt > 2500) typed = '';
      typed += e.key; typedAt = Date.now();
    }
    else if (e.key.toLowerCase() === 'n') toggleNotes();
    else if (e.key.toLowerCase() === 'f') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  });
  stage.addEventListener('click', (e) => {
    if (e.target.closest('a, button, video')) return;
    (e.clientX > window.innerWidth / 3 ? next : prev)();
  });
  document.querySelector('[data-action=prev]')?.addEventListener('click', prev);
  document.querySelector('[data-action=next]')?.addEventListener('click', next);
  document.querySelector('[data-action=notes]')?.addEventListener('click', toggleNotes);
  window.addEventListener('hashchange', () => { const i = fromHash(); if (i !== current) show(i); });

  window.addEventListener('resize', () => { fit(); fitText(slides[current]); });
  fit();
  document.fonts?.ready.then(() => fitText(slides[current]));
  show(fromHash());
})();
