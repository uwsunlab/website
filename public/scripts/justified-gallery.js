// /public/scripts/justified-gallery.js

function layoutJustifiedGallery(container, options = {}) {
  const {
    targetRowHeight = 360,
    gap = 4,
    maxRowHeightDeviation = 0.25, // how far the last row may stretch beyond target height
  } = options;

  const items = Array.from(container.children)
    .filter((el) => el.classList.contains('gallery-card'))
    .map((el) => ({
      el,
      ar: parseFloat(el.dataset.ar) || 1,
      full: el.dataset.full === 'true',
    }));

  const containerWidth = container.getBoundingClientRect().width;
  if (!containerWidth) return;

  let row = [];
  let rowAspectSum = 0;

  function commitRow(rowItems, isLastRow) {
    if (rowItems.length === 0) return;

    const sumAr = rowItems.reduce((sum, item) => sum + item.ar, 0);
    const totalGap = gap * (rowItems.length - 1);
    const availableWidth = containerWidth - totalGap;

    let rowHeight = availableWidth / sumAr;
    let fillsFullWidth = true;

    // Don't force a sparse last row (e.g. one portrait photo) to stretch
    // full-width and become enormous — cap it near the target height instead.
    if (isLastRow) {
      const deviation = Math.abs(rowHeight - targetRowHeight) / targetRowHeight;
      if (deviation > maxRowHeightDeviation) {
        rowHeight = targetRowHeight;
        fillsFullWidth = false;
      }
    }

    rowHeight = Math.round(rowHeight);

    if (fillsFullWidth) {
      // Every item except the last is rounded normally; the last item
      // absorbs whatever rounding remainder is left, so the row's total
      // pixel width can never end up even 1px off from availableWidth —
      // which is what previously let the browser's own wrap decision
      // disagree with the row this JS intended.
      let widthUsed = 0;
      rowItems.forEach((item, i) => {
        const isLastInRow = i === rowItems.length - 1;
        const width = isLastInRow
          ? Math.round(availableWidth) - widthUsed
          : Math.round(item.ar * rowHeight);
        if (!isLastInRow) widthUsed += width;
        item.el.style.width = `${width}px`;
        item.el.style.height = `${rowHeight}px`;
      });
    } else {
      rowItems.forEach((item) => {
        const width = Math.round(item.ar * rowHeight);
        item.el.style.width = `${width}px`;
        item.el.style.height = `${rowHeight}px`;
      });
    }  
  }

  items.forEach((item) => {
    if (item.full) {
      // flush whatever row was in progress, then give this item its own full-width row
      commitRow(row, false);
      row = [];
      rowAspectSum = 0;

      item.el.style.width = `${Math.round(containerWidth)}px`;
      item.el.style.height = `${Math.round(containerWidth / item.ar)}px`;
      return;
    }

    row.push(item);
    rowAspectSum += item.ar;

    const totalGap = gap * (row.length - 1);
    const widthAtTargetHeight = rowAspectSum * targetRowHeight + totalGap;

    if (widthAtTargetHeight >= containerWidth) {
      commitRow(row, false);
      row = [];
      rowAspectSum = 0;
    }
  });

  // whatever's left is the final, possibly under-filled row
  commitRow(row, true);
}

function initJustifiedGallery() {
  const container = document.getElementById('gallery-wall');
  if (!container) return;

  const options = {
    targetRowHeight: window.innerWidth < 900 ? 180 : 260,
    gap: 4,
    maxRowHeightDeviation: 0.25,
  };

  function relayout() {
    options.targetRowHeight = window.innerWidth < 900 ? 180 : 260;
    layoutJustifiedGallery(container, options);
    container.classList.add('is-laid-out');
  }

  relayout();

  // Debounce via rAF so we don't recompute on every pixel of a drag-resize
  let scheduled = false;
  const scheduleRelayout = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      relayout();
      scheduled = false;
    });
  };

  // ResizeObserver catches container width changes from any cause
  // (window resize, sidebar toggle, font loading, etc.)
  const ro = new ResizeObserver(scheduleRelayout);
  ro.observe(container);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initJustifiedGallery);
} else {
  initJustifiedGallery();
}