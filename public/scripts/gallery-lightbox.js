const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let previousFocus = null;

const getActiveLightbox = () => document.querySelector('.gallery-lightbox[aria-hidden="false"]');
const getLightboxById = (id) => document.getElementById(id);

const loadLightboxImage = (lightbox) => {
  // Covers both the image lightbox and a video's poster — each is an img[data-src].
  const image = lightbox?.querySelector('img[data-src]');
  if (image && !image.src) {
    image.src = image.dataset.src;
  }
};

// Remove any injected YouTube iframe and revert to the poster + play badge. Removing the
// iframe is what actually stops playback and audio, so this runs whenever a video leaves
// the screen (close, or navigating to another item).
const stopLightboxVideos = () => {
  document.querySelectorAll('.gallery-lightbox-video.is-playing').forEach((wrap) => {
    const frame = wrap.querySelector('iframe');
    if (frame) frame.remove();
    wrap.classList.remove('is-playing');
  });
};

// Swap the poster facade for the real player, autoplaying. Nothing is requested from
// YouTube until this runs, so opening a video's lightbox stays a static poster.
const playLightboxVideo = (wrap) => {
  if (!wrap || wrap.classList.contains('is-playing')) return;
  const id = wrap.dataset.youtubeId;
  if (!id) return;
  const iframe = document.createElement('iframe');
  iframe.className = 'gallery-lightbox-iframe';
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  iframe.title = wrap.dataset.title || 'YouTube video player';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  wrap.appendChild(iframe);
  wrap.classList.add('is-playing');
};

const openLightbox = (lightbox) => {
  if (!lightbox) return;
  // Stop a video that may be playing in whichever lightbox we're leaving.
  stopLightboxVideos();
  previousFocus = document.activeElement;
  document.body.classList.add('gallery-lightbox-open');
  document.body.style.overflow = 'hidden';

  document.querySelectorAll('.gallery-lightbox').forEach((dialog) => {
    dialog.setAttribute('aria-hidden', dialog === lightbox ? 'false' : 'true');
    dialog.style.display = dialog === lightbox ? 'flex' : 'none';
  });

  loadLightboxImage(lightbox);
  const closeBtn = lightbox.querySelector('.gallery-lightbox-close');
  if (closeBtn instanceof HTMLElement) closeBtn.focus();
};

const closeLightbox = () => {
  stopLightboxVideos();
  document.body.classList.remove('gallery-lightbox-open');
  document.body.style.overflow = '';
  document.querySelectorAll('.gallery-lightbox').forEach((dialog) => {
    dialog.setAttribute('aria-hidden', 'true');
    dialog.style.display = 'none';
  });
  if (previousFocus instanceof HTMLElement) {
    previousFocus.focus();
  }
  history.replaceState(null, '', window.location.pathname + window.location.search);
};

const getFocusable = (container) => Array.from(container.querySelectorAll(focusableSelector)).filter((el) => !el.hasAttribute('disabled'));

const trapFocus = (event) => {
  const active = getActiveLightbox();
  if (!active) return;
  if (event.key !== 'Tab') return;
  const focusable = getFocusable(active);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  } else if (document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

const updateStateFromHash = () => {
  const id = window.location.hash.slice(1);
  const target = id ? getLightboxById(id) : null;
  if (target) {
    openLightbox(target);
  } else {
    closeLightbox();
  }
};

// Single source of truth for "navigate to this lightbox hash" —
// used by thumbnail clicks, prev/next clicks, and arrow keys alike.
// Keeping pushState + updateStateFromHash paired and synchronous is
// what prevents the flash: nothing falls through to the native,
// async hashchange-only path.
const navigateToHash = (targetId) => {
  if (!targetId) return;
  history.pushState(null, '', `#${targetId}`);
  updateStateFromHash();
};

const resolveHashTarget = (el) => {
  const href = el.getAttribute('href') || el.getAttribute('data-href');
  return href?.startsWith('#') ? href.slice(1) : href;
};

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.gallery-lightbox').forEach((dialog) => {
    dialog.style.display = 'none';
    dialog.setAttribute('aria-hidden', 'true');
    dialog.setAttribute('tabindex', '-1');
  });

  // Delegated click handler covers thumbnail links AND prev/next nav
  // buttons in one place — any current or future <a> that points at
  // a #gallery-lightbox-* hash is caught here, so this can't silently
  // regress to native (async) hash navigation again.
  document.addEventListener('click', (event) => {
    // A click anywhere on a video's poster/badge (before it's playing) starts playback.
    const playTarget = event.target.closest('.gallery-lightbox-video:not(.is-playing)');
    if (playTarget) {
      event.preventDefault();
      playLightboxVideo(playTarget);
      return;
    }

    const anchor = event.target.closest('a.gallery-thumb-link, a.gallery-lightbox-nav-button');
    if (!anchor) return;
    event.preventDefault();
    navigateToHash(resolveHashTarget(anchor));
  });

  // Backdrop click to close (clicks outside .gallery-lightbox-inner)
  document.querySelectorAll('.gallery-lightbox').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      const inner = dialog.querySelector('.gallery-lightbox-inner');
      if (!inner) return;
      if (!inner.contains(event.target)) {
        closeLightbox();
      }
    });
  });

  document.querySelectorAll('.gallery-lightbox-close').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      closeLightbox();
    });
  });

  document.addEventListener('keydown', (event) => {
    const active = getActiveLightbox();
    if (!active) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeLightbox();
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const sel = event.key === 'ArrowLeft' ? '.gallery-lightbox-prev' : '.gallery-lightbox-next';
      const nav = active.querySelector(sel);
      if (nav instanceof HTMLAnchorElement) {
        navigateToHash(resolveHashTarget(nav));
      }
      return;
    }
    trapFocus(event);
  });

  window.addEventListener('hashchange', updateStateFromHash);
  updateStateFromHash();
});