
(function(){
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const $ = (sel, root=document) => root.querySelector(sel);

  function setupNav(){
    const toggle = document.querySelector('[data-nav-toggle]');
    const links = document.querySelector('[data-nav-links]');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    document.addEventListener('click', (e)=>{
      if (!links.contains(e.target) && !toggle.contains(e.target)) links.classList.remove('open');
    });
  }

  function setupHeroSlider(){
    const slides = $$('.feature-slide');
    if (!slides.length) return;
    const prev = $('[data-slide-prev]');
    const next = $('[data-slide-next]');
    const dots = $$('.feature-dot');
    let i = slides.findIndex(s => s.classList.contains('active'));
    if (i < 0) i = 0;
    function show(n){
      i = (n + slides.length) % slides.length;
      slides.forEach((s,idx)=>s.classList.toggle('active', idx===i));
      dots.forEach((d,idx)=>d.classList.toggle('active', idx===i));
      dots.forEach((d,idx)=>d.style.background = idx===i ? 'rgba(255,255,255,.96)' : 'rgba(255,255,255,.25)');
    }
    show(i);
    const timer = setInterval(()=>show(i+1), 6000);
    [prev,next].forEach(btn=>btn && btn.addEventListener('click', ()=>{
      clearInterval(timer);
      show(i + (btn===next ? 1 : -1));
    }));
    dots.forEach((d,idx)=>d.addEventListener('click', ()=>show(idx)));
  }

  function normalize(s){ return (s||'').toLowerCase(); }

  function setupFilters(){
    const inputs = $$('[data-filter-input]');
    const selects = $$('[data-filter-select]');
    const cards = $$('[data-filter-card]');
    if (!cards.length) return;
    function apply(){
      const kw = normalize(inputs.map(i=>i.value).join(' '));
      const cats = selects.map(s=>s.value).filter(Boolean);
      let shown = 0;
      cards.forEach(card => {
        const text = normalize(card.getAttribute('data-search') || card.textContent);
        const cat = card.getAttribute('data-category') || '';
        const ok = (!kw || text.includes(kw)) && (!cats.length || cats.includes(cat));
        card.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      const counter = document.querySelector('[data-result-count]');
      if (counter) counter.textContent = shown;
    }
    inputs.forEach(i=>i.addEventListener('input', apply));
    selects.forEach(s=>s.addEventListener('change', apply));
    apply();
  }

  function setupSearchPage(){
    const box = document.querySelector('[data-live-search]');
    if (!box) return;
    const results = document.querySelector('[data-live-results]');
    const stats = document.querySelector('[data-live-count]');
    const empty = document.querySelector('[data-live-empty]');
    let data = window.SITE_MOVIES || [];
    if (!data.length) return;
    function render(list){
      if (stats) stats.textContent = list.length;
      if (!results) return;
      if (!list.length){
        results.innerHTML = '';
        if (empty) empty.hidden = false;
        return;
      }
      if (empty) empty.hidden = true;
      results.innerHTML = list.slice(0, 120).map(m => `
        <a class="card" href="${m.url}">
          <div class="poster" style="--c1:${m.c1};--c2:${m.c2};--c3:${m.c3};" data-ch="${m.ch}">
            <div class="poster-meta"><strong>${m.title}</strong><span>${m.year} · ${m.region}</span></div>
          </div>
          <div class="card-body">
            <div class="meta-row"><span class="pill">${m.type}</span><span class="pill">${m.category}</span><span class="pill">评分 ${m.score}</span></div>
            <h3>${m.title}</h3>
            <p>${m.one_line}</p>
            <div class="link-row"><span class="readmore">查看详情</span><span class="badge">${m.tags.slice(0,2).join(' / ')}</span></div>
          </div>
        </a>`).join('');
    }
    function apply(){
      const q = normalize(box.value.trim());
      const list = !q ? data : data.filter(m => [m.title,m.region,m.type,m.year,m.category,m.tags.join(' '),m.summary,m.one_line,m.review].join(' ').toLowerCase().includes(q));
      render(list);
    }
    box.addEventListener('input', apply);
    apply();
  }

  function setupPlayer(){
    const player = document.querySelector('video[data-hls]');
    if (!player) return;
    const hlsSrc = player.getAttribute('data-hls');
    const mp4Src = player.getAttribute('data-mp4');
    function useMP4(){ if (mp4Src) player.src = mp4Src; }
    if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = hlsSrc;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      const hls = new Hls({enableWorker:true, lowLatencyMode:false});
      hls.loadSource(hlsSrc);
      hls.attachMedia(player);
      hls.on(Hls.Events.ERROR, function(evt, data){
        if (data && data.fatal) useMP4();
      });
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js';
    s.onload = function(){
      if (window.Hls && window.Hls.isSupported()){
        const hls = new Hls({enableWorker:true, lowLatencyMode:false});
        hls.loadSource(hlsSrc);
        hls.attachMedia(player);
        hls.on(Hls.Events.ERROR, function(evt, data){ if (data && data.fatal) useMP4(); });
      } else {
        useMP4();
      }
    };
    s.onerror = useMP4;
    document.head.appendChild(s);
    setTimeout(()=>{ if (!player.src) useMP4(); }, 1500);
  }

  function setupSticky(){
    const hdr = document.querySelector('.site-header');
    if (!hdr) return;
    window.addEventListener('scroll', ()=>{
      hdr.style.boxShadow = window.scrollY > 6 ? '0 12px 30px rgba(0,0,0,.28)' : 'none';
    }, {passive:true});
  }

  function init(){
    setupNav();
    setupHeroSlider();
    setupFilters();
    setupSearchPage();
    setupPlayer();
    setupSticky();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
