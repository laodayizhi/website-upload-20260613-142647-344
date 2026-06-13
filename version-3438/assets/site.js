function initMobileNav() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
        return;
    }
    button.addEventListener('click', function () {
        nav.classList.toggle('is-open');
    });
}

function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
        return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
        if (!slides.length) {
            return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            show(index + 1);
        }, 5000);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
        }
    }

    if (prev) {
        prev.addEventListener('click', function () {
            show(index - 1);
            start();
        });
    }
    if (next) {
        next.addEventListener('click', function () {
            show(index + 1);
            start();
        });
    }
    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            show(dotIndex);
            start();
        });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
}

function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
}

function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
        var root = panel.closest('section') || document;
        var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
        var search = panel.querySelector('[data-search]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');
        var region = panel.querySelector('[data-filter-region]');
        var empty = root.querySelector('[data-empty-state]');

        function apply() {
            var query = normalizeText(search && search.value);
            var selectedType = normalizeText(type && type.value);
            var selectedYear = normalizeText(year && year.value);
            var selectedRegion = normalizeText(region && region.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalizeText([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' '));
                var cardType = normalizeText(card.getAttribute('data-type'));
                var cardYear = normalizeText(card.getAttribute('data-year'));
                var cardRegion = normalizeText(card.getAttribute('data-region'));
                var matched = true;

                if (query && haystack.indexOf(query) === -1) {
                    matched = false;
                }
                if (selectedType && cardType !== selectedType) {
                    matched = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    matched = false;
                }
                if (selectedRegion && cardRegion !== selectedRegion) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [search, type, year, region].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    });
}

function setupPlayer(sourceUrl) {
    var video = document.getElementById('movieVideo');
    var trigger = document.querySelector('.player-trigger');
    var loaded = false;
    var hls = null;

    if (!video || !sourceUrl) {
        return;
    }

    function loadVideo() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                maxBufferLength: 30,
                enableWorker: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function playVideo() {
        loadVideo();
        if (trigger) {
            trigger.classList.add('is-hidden');
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    if (trigger) {
        trigger.addEventListener('click', playVideo);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });
    video.addEventListener('play', function () {
        if (trigger) {
            trigger.classList.add('is-hidden');
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHeroSlider();
    initFilters();
});
