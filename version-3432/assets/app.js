(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.site-nav');

    if (toggle && nav) {
      toggle.addEventListener('click', function() {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var current = 0;

      function show(index) {
        current = index % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle('active', i === current);
        });
      }

      dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
          show(Number(dot.getAttribute('data-slide')) || 0);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function() {
          show(current + 1);
        }, 5200);
      }
    }

    var lists = Array.prototype.slice.call(document.querySelectorAll('.searchable-list'));
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
    var yearFilters = Array.prototype.slice.call(document.querySelectorAll('.year-filter'));
    var chipButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var activeCategory = '';

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function applyFilters() {
      var query = normalize(searchInputs.map(function(input) {
        return input.value;
      }).join(' '));
      var year = normalize(yearFilters.map(function(select) {
        return select.value;
      }).join(' '));

      lists.forEach(function(list) {
        var items = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .wide-card'));
        items.forEach(function(item) {
          var text = normalize(item.getAttribute('data-search-text'));
          var itemYear = normalize(item.getAttribute('data-year'));
          var itemCategory = normalize(item.getAttribute('data-category'));
          var queryMatch = !query || text.indexOf(query) !== -1;
          var yearMatch = !year || itemYear === year || text.indexOf(year) !== -1;
          var categoryMatch = !activeCategory || itemCategory === activeCategory;
          item.classList.toggle('is-filtered-out', !(queryMatch && yearMatch && categoryMatch));
        });
      });
    }

    searchInputs.forEach(function(input) {
      input.addEventListener('input', applyFilters);
    });

    yearFilters.forEach(function(select) {
      select.addEventListener('change', applyFilters);
    });

    chipButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        activeCategory = normalize(button.getAttribute('data-category-filter'));
        chipButtons.forEach(function(item) {
          item.classList.toggle('active', item === button);
        });
        applyFilters();
      });
    });
  });
}());
