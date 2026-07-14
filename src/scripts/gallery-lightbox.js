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
    const isActive = dialog === lightbox;
    dialog.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    dialog.style.display = isActive ? 'flex' : 'none';
  });

  loadLightboxImage(lightbox);
  lightbox.focus();
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

const trapFocus = (event) => {
  const active = getActiveLightbox();
  if (!active || event.key !== 'Tab') return;

  const focusable = Array.from(active.querySelectorAll(focusableSelector)).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
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

  document.querySelectorAll('.gallery-thumb').forEach((thumb) => {
    thumb.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = thumb.getAttribute('href')?.slice(1);
      if (targetId) {
        history.pushState(null, '', `#${targetId}`);
        updateStateFromHash();
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
    trapFocus(event);
  });

  window.addEventListener('hashchange', updateStateFromHash);
  updateStateFromHash();
});
