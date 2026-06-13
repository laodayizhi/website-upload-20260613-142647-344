
(function () {
  const root = document.body;

  function qsa(sel, ctx = document) {
    return Array.from(ctx.querySelectorAll(sel));
  }

  // Mobile nav
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
    qsa('.site-nav a').forEach((a) => {
      a.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  // Search/filter cards on pages that have them.
  const form = document.querySelector('[data-filter-form]');
  if (form) {
    const input = form.querySelector('[data-search-input]');
    const year = form.querySelector('[data-year-filter]');
    const category = form.querySelector('[data-category-filter]');
    const reset = form.querySelector('[data-reset-filter]');
    const cards = qsa('.movie-card');
    const noResults = document.querySelector('[data-no-results]');

    const applyFilter = () => {
      const term = (input?.value || '').trim().toLowerCase();
      const yearVal = (year?.value || '').trim();
      const categoryVal = (category?.value || '').trim();
      let visible = 0;
      cards.forEach((card) => {
        const title = (card.dataset.title || '').toLowerCase();
        const tags = (card.dataset.tags || '').toLowerCase();
        const cat = card.dataset.category || '';
        const y = card.dataset.year || '';
        const matchTerm = !term || title.includes(term) || tags.includes(term);
        const matchYear = !yearVal || y === yearVal;
        const matchCategory = !categoryVal || cat === categoryVal;
        const show = matchTerm && matchYear && matchCategory;
        card.classList.toggle('hidden', !show);
        if (show) visible += 1;
      });
      if (noResults) noResults.classList.toggle('hidden', visible !== 0);
    };

    if (input) input.addEventListener('input', applyFilter);
    if (year) year.addEventListener('change', applyFilter);
    if (category) category.addEventListener('change', applyFilter);
    if (reset) reset.addEventListener('click', () => {
      if (input) input.value = '';
      if (year) year.value = '';
      if (category) category.value = '';
      applyFilter();
    });
    applyFilter();
  }

  // Detail page video button
  const playBtn = document.querySelector('[data-play-video]');
  const video = document.querySelector('video[data-preview-video]');
  if (playBtn && video) {
    playBtn.addEventListener('click', () => {
      video.play().catch(() => {});
      video.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
})();
