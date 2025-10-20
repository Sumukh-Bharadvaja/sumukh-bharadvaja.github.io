// Minimal project wiki loader
(function () {
  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

  // Footer year reuse
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  if (!slug) {
    qs('#w-title').textContent = 'Project Not Found';
    qs('#w-subtitle').textContent = 'Missing slug parameter.';
    return;
  }

  function loadProjects() {
    // Prefer preloaded data (works on file://)
    if (typeof window !== 'undefined' && window.PROJECTS && Array.isArray(window.PROJECTS.projects)) {
      return Promise.resolve(window.PROJECTS);
    }
    // Fetch when running under http(s)
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      return fetch('assets/data/projects.json').then(r => {
        if (!r.ok) throw new Error('Failed to load project data');
        return r.json();
      });
    }
    return Promise.reject(new Error('Local file mode: data not preloaded.'));
  }

  loadProjects()
    .then(data => {
      const proj = (data.projects || []).find(p => p.slug === slug);
      if (!proj) throw new Error('Unknown project slug');

      // Populate header
      qs('#w-title').textContent = proj.title;
      qs('#w-subtitle').textContent = proj.subtitle || '';
      const tagsWrap = qs('#w-tags');
      tagsWrap.innerHTML = '';
      (proj.tags || []).forEach(t => {
        const el = document.createElement('span');
        el.className = 'tag';
        el.textContent = t;
        tagsWrap.appendChild(el);
      });
      const live = qs('#w-live');
      const code = qs('#w-code');
      proj.live ? live.setAttribute('href', proj.live) : live.setAttribute('aria-disabled', 'true');
      proj.code ? code.setAttribute('href', proj.code) : code.setAttribute('aria-disabled', 'true');

      // Body (pre-sanitized HTML maintained in repo)
      const body = qs('#w-body');
      body.innerHTML = proj.bodyHtml || '<p class="muted">No content.</p>';

      // Build TOC from h2 elements
      const toc = qs('#w-toc');
      toc.innerHTML = '';
      qsa('#w-body h2').forEach((h, i) => {
        if (!h.id) h.id = 'sec-' + (i + 1);
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + h.id; a.textContent = h.textContent;
        li.appendChild(a); toc.appendChild(li);
      });
    })
    .catch(err => {
      qs('#w-title').textContent = 'Project Not Found';
      qs('#w-subtitle').textContent = err.message || 'Could not load project.';
    });
})();
