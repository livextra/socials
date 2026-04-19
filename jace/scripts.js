(function initLivextraSite() {
  var tracks = [
    {
      id: "0y-Sa2kdlL4",
      title: "Jace Davey - ON MY MIND",
      artist: "Jace Davey",
      thumbnail: "https://i.ytimg.com/vi/0y-Sa2kdlL4/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=0y-Sa2kdlL4"
    },
    {
      id: "CEVk6cj4Wuk",
      title: "Jace Davey - AURAMAXXING",
      artist: "Jace Davey",
      thumbnail: "https://i.ytimg.com/vi/CEVk6cj4Wuk/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=CEVk6cj4Wuk"
    },
    {
      id: "cpQhU43mFzE",
      title: "Jace Davey - ACAI ANTHEM",
      artist: "Jace Davey",
      thumbnail: "https://i.ytimg.com/vi/cpQhU43mFzE/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=cpQhU43mFzE"
    },
    {
      id: "1VWs0vHmXvs",
      title: "Jace Davey - DIVIDENDS",
      artist: "Jace Davey",
      thumbnail: "https://i.ytimg.com/vi/1VWs0vHmXvs/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=1VWs0vHmXvs"
    },
    {
      id: "BXqvX-t6tuQ",
      title: "Jace Davey - NOFAVORS",
      artist: "Jace Davey",
      thumbnail: "https://i.ytimg.com/vi/BXqvX-t6tuQ/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=BXqvX-t6tuQ"
    }
  ];

  var state = {
    player: null,
    currentIndex: 0,
    ready: false,
    isPlaying: false,
    progressTimer: null
  };

  var intro = document.getElementById("site-intro");
  var introTitle = document.getElementById("intro-title");
  var introSubtitle = document.getElementById("intro-subtitle");
  var body = document.body;
  var logoAssets = Array.prototype.slice.call(document.querySelectorAll(".hero-logo-asset"));
  var heroVideo = document.querySelector(".hero-video");

  var playerArt = document.getElementById("player-art");
  var playerTitle = document.getElementById("player-title");
  var playerArtist = document.getElementById("player-artist");
  var playerWatchLink = document.getElementById("player-watch-link");
  var miniPlayerArt = document.getElementById("mini-player-art");
  var miniPlayerTitle = document.getElementById("mini-player-title");
  var miniWatchLink = document.getElementById("mini-watch-link");
  var toggleButton = document.getElementById("player-toggle");
  var prevButton = document.getElementById("player-prev");
  var nextButton = document.getElementById("player-next");
  var progressFill = document.getElementById("audio-progress-fill");
  var currentTimeEl = document.getElementById("current-time");
  var durationTimeEl = document.getElementById("duration-time");
  var trackButtons = Array.prototype.slice.call(document.querySelectorAll("[data-track-index]"));

  function formatTime(value) {
    if (!isFinite(value) || value < 0) return "0:00";
    var minutes = Math.floor(value / 60);
    var seconds = Math.floor(value % 60);
    return minutes + ":" + String(seconds).padStart(2, "0");
  }

  function updateTrackUi(index) {
    var track = tracks[index];
    if (!track) return;

    state.currentIndex = index;
    if (playerArt) playerArt.src = track.thumbnail;
    if (miniPlayerArt) miniPlayerArt.src = track.thumbnail;
    if (playerTitle) playerTitle.textContent = track.title;
    if (miniPlayerTitle) miniPlayerTitle.textContent = track.title;
    if (playerArtist) playerArtist.textContent = track.artist;
    if (playerWatchLink) playerWatchLink.href = track.url;
    if (miniWatchLink) miniWatchLink.href = track.url;

    trackButtons.forEach(function (button) {
      button.classList.toggle("active", Number(button.getAttribute("data-track-index")) === index);
    });
  }

  function setPlayingUi(isPlaying) {
    state.isPlaying = isPlaying;
    if (toggleButton) {
      toggleButton.setAttribute("aria-label", isPlaying ? "Pause track" : "Play track");
      toggleButton.innerHTML = isPlaying
        ? '<svg fill="currentColor" height="40" viewBox="0 0 32 32" width="40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M 10 6 L 10 26 L 12 26 L 12 6 Z M 20 6 L 20 26 L 22 26 L 22 6 Z"></path></svg><span class="sr-only">Pause track</span>'
        : '<svg fill="currentColor" height="40" viewBox="0 0 32 32" width="40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M 9 5.15625 L 9 26.84375 L 10.53125 25.84375 L 25.84375 16 L 10.53125 6.15625 Z M 11 8.8125 L 22.15625 16 L 11 23.1875 Z"></path></svg><span class="sr-only">Play track</span>';
    }
    body.classList.toggle("audio-playing", isPlaying);
  }

  function updateProgress() {
    if (!state.player || !state.ready) return;
    var duration = 0;
    var current = 0;

    try {
      duration = state.player.getDuration() || 0;
      current = state.player.getCurrentTime() || 0;
    } catch (err) {
      return;
    }

    var ratio = duration > 0 ? Math.min(1, current / duration) : 0;
    if (progressFill) progressFill.style.width = ratio * 100 + "%";
    if (currentTimeEl) currentTimeEl.textContent = formatTime(current);
    if (durationTimeEl) durationTimeEl.textContent = formatTime(duration);
  }

  function beginProgressLoop() {
    if (state.progressTimer) {
      window.clearInterval(state.progressTimer);
    }
    state.progressTimer = window.setInterval(updateProgress, 500);
  }

  function loadTrack(index, autoplay) {
    var track = tracks[index];
    if (!track || !state.player || !state.ready) return;

    updateTrackUi(index);
    if (progressFill) progressFill.style.width = "0%";
    if (currentTimeEl) currentTimeEl.textContent = "0:00";

    if (autoplay) {
      state.player.loadVideoById(track.id);
    } else {
      state.player.cueVideoById(track.id);
      setPlayingUi(false);
    }
  }

  function playCurrent() {
    if (!state.player || !state.ready) return;
    state.player.playVideo();
  }

  function pauseCurrent() {
    if (!state.player || !state.ready) return;
    state.player.pauseVideo();
  }

  function nextTrack() {
    loadTrack((state.currentIndex + 1) % tracks.length, true);
  }

  function prevTrack() {
    loadTrack((state.currentIndex - 1 + tracks.length) % tracks.length, true);
  }

  function closeIntro() {
    if (!intro || intro.classList.contains("is-exit")) return;
    intro.classList.add("is-closing");
    window.setTimeout(function () {
      intro.classList.add("is-exit");
      body.classList.remove("intro-active");
      if (intro.parentNode) {
        intro.parentNode.removeChild(intro);
      }
    }, 850);
  }

  function initIntro() {
    if (!intro) return;
    var introFrames = [
      { title: "TONIGHT", subtitle: "House lights down. Visuals up." },
      { title: "NO SLEEP", subtitle: "Late-night creator energy loading." },
      { title: "LIVEXTRA", subtitle: "Enter the world." }
    ];
    var frameIndex = 0;
    var introTimer = null;
    if (introTitle && introSubtitle) {
      introTimer = window.setInterval(function () {
        frameIndex = (frameIndex + 1) % introFrames.length;
        introTitle.textContent = introFrames[frameIndex].title;
        introSubtitle.textContent = introFrames[frameIndex].subtitle;
      }, 420);
    }
    window.setTimeout(function () {
      if (introTimer) {
        window.clearInterval(introTimer);
      }
    }, 2200);
    window.setTimeout(closeIntro, 2200);
    intro.addEventListener("click", closeIntro);
  }

  function initReveal() {
    var sections = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!sections.length) return;

    var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      sections.forEach(function (section) {
        section.classList.add("visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function initHeroFallbacks() {
    logoAssets.forEach(function (logoAsset) {
      logoAsset.addEventListener("error", function () {
        logoAsset.hidden = true;
      });
    });

    if (heroVideo) {
      heroVideo.addEventListener("error", function () {
        body.classList.add("hero-video-missing");
      });
    }
  }

  function initFooterYear() {
    var footer = document.querySelector("#footer p");
    if (!footer) return;
    footer.textContent = "LIVEXTRA • " + new Date().getFullYear();
  }

  function initAnchorScroll() {
    var anchorLinks = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));
    anchorLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;
        var target = document.querySelector(targetId);
        if (!target) return;
        event.preventDefault();
        var targetTop = targetId === "#top"
          ? 0
          : Math.max(0, target.getBoundingClientRect().top + window.scrollY - 88);
        window.scrollTo({ top: targetTop, behavior: "smooth" });
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", targetId);
        }
      }, true);
    });
  }

  function initTrackClicks() {
    if (!trackButtons.length) return;
    trackButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        loadTrack(Number(button.getAttribute("data-track-index")), true);
      });
    });
  }

  function initControls() {
    if (!prevButton || !nextButton || !toggleButton) return;
    prevButton.addEventListener("click", prevTrack);
    nextButton.addEventListener("click", nextTrack);
    toggleButton.addEventListener("click", function () {
      if (!state.ready) return;
      if (state.isPlaying) {
        pauseCurrent();
      } else {
        playCurrent();
      }
    });
  }

  function initYouTubePlayer() {
    updateTrackUi(0);
    beginProgressLoop();

    var script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);

    window.onYouTubeIframeAPIReady = function () {
      state.player = new window.YT.Player("youtube-audio-host", {
        height: "0",
        width: "0",
        videoId: tracks[0].id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0
        },
        events: {
          onReady: function () {
            state.ready = true;
            updateTrackUi(state.currentIndex);
            updateProgress();
          },
          onStateChange: function (event) {
            if (!window.YT || !window.YT.PlayerState) return;
            if (event.data === window.YT.PlayerState.PLAYING) {
              setPlayingUi(true);
            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.CUED) {
              setPlayingUi(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              nextTrack();
            }
            updateProgress();
          }
        }
      });
    };
  }

  initIntro();
  initReveal();
  initHeroFallbacks();
  initFooterYear();
  initAnchorScroll();
  initTrackClicks();
  initControls();
  initYouTubePlayer();
})();

