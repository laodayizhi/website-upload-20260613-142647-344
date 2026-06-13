(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
    });
  });

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
  });

  function textOf(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-genre') || '',
      card.getAttribute('data-tags') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  document.querySelectorAll('.content-section').forEach(function (section) {
    var input = section.querySelector('[data-filter-input]');
    var year = section.querySelector('[data-year-filter]');
    var type = section.querySelector('[data-type-filter]');
    var empty = section.querySelector('[data-filter-empty]');
    var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));

    if (!cards.length || (!input && !year && !type)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && input) {
      input.value = initialQuery;
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matchesQuery = !query || textOf(card).indexOf(query) !== -1;
        var matchesYear = !selectedYear || (card.getAttribute('data-year') || '').indexOf(selectedYear) !== -1;
        var matchesType = !selectedType || (card.getAttribute('data-type') || '').indexOf(selectedType) !== -1;
        var show = matchesQuery && matchesYear && matchesType;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (year) {
      year.addEventListener('change', applyFilter);
    }
    if (type) {
      type.addEventListener('change', applyFilter);
    }

    applyFilter();
  });

  window.createMoviePlayer = function (source) {
    var shell = document.querySelector('[data-player-shell]');
    if (!shell) {
      return;
    }

    var video = shell.querySelector('[data-video]');
    var cover = shell.querySelector('[data-player-cover]');
    var ready = false;

    function attachSource() {
      if (!video || ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        shell._hls = hls;
      } else {
        video.src = source;
      }

      ready = true;
    }

    function play() {
      attachSource();
      if (!video) {
        return;
      }
      video.controls = true;
      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
    }
  };
}());
