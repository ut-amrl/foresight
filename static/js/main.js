// Copy-to-clipboard for the BibTeX block.
document.querySelectorAll('.copybtn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var target = document.getElementById(btn.dataset.target);
    if (!target) return;

    var text = target.innerText.trim();
    var done = function () {
      var original = btn.textContent;
      btn.textContent = 'Copied';
      btn.classList.add('done');
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove('done');
      }, 1600);
    };

    // The async clipboard API rejects on insecure origins and when the
    // document is not focused, so keep the execCommand path as a fallback.
    var fallback = function () {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        done();
      } finally {
        document.body.removeChild(ta);
      }
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  });
});

// Head-to-head comparison switcher: one player, swapped source per category.
var switcher = document.getElementById('qualSwitcher');
if (switcher) {
  var tabs = switcher.querySelectorAll('.qual-tab');
  var video = document.getElementById('qualVideo');
  var source = document.getElementById('qualVideoSource');
  var caption = document.getElementById('qualCaption');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      if (tab.classList.contains('is-active')) return;

      tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      source.src = tab.dataset.src;
      if (tab.dataset.poster) video.poster = tab.dataset.poster;
      if (caption && tab.dataset.caption) caption.textContent = tab.dataset.caption;
      video.load();
      video.play().catch(function () { });
    });
  });
}

// Videos autoplay muted only while on screen, so a page full of clips stays light.
var lazyVideos = document.querySelectorAll('video[data-autoplay]');
if (lazyVideos.length && 'IntersectionObserver' in window) {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.play().catch(function () { });
      else entry.target.pause();
    });
  }, { threshold: 0.25 });

  lazyVideos.forEach(function (v) { observer.observe(v); });
}
