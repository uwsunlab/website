// Shared-shell gallery lightbox.
//
// Instead of one overlay per gallery item, there is a single lightbox shell that the script
// fills from a JSON data island. Opening or paging populates the shell's stage (image/video)
// and meta, so the frame stays mounted and only its contents change. Paging crossfades the
// image between two stacked layers while the stage's height animates (FLIP) from the old
// image's height to the new one's — that is what lets the panel glide between images of
// different aspect ratios rather than snapping. The backdrop, nav and close never move.

const HASH_PREFIX = '#gallery-lightbox-';
const PAGE_MS = 280;
const PAGE_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let items = [];
const idToIndex = new Map();
let currentIndex = -1;
let previousFocus = null;
// Bumped on every paginate; a decode callback checks it so a superseded transition bails.
let pageToken = 0;

let lightbox, inner, stage, meta, closeBtn, prevBtn, nextBtn;

const isOpen = () => lightbox.classList.contains('is-open');
const wrapIndex = (i) => (i + items.length) % items.length;

// --- Building the shell's contents ---------------------------------------------------------

function buildLayer(item) {
  if (item.isVideo) {
    const box = document.createElement('div');
    box.className = 'gallery-lightbox-layer gallery-lightbox-video';
    box.dataset.youtubeId = item.videoId;
    box.dataset.title = item.title;

    const img = document.createElement('img');
    img.src = item.posterSrc;
    img.alt = item.alt;
    if (item.posterFallback) {
      img.addEventListener(
        'error',
        function onErr() {
          img.removeEventListener('error', onErr);
          img.src = item.posterFallback;
        },
        { once: true }
      );
    }

    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'gallery-play-badge';
    play.setAttribute('aria-label', `Play ${item.title}`);

    box.append(img, play);
    return box;
  }

  const img = document.createElement('img');
  img.className = 'gallery-lightbox-layer';
  img.src = item.src;
  img.alt = item.alt;
  return img;
}

function renderMeta(item) {
  meta.replaceChildren();
  if (item.meta) {
    const p = document.createElement('p');
    p.className = 'meta';
    p.textContent = item.meta;
    meta.appendChild(p);
  }
  const h2 = document.createElement('h2');
  h2.textContent = item.title;
  meta.appendChild(h2);
  const caption = document.createElement('p');
  caption.textContent = item.caption;
  meta.appendChild(caption);
}

// Stage height for an item: the image column's width divided by the item's aspect ratio,
// capped by the stage's CSS max-height so tall portraits/videos never overflow the panel.
function stageHeightFor(item) {
  const width = stage.clientWidth;
  const capRaw = parseFloat(getComputedStyle(stage).maxHeight);
  const cap = Number.isFinite(capRaw) ? capRaw : window.innerHeight - 220;
  if (!width) return cap;
  return Math.min(width / item.ar, cap);
}

// --- Video facade --------------------------------------------------------------------------

function stopVideo() {
  const playing = stage.querySelector('.gallery-lightbox-video.is-playing');
  if (!playing) return;
  const frame = playing.querySelector('iframe');
  if (frame) frame.remove();
  playing.classList.remove('is-playing');
}

function playVideo(box) {
  if (!box || box.classList.contains('is-playing')) return;
  const id = box.dataset.youtubeId;
  if (!id) return;
  const iframe = document.createElement('iframe');
  iframe.className = 'gallery-lightbox-iframe';
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  iframe.title = box.dataset.title || 'YouTube video player';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  box.appendChild(iframe);
  box.classList.add('is-playing');
}

// --- Open / close / paginate ---------------------------------------------------------------

function updateAria(item) {
  lightbox.setAttribute('aria-label', `${item.title} — gallery viewer`);
}

function open(index) {
  const item = items[index];
  if (!item) return;
  if (!isOpen()) previousFocus = document.activeElement;
  currentIndex = index;

  stage.replaceChildren(buildLayer(item));
  renderMeta(item);
  meta.style.opacity = '';

  document.body.classList.add('gallery-lightbox-open');
  document.body.style.overflow = 'hidden';
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  updateAria(item);

  // Measure + set synchronously now that the shell is display:flex, so the first painted
  // frame already has the right stage height (the inner's fade/zoom plays on top).
  stage.style.height = `${stageHeightFor(item)}px`;

  if (closeBtn instanceof HTMLElement) closeBtn.focus();
}

function close() {
  stopVideo();
  document.body.classList.remove('gallery-lightbox-open');
  document.body.style.overflow = '';
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  currentIndex = -1;
  if (window.location.hash.startsWith(HASH_PREFIX)) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  if (previousFocus instanceof HTMLElement) previousFocus.focus();
}

function goTo(index) {
  index = wrapIndex(index);
  if (!isOpen() || index === currentIndex) return;
  const item = items[index];
  stopVideo();
  const token = ++pageToken;

  // Start from a clean state: cancel any in-flight paging and keep only the visible layer,
  // so rapid arrow-presses can't pile up overlapping animations/layers.
  stage.getAnimations().forEach((a) => a.cancel());
  meta.getAnimations().forEach((a) => a.cancel());
  meta.style.opacity = '';
  const layers = [...stage.querySelectorAll('.gallery-lightbox-layer')];
  layers.slice(0, -1).forEach((l) => l.remove());
  const outLayer = stage.querySelector('.gallery-lightbox-layer');
  if (outLayer) outLayer.style.opacity = '';

  const fromH = stage.getBoundingClientRect().height;

  currentIndex = index;
  updateAria(item);
  syncHash(item);

  const inLayer = buildLayer(item);
  inLayer.style.opacity = '0';
  stage.appendChild(inLayer);
  const toH = stageHeightFor(item);

  // Run the fades only once the incoming image has decoded, and swap the meta at the same
  // moment, so the image and text fade in together. Without this the image lags by its decode
  // time (its opacity rises before its pixels exist) while the DOM text appears instantly.
  const run = () => {
    if (token !== pageToken) return; // a newer paginate superseded this one

    renderMeta(item);

    if (reduceMotion.matches) {
      if (outLayer) outLayer.remove();
      inLayer.style.opacity = '';
      stage.style.height = `${toH}px`;
      meta.style.opacity = '';
      return;
    }

    const opts = { duration: PAGE_MS, easing: PAGE_EASE, fill: 'both' };

    stage.style.height = `${fromH}px`;
    stage
      .animate([{ height: `${fromH}px` }, { height: `${toH}px` }], opts)
      .finished.then(() => {
        stage.style.height = `${toH}px`;
      })
      .catch(() => {
        stage.style.height = `${toH}px`;
      });

    inLayer
      .animate([{ opacity: 0 }, { opacity: 1 }], opts)
      .finished.then(() => {
        inLayer.style.opacity = '';
      })
      .catch(() => {
        inLayer.style.opacity = '';
      });

    if (outLayer) {
      outLayer
        .animate([{ opacity: 1 }, { opacity: 0 }], opts)
        .finished.then(() => outLayer.remove())
        .catch(() => outLayer.remove());
    }

    meta.style.opacity = '0';
    meta
      .animate([{ opacity: 0 }, { opacity: 1 }], opts)
      .finished.then(() => {
        meta.style.opacity = '';
      })
      .catch(() => {
        meta.style.opacity = '';
      });
  };

  // Only pure image layers are decoded; a video layer's poster fades in with its own load.
  const img = inLayer.tagName === 'IMG' ? inLayer : null;
  if (img && typeof img.decode === 'function') {
    img.decode().then(run).catch(run);
  } else {
    run();
  }
}

// --- Hash / history ------------------------------------------------------------------------

function syncHash(item) {
  history.replaceState(null, '', HASH_PREFIX + item.id);
}

function indexFromHash() {
  const hash = window.location.hash;
  if (!hash.startsWith(HASH_PREFIX)) return -1;
  const id = hash.slice(HASH_PREFIX.length);
  const index = idToIndex.get(id);
  return index === undefined ? -1 : index;
}

function updateFromHash() {
  const index = indexFromHash();
  if (index === -1) {
    if (isOpen()) close();
    return;
  }
  if (!isOpen()) open(index);
  else if (index !== currentIndex) goTo(index);
}

// --- Focus trap ----------------------------------------------------------------------------

function trapFocus(event) {
  if (event.key !== 'Tab') return;
  const focusable = [...lightbox.querySelectorAll(FOCUSABLE)].filter((el) => !el.hasAttribute('disabled'));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

// --- Wiring --------------------------------------------------------------------------------

function init() {
  lightbox = document.getElementById('gallery-lightbox');
  const dataEl = document.getElementById('gallery-lightbox-data');
  if (!lightbox || !dataEl) return;

  try {
    items = JSON.parse(dataEl.textContent || '[]');
  } catch {
    items = [];
  }
  if (!items.length) return;
  items.forEach((item, i) => idToIndex.set(item.id, i));

  inner = lightbox.querySelector('.gallery-lightbox-inner');
  stage = lightbox.querySelector('.gallery-lightbox-stage');
  meta = lightbox.querySelector('.gallery-lightbox-meta');
  closeBtn = lightbox.querySelector('.gallery-lightbox-close');
  prevBtn = lightbox.querySelector('.gallery-lightbox-prev');
  nextBtn = lightbox.querySelector('.gallery-lightbox-next');
  if (!inner || !stage || !meta) return;

  lightbox.setAttribute('aria-hidden', 'true');

  // A thumbnail opens the shell; the play badge/poster starts the video.
  document.addEventListener('click', (event) => {
    const playTarget = event.target.closest('.gallery-lightbox-video:not(.is-playing)');
    if (playTarget && stage.contains(playTarget)) {
      event.preventDefault();
      playVideo(playTarget);
      return;
    }

    const thumb = event.target.closest('a.gallery-thumb-link');
    if (!thumb) return;
    event.preventDefault();
    const id = (thumb.getAttribute('href') || '').slice(HASH_PREFIX.length);
    const index = idToIndex.get(id);
    if (index === undefined) return;
    history.pushState(null, '', HASH_PREFIX + id);
    open(index);
  });

  closeBtn?.addEventListener('click', close);
  prevBtn?.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn?.addEventListener('click', () => goTo(currentIndex + 1));

  // Click on the empty area around the panel (the overlay itself) closes.
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) close();
  });

  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(currentIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(currentIndex + 1);
    } else if (event.key === 'Tab') {
      trapFocus(event);
    }
  });

  // Keep the stage height correct if the viewport resizes while open.
  window.addEventListener('resize', () => {
    if (!isOpen() || currentIndex < 0) return;
    stage.getAnimations().forEach((a) => a.cancel());
    stage.style.height = `${stageHeightFor(items[currentIndex])}px`;
  });

  // Back/forward through the deep-link hash.
  window.addEventListener('popstate', updateFromHash);

  // Open directly if the page loaded on a lightbox hash.
  updateFromHash();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
