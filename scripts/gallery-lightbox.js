const portal = document.createElement('div');
portal.id = 'gallery-lightbox-portal';
portal.style.position = 'fixed';
portal.style.inset = '0';
portal.style.zIndex = '10000';
portal.style.pointerEvents = 'none';

const focusableSelector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';

const getLightbox = (id) => document.getElementById(id);
const getActiveLightbox = () => getLightbox(window.location.hash.slice(1));
const isLightboxOpen = () => !!getActiveLightbox();

const activateLightbox = (lightbox) => {
  document.body.classList.add('gallery-lightbox-open');
  portal.appendChild(lightbox);
  lightbox.style.pointerEvents = 'auto';
  lightbox.focus();
};

const deactivateLightbox = () => {
  const active = document.querySelector('.gallery-lightbox[style*="pointer-events: auto"]');
  if (!active) return;
  active.style.pointerEvents = 'none';
  document.body.classList.remove('gallery-lightbox-open');
  window.location.hash = '';
};

const updateLightboxVisibility = () => {
  const active = getActiveLightbox();
  document.querySelectorAll('.gallery-lightbox').forEach((dialog) => {
    if (dialog === active) {
      dialog.style.display = 'flex';
      dialog.setAttribute('aria-hidden', 'false');
      dialog.querySelector('.gallery-lightbox-close')?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      dialog.style.display = 'none';
      dialog.setAttribute('aria-hidden', 'true');
    }
  });
  if (!active) {
    document.body.style.overflow = '';
  }
};

const trapFocus = (event) => {
  const active = getActiveLightbox();
  if (!active) return;
  const focusable = Array.from(active.querySelectorAll(focusableSelector));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.key === 'Tab') {
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
};

window.addEventListener('hashchange', () => {
  updateLightboxVisibility();
});

window.addEventListener('keydown', (event) => {
  const active = getActiveLightbox();
  if (!active) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    window.location.hash = '';
    return;
  }
  trapFocus(event);
});

window.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(portal);
  updateLightboxVisibility();

  document.querySelectorAll('.gallery-lightbox-close').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.hash = '';
    });
  });

  document.querySelectorAll('.gallery-lightbox img').forEach((img) => {
    img.loading = 'lazy';
  });
});
