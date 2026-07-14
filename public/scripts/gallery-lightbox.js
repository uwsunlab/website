const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let previousFocus = null;

const getActiveLightbox = () => document.querySelector('.gallery-lightbox[aria-hidden="false"]');
const getLightboxById = (id) => document.getElementById(id);

const loadLightboxImage = (lightbox) => {
  const image = lightbox?.querySelector('img[data-src]');
  if (image && !image.src) {
    image.src = image.dataset.src;
  }
};

const openLightbox = (lightbox) => {
  if (!lightbox) return;
  previousFocus = document.activeElement;
  document.body.classList.add('gallery-lightbox-open');
  document.body.style.overflow = 'hidden';

  document.querySelectorAll('.gallery-lightbox').forEach((dialog) => {
    dialog.setAttribute('aria-hidden', dialog === lightbox ? 'false' : 'true');
    dialog.style.display = dialog === lightbox ? 'flex' : 'none';
  });

  loadLightboxImage(lightbox);
  // move focus to a sensible control inside the dialog
  const closeBtn = lightbox.querySelector('.gallery-lightbox-close');
  if (closeBtn instanceof HTMLElement) closeBtn.focus();
};

const closeLightbox = () => {
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

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.gallery-lightbox').forEach((dialog) => {
    dialog.style.display = 'none';
    dialog.setAttribute('aria-hidden', 'true');
    dialog.setAttribute('tabindex', '-1');
  });

  // Thumbnail anchors open the lightbox by pushing a hash state
  document.querySelectorAll('a.gallery-thumb-link').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      event.preventDefault();
      const href = anchor.getAttribute('href') || anchor.getAttribute('data-href');
      const targetId = href?.startsWith('#') ? href.slice(1) : href;
      if (targetId) {
        history.pushState(null, '', `#${targetId}`);
        updateStateFromHash();
      }
    });
  });

  // Backdrop click to close (clicks outside .gallery-lightbox-inner)
  document.querySelectorAll('.gallery-lightbox').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      const inner = dialog.querySelector('.gallery-lightbox-inner');
      if (!inner) return;
      if (!inner.contains(event.target)) {
        // clicked on backdrop
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
    // Arrow navigation
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const sel = event.key === 'ArrowLeft' ? '.gallery-lightbox-prev' : '.gallery-lightbox-next';
      const nav = active.querySelector(sel);
      if (nav instanceof HTMLAnchorElement) {
        const href = nav.getAttribute('href') || nav.getAttribute('data-href');
        const targetId = href?.startsWith('#') ? href.slice(1) : href;
        if (targetId) {
          history.pushState(null, '', `#${targetId}`);
          updateStateFromHash();
        }
      }
      return;
    }
    trapFocus(event);
  });

  window.addEventListener('hashchange', updateStateFromHash);
  updateStateFromHash();
});
