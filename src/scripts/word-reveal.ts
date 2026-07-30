/**
 * Word-by-word reveal shared by the people-page bios and the papers-page archive.
 * The timings live here so both stay in step; callers own the container mechanics,
 * since a line-clamped bio and a hidden list expand differently.
 */

// Total budget shared across all revealed words, so long and short passages
// feel similar; MAX_STAGGER keeps short ones from feeling slow.
// Close mirrors open rather than running faster, so the two directions take
// the same time; the easings stay mirrored (ease-out in, ease-in out).
export const OPEN_BUDGET = 340;
export const CLOSE_BUDGET = 340;
export const MAX_STAGGER = 25;
export const WORD_IN = 50;
export const WORD_OUT = 50;
export const BLUR = 0;

// Height slide durations — the container grows/shrinks over these so surrounding
// content reflows smoothly instead of snapping.
export const HEIGHT_OPEN = 340;
export const HEIGHT_CLOSE = 340;

// Strong ease-out (easeOutQuart) for both slides so each decelerates into place instead of
// ending abruptly — the plain 'ease-out' barely slows near the end, which is most obvious on
// long passages where the slide covers more distance in the same time.
export const EASE_SLIDE = 'cubic-bezier(0.165, 0.84, 0.44, 1)';

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Wraps each word in a span so it can be animated individually. Uses a TreeWalker
 * over text nodes so inline markup (links, emphasis) survives.
 */
export function wrapWords(root: HTMLElement) {
  if (root.dataset.wrapped) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Node[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const text = node.textContent;
    if (!text || !text.trim() || !node.parentNode) return;
    const frag = document.createDocumentFragment();
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else {
        const span = document.createElement('span');
        span.className = 'reveal-word';
        span.textContent = part;
        frag.appendChild(span);
      }
    });
    node.parentNode.replaceChild(frag, node);
  });
  root.dataset.wrapped = 'true';
}

/**
 * Slides a container between two explicit pixel heights. Because height is a layout
 * property, everything below reflows each frame and glides rather than jumping.
 */
export function animateHeight(
  el: HTMLElement,
  fromH: number,
  toH: number,
  duration: number,
  easing: string,
  done: () => void
) {
  el.animate([{ height: `${fromH}px` }, { height: `${toH}px` }], {
    duration,
    easing,
    fill: 'both'
  })
    .finished.then(done)
    .catch(() => {});
}

export function resetWords(words: HTMLElement[]) {
  words.forEach((w) => {
    w.getAnimations().forEach((a) => a.cancel());
    w.style.opacity = '';
    w.style.filter = '';
  });
}

export function animateIn(words: HTMLElement[]) {
  const stagger = Math.min(MAX_STAGGER, OPEN_BUDGET / words.length);
  words.forEach((w) => (w.style.opacity = '0'));
  words.forEach((w, i) => {
    w.animate(
      [
        { opacity: 0, filter: `blur(${BLUR}px)` },
        { opacity: 1, filter: 'blur(0)' }
      ],
      { duration: WORD_IN, delay: i * stagger, easing: 'ease-out', fill: 'both' }
    )
      .finished.then(() => {
        w.style.opacity = '';
        w.style.filter = '';
      })
      .catch(() => {});
  });
}

export function animateOut(words: HTMLElement[], done: () => void) {
  const n = words.length;
  if (n === 0) {
    done();
    return;
  }
  const stagger = Math.min(MAX_STAGGER, CLOSE_BUDGET / n);
  let pending = n;
  const finish = () => {
    if (--pending === 0) done();
  };
  words.forEach((w, i) => {
    w.getAnimations().forEach((a) => a.cancel());
    // Reverse order: the last word fades first, unwriting back to the first.
    w.animate(
      [
        { opacity: 1, filter: 'blur(0)' },
        { opacity: 0, filter: `blur(${BLUR}px)` }
      ],
      { duration: WORD_OUT, delay: (n - 1 - i) * stagger, easing: 'ease-in', fill: 'both' }
    ).finished.then(finish).catch(finish);
  });
}
