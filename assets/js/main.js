(function () {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('open')) return;
      const target = e.target;
      if (target instanceof Element && !nav.contains(target) && target !== toggle && !toggle.contains(target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Smooth scroll for same-page links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id && id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          nav && nav.classList.remove('open');
          toggle && toggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // Animate skill bars when in view
  const bars = document.querySelectorAll('.skills .bar');
  const activate = entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('ready');
    });
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(activate, { threshold: 0.3 });
    bars.forEach(b => io.observe(b));
  } else {
    // Fallback
    bars.forEach(b => b.classList.add('ready'));
  }

  // Tabs: Experience/Education
  const tabButtons = document.querySelectorAll('.tabs .tab');
  const panels = {
    exp: document.getElementById('panel-exp'),
    edu: document.getElementById('panel-edu')
  };
  if (tabButtons.length && panels.exp && panels.edu) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.tab;
        if (!key) return;
        // Update buttons
        tabButtons.forEach(b => b.classList.toggle('active', b === btn));
        // Update panels
        Object.entries(panels).forEach(([k, el]) => {
          const show = k === key;
          el.classList.toggle('show', show);
          el.toggleAttribute('hidden', !show);
        });
      });
    });
  }

  // Footer year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Project filters
  const filterButtons = document.querySelectorAll('.proj-filters .filter');
  const projectCards = document.querySelectorAll('.projects .card');
  if (filterButtons.length && projectCards.length) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => {
          const isActive = b === btn;
          b.classList.toggle('active', isActive);
          b.setAttribute('aria-selected', String(isActive));
        });
        const f = btn.dataset.filter;
        projectCards.forEach(card => {
          const cats = (card.dataset.cat || '').split(/\s+/);
          const show = f === 'all' || cats.includes(f);
          card.classList.toggle('is-hidden', !show);
          card.toggleAttribute('hidden', !show);
        });
      });
    });
  }

  // Project quick view modal
  const modal = document.getElementById('proj-modal');
  const closeEls = modal ? modal.querySelectorAll('[data-close]') : [];
  let lastFocus = null;
  function openModalFrom(card) {
    if (!modal) return;
    // Populate
    const title = card.querySelector('h3')?.textContent || '';
    const desc = card.querySelector('p')?.textContent || '';
    const tags = Array.from(card.querySelectorAll('.tags .tag')).map(t => t.textContent.trim());
    const details = card.querySelector('.details');
    const live = card.querySelector('.links a:nth-child(1)')?.getAttribute('href') || '#';
    const code = card.querySelector('.links a:nth-child(2)')?.getAttribute('href') || '#';

    modal.querySelector('.pm-title').textContent = title;
    modal.querySelector('.pm-desc').textContent = desc;
    const tagWrap = modal.querySelector('.pm-tags');
    tagWrap.innerHTML = '';
    tags.forEach(txt => {
      const s = document.createElement('span');
      s.className = 'tag'; s.textContent = txt; tagWrap.appendChild(s);
    });
    const detWrap = modal.querySelector('.pm-details');
    detWrap.innerHTML = details ? details.innerHTML : '';
    modal.querySelector('.pm-live').setAttribute('href', live);
    modal.querySelector('.pm-code').setAttribute('href', code);

    // Open
    lastFocus = document.activeElement;
    modal.removeAttribute('hidden');
    document.body.classList.add('modal-open');
    const focusTarget = modal.querySelector('.modal-close');
    focusTarget && focusTarget.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.setAttribute('hidden', '');
    document.body.classList.remove('modal-open');
    lastFocus && lastFocus.focus && lastFocus.focus();
  }
  if (modal) {
    // Open from buttons
    document.querySelectorAll('.projects .more').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.card');
        if (card) openModalFrom(card);
      });
    });
    // Close interactions
    closeEls.forEach(el => el.addEventListener('click', closeModal));
    modal.addEventListener('click', (e) => {
      if (e.target === modal || (e.target instanceof Element && e.target.hasAttribute('data-close'))) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
    });
    // Basic focus trap
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusables = modal.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
})();

// Lightbox for visuals in details pages (robust, delegated)
(function () {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <button class="lb-close" type="button" aria-label="Close">Close</button>
    <div class="lb-nav">
      <button class="lb-btn lb-prev" type="button" aria-label="Previous">‹</button>
      <button class="lb-btn lb-next" type="button" aria-label="Next">›</button>
    </div>
    <img alt="Expanded visual" />`;
  document.body.appendChild(lb);

  const imgEl = lb.querySelector('img');
  const closeBtn = lb.querySelector('.lb-close');
  const prevBtn = lb.querySelector('.lb-prev');
  const nextBtn = lb.querySelector('.lb-next');

  let currentList = [], currentIndex = 0;
  function openWithList(list, idx) {
    currentList = list || []; currentIndex = Math.max(0, idx || 0);
    if (!currentList.length) return;
  imgEl.src = currentList[currentIndex];
  // Reset transforms when opening
  imgEl.style.transform = 'translate(0px, 0px) scale(1)';
  imgEl.style.cursor = 'grab';
    lb.classList.add('open');
    document.body.classList.add('modal-open');
  }
  function close() { lb.classList.remove('open'); document.body.classList.remove('modal-open'); }
  function next() { if (!currentList.length) return; currentIndex = (currentIndex + 1) % currentList.length; imgEl.src = currentList[currentIndex]; }
  function prev() { if (!currentList.length) return; currentIndex = (currentIndex - 1 + currentList.length) % currentList.length; imgEl.src = currentList[currentIndex]; }

  function collectFrom(container) {
    const els = Array.from(container.querySelectorAll('a[href], img'));
    return els.map(el => el.getAttribute('href') || el.getAttribute('src')).filter(Boolean);
  }

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    // Gallery thumbnails
    const gal = t.closest('.gallery');
    if (gal && (t.matches('img') || t.matches('a'))) {
      e.preventDefault();
      const list = collectFrom(gal);
      const src = t.getAttribute('href') || t.getAttribute('src');
      return openWithList(list, list.indexOf(src));
    }
    // README images
    const readme = t.closest('.wiki .md');
    if (readme && t.matches('img')) {
      e.preventDefault();
      const list = Array.from(readme.querySelectorAll('img')).map(i => i.getAttribute('src')).filter(Boolean);
      return openWithList(list, list.indexOf(t.getAttribute('src')));
    }
  });

  // Controls
  closeBtn.addEventListener('click', close);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  // Reset transforms on close
  function resetTransform() {
    imgEl.style.transform = 'translate(0px, 0px) scale(1)';
    imgEl.dataset.scale = '1';
    imgEl.dataset.tx = '0';
    imgEl.dataset.ty = '0';
  }
  // Ensure reset when closing or switching images
  function setSrcAndReset(src) {
    imgEl.src = src;
    resetTransform();
  }
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  });
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  // Replace img src setter to reset transforms
  const _setImgSrc = (src) => setSrcAndReset(src);
  // Observe src changes via next/prev openWithList callers
  // Override next/prev to use setter that resets transforms
  const origNext = next; const origPrev = prev;
  function next() { if (!currentList.length) return; currentIndex = (currentIndex + 1) % currentList.length; _setImgSrc(currentList[currentIndex]); }
  function prev() { if (!currentList.length) return; currentIndex = (currentIndex - 1 + currentList.length) % currentList.length; _setImgSrc(currentList[currentIndex]); }

  // Zoom/Pan support (wheel, dblclick, drag; basic touch)
  imgEl.dataset.scale = '1'; imgEl.dataset.tx = '0'; imgEl.dataset.ty = '0';
  let isDragging = false; let dragStart = { x: 0, y: 0 };

  function applyTransform() {
    const s = parseFloat(imgEl.dataset.scale || '1');
    const tx = parseFloat(imgEl.dataset.tx || '0');
    const ty = parseFloat(imgEl.dataset.ty || '0');
    imgEl.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
  }

  imgEl.addEventListener('wheel', (ev) => {
    if (!lb.classList.contains('open')) return;
    ev.preventDefault();
    const delta = -ev.deltaY;
    const scale = parseFloat(imgEl.dataset.scale || '1');
    const factor = delta > 0 ? 1.08 : 0.92;
    const nextScale = Math.max(1, Math.min(5, scale * factor));
    imgEl.dataset.scale = String(nextScale);
    // when zooming, keep translate as-is (simple approach)
    applyTransform();
  }, { passive: false });

  imgEl.addEventListener('dblclick', () => {
    const scale = parseFloat(imgEl.dataset.scale || '1');
    if (scale > 1) imgEl.dataset.scale = '1'; else imgEl.dataset.scale = '2';
    applyTransform();
  });

  imgEl.addEventListener('mousedown', (e) => {
    if (parseFloat(imgEl.dataset.scale || '1') <= 1) return;
    isDragging = true; imgEl.style.cursor = 'grabbing';
    dragStart.x = e.clientX - parseFloat(imgEl.dataset.tx || '0');
    dragStart.y = e.clientY - parseFloat(imgEl.dataset.ty || '0');
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    imgEl.dataset.tx = String(e.clientX - dragStart.x);
    imgEl.dataset.ty = String(e.clientY - dragStart.y);
    applyTransform();
  });
  window.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; imgEl.style.cursor = 'grab'; } });

  // Touch: pinch/drag (basic)
  let touchState = { startDist: 0, startScale: 1, lastTouches: [] };
  imgEl.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchState.startDist = Math.hypot(dx, dy);
      touchState.startScale = parseFloat(imgEl.dataset.scale || '1');
    } else if (e.touches.length === 1 && parseFloat(imgEl.dataset.scale || '1') > 1) {
      touchState.lastTouches = [e.touches[0].clientX, e.touches[0].clientY];
    }
  }, { passive: false });
  imgEl.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / (touchState.startDist || dist || 1);
      const nextScale = Math.max(1, Math.min(5, touchState.startScale * ratio));
      imgEl.dataset.scale = String(nextScale);
      applyTransform();
    } else if (e.touches.length === 1 && parseFloat(imgEl.dataset.scale || '1') > 1) {
      e.preventDefault();
      const tx = parseFloat(imgEl.dataset.tx || '0');
      const ty = parseFloat(imgEl.dataset.ty || '0');
      const nx = e.touches[0].clientX - touchState.lastTouches[0];
      const ny = e.touches[0].clientY - touchState.lastTouches[1];
      imgEl.dataset.tx = String(tx + nx);
      imgEl.dataset.ty = String(ty + ny);
      touchState.lastTouches = [e.touches[0].clientX, e.touches[0].clientY];
      applyTransform();
    }
  }, { passive: false });

  // Reset on close
  const origClose = close;
  function close() { resetTransform(); origClose(); }
})();
