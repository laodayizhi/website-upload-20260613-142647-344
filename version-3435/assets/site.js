document.addEventListener('DOMContentLoaded', function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-main-nav]');
  if (menuButton && menu) {
    menuButton.addEventListener('click', function() {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    function showSlide(index) {
      current = index;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        showSlide(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
  var yearFilters = Array.prototype.slice.call(document.querySelectorAll('[data-year-filter]'));
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }
  function applyFilter() {
    var query = normalize(filterInputs.map(function(input) { return input.value; }).filter(Boolean).join(' '));
    var year = yearFilters.map(function(select) { return select.value; }).filter(Boolean)[0] || '';
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var visible = 0;
    cards.forEach(function(card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year')
      ].join(' '));
      var yearOk = !year || card.getAttribute('data-year') === year;
      var queryOk = !query || text.indexOf(query) !== -1;
      var ok = yearOk && queryOk;
      card.classList.toggle('is-filter-hidden', !ok);
      var row = card.closest('.ranking-row');
      if (row) {
        row.classList.toggle('is-filter-hidden', !ok);
      }
      if (ok) {
        visible += 1;
      }
    });
    document.querySelectorAll('[data-filter-status]').forEach(function(status) {
      status.textContent = visible ? '已显示匹配影片' : '没有找到匹配内容';
    });
  }
  filterInputs.forEach(function(input) {
    input.addEventListener('input', applyFilter);
  });
  yearFilters.forEach(function(select) {
    select.addEventListener('change', applyFilter);
  });
});
