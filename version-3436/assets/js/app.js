(function () {
    "use strict";

    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var opened = mobileNav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function initCards() {
        var lists = Array.prototype.slice.call(document.querySelectorAll("[data-card-list]"));
        if (!lists.length) {
            return;
        }

        lists.forEach(function (list) {
            var root = list.closest("main") || document;
            var search = root.querySelector("[data-card-search]");
            var filters = Array.prototype.slice.call(root.querySelectorAll("[data-filter-value]"));
            var currentFilter = "all";

            function apply() {
                var query = normalize(search ? search.value : "");
                var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var category = card.getAttribute("data-category") || "";
                    var matchesSearch = !query || text.indexOf(query) !== -1;
                    var matchesFilter = currentFilter === "all" || category === currentFilter;
                    card.classList.toggle("card-hidden", !(matchesSearch && matchesFilter));
                });
            }

            if (search) {
                search.addEventListener("input", apply);
            }

            filters.forEach(function (button) {
                button.addEventListener("click", function () {
                    currentFilter = button.getAttribute("data-filter-value") || "all";
                    filters.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });
        });
    }

    function setupPlayer(videoId, streamUrl, coverId) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        if (!video || !streamUrl) {
            return;
        }
        var loading = false;
        var loaded = false;
        var hlsInstance = null;

        function playVideo() {
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        function loadAndPlay() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
            if (loaded || loading) {
                playVideo();
                return;
            }
            loading = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                loaded = true;
                loading = false;
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    loaded = true;
                    loading = false;
                    playVideo();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function () {
                    loading = false;
                });
                return;
            }
            video.src = streamUrl;
            loaded = true;
            loading = false;
            playVideo();
        }

        if (cover) {
            cover.addEventListener("click", loadAndPlay);
        }

        video.addEventListener("click", function () {
            if (!loaded) {
                loadAndPlay();
                return;
            }
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.MovieSite = {
        setupPlayer: setupPlayer
    };

    ready(function () {
        initMenu();
        initHero();
        initCards();
    });
})();
