/* Shout In & Out – loading video overlay
   Used on the HOMEPAGE ONLY (index.html). Add in <head>:
     <link rel="stylesheet" href="loader.css">
     <script src="loader.js"></script>
   The video plays once, start to finish, when the site link is opened.
   It does NOT play when moving between pages, and does not replay when
   returning to the homepage from another page in the same visit.
*/
(function () {
  'use strict';

  var CONFIG = {
    maxWait: 14000,       // safety: always hide the overlay after this many ms
    startTimeout: 3000    // if the video has not started after this many ms, skip it
  };

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Play only once per visit (browser tab session) – i.e. when the link is opened
  try {
    if (sessionStorage.getItem('slSeen')) return;
    sessionStorage.setItem('slSeen', '1');
  } catch (e) {}

  var script = document.currentScript;
  var base = script && script.src ? script.src.replace(/[^\/]*$/, '') : '';

  var root = document.documentElement;
  var overlay = document.createElement('div');
  overlay.className = 'sl-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  var video = document.createElement('video');
  video.muted = true;
  video.defaultMuted = true;
  video.loop = false;
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
  video.preload = 'auto';
  video.poster = base + 'assets/loading-poster.jpg';
  video.src = base + 'assets/loading.mp4';
  overlay.appendChild(video);

  // Added to <html> so it shows before <body> exists (no flash of the page)
  root.appendChild(overlay);
  root.classList.add('sl-lock');

  var loaded = document.readyState === 'complete';
  var videoDone = false;
  var hidden = false;
  var started = false;
  var startTimer = null;

  function hide() {
    if (hidden) return;
    hidden = true;
    overlay.classList.add('sl-hide');
    root.classList.remove('sl-lock');
    setTimeout(function () { video.pause(); }, 600);
  }

  function tryHide() {
    if (loaded && videoDone) hide();
  }

  function finishVideo() {
    if (videoDone) return;
    videoDone = true;
    clearTimeout(startTimer);
    tryHide();
  }

  video.addEventListener('playing', function () { started = true; clearTimeout(startTimer); });
  video.addEventListener('ended', finishVideo);
  video.addEventListener('error', finishVideo);

  startTimer = setTimeout(function () { if (!started) finishVideo(); }, CONFIG.startTimeout);

  try {
    var p = video.play();
    if (p && p.catch) p.catch(finishVideo);
  } catch (e) { finishVideo(); }

  if (!loaded) {
    window.addEventListener('load', function () { loaded = true; tryHide(); });
  }
  setTimeout(hide, CONFIG.maxWait);

  // Back/forward cache restore: make sure the overlay is not left on screen
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) hide();
  });
})();
