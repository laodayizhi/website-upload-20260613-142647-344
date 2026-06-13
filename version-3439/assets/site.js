(function () {
  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var navButton = one('.nav-toggle');
  var nav = one('.site-nav');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var slider = one('[data-hero-slider]');

  if (slider) {
    var slides = all('.hero-slide', slider);
    var dots = all('.hero-dot', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === index);
      });

      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    var next = one('[data-hero-next]', slider);
    var prev = one('[data-hero-prev]', slider);

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  var grid = one('[data-filter-grid]');

  if (grid) {
    var cards = all('[data-title]', grid);
    var input = one('#pageSearch');
    var region = one('#regionFilter');
    var type = one('#typeFilter');
    var year = one('#yearFilter');
    var clear = one('#clearFilters');
    var empty = one('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function lower(value) {
      return (value || '').toString().toLowerCase();
    }

    function apply() {
      var keyword = lower(input ? input.value.trim() : '');
      var selectedRegion = region ? region.value : '';
      var selectedType = type ? type.value : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = lower([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));

        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
        var matchType = !selectedType || card.getAttribute('data-type') === selectedType;
        var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var isVisible = matchKeyword && matchRegion && matchType && matchYear;

        card.style.display = isVisible ? '' : 'none';

        if (isVisible) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [input, region, type, year].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });

    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }

        if (region) {
          region.value = '';
        }

        if (type) {
          type.value = '';
        }

        if (year) {
          year.value = '';
        }

        apply();
      });
    }

    apply();
  }

  var player = one('[data-player]');

  if (player) {
    var video = one('video', player);
    var button = one('.play-layer', player);
    var attached = false;

    function attach() {
      if (!video || attached) {
        return;
      }

      var stream = video.getAttribute('data-stream');

      if (!stream) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      attach();
      player.classList.add('is-playing');

      var request = video.play();

      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
    }
  }
})();
