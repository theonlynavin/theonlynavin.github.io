/* ============================================================
   DOM references
   ============================================================ */

const grid = document.querySelector('.gallery-grid');
let items = Array.from(document.querySelectorAll('.gallery-item'));
let imgs = Array.from(document.querySelectorAll('.gallery-img'));

const overlay = document.getElementById('overlay');
const overlayInner = overlay.querySelector('.overlay-inner');
const overlayImg = document.getElementById('overlay-img');
const captionEl = document.getElementById('overlay-caption');
const dateEl = document.getElementById('overlay-date');
const prevBtn = document.querySelector('.overlay-prev');
const nextBtn = document.querySelector('.overlay-next');
const counterEl = document.getElementById('overlay-counter');

let currentIndex = -1;

/* ============================================================
Deterministic shuffle
============================================================ */

const SHUFFLE_SEED = document.body.dataset.gallerySeed || 'nabin'
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash >>> 0;
}

function shuffleItems() {
  items = items
    .map(el => {
      const img = el.querySelector('.gallery-img');
      const key = hashString(`${SHUFFLE_SEED}:${img.dataset.id}`);
      return { el, key };
    })
    .sort((a, b) => a.key - b.key)
    .map(o => o.el);

  // Reinsert in DOM order
  items.forEach(el => grid.appendChild(el));

  // Re-sync imgs after DOM reorder
  imgs = items.map(el => el.querySelector('.gallery-img'));
}

/* ============================================================
   Masonry config
   ============================================================ */

function getColumnConfig() {
  if (window.innerWidth < 420) {
    return { columns: 2, gapPercent: 3 };
  }
  return { columns: 3, gapPercent: 2 };
}

let resizeTimer = null;


/* ============================================================
   Image loading helpers
   ============================================================ */

function loadImage(img, src, onDone) {
  // Already loaded (cached or previously loaded)
  if (img.src === src && img.naturalWidth > 0) {
    img.classList.add('loaded');
    onDone && onDone();
    return;
  }

  img.classList.remove('loaded');

  img.onload = () => {
    img.classList.add('loaded');
    onDone && onDone();
  };

  img.src = src;
}

function loadOverlayImage(src) {
  if (overlayImg.src === src && overlayImg.naturalWidth > 0) {
    overlayImg.classList.add('loaded');
    return;
  }

  overlayImg.classList.remove('loaded');

  overlayImg.onload = () => {
    overlayImg.classList.add('loaded');
  };

  overlayImg.src = src;
}


/* ============================================================
   Masonry layout
   ============================================================ */

function layoutMasonry() {
  const { columns, gapPercent } = getColumnConfig();

  const gridWidth = grid.clientWidth;
  const gapPx = (gapPercent / 100) * gridWidth;
  const colWidth =
    (gridWidth - gapPx * (columns - 1)) / columns;

  const colHeights = new Array(columns).fill(0);

  items.forEach(item => {
    item.style.width = `${colWidth}px`;
    item.style.position = 'absolute';

    let minCol = 0;
    for (let i = 1; i < columns; i++) {
      if (colHeights[i] < colHeights[minCol]) {
        minCol = i;
      }
    }

    const x = minCol * (colWidth + gapPx);
    const y = colHeights[minCol];

    item.style.transform = `translate(${x}px, ${y}px)`;
    colHeights[minCol] += item.offsetHeight + gapPx;
  });

  grid.style.height = `${Math.max(...colHeights)}px`;
}


/* ============================================================
   Lazy loading thumbnails
   ============================================================ */

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const img = entry.target;
    loadImage(img, img.dataset.thumb, layoutMasonry);
    observer.unobserve(img);
  });
}, { rootMargin: '300px' });

imgs.forEach(img => observer.observe(img));


/* ============================================================
   Overlay logic
   ============================================================ */

function openOverlay(img, index = imgs.indexOf(img)) {
  resetTransform();

  currentIndex = index;
  overlay.classList.add('visible');
  document.body.classList.add('overlay-open');

  captionEl.textContent = img.dataset.caption || '';
  dateEl.textContent = img.dataset.taken || '';

  loadOverlayImage(img.dataset.full);

  const newHash = `#${img.dataset.id}`;
  if (location.hash !== newHash) {
    history.pushState(null, '', newHash);
  }
  if (counterEl) {
    counterEl.textContent =
      `${currentIndex + 1} / ${imgs.length}`;
  }
}

function closeOverlayUIOnly() {
  overlay.classList.remove('visible');
  document.body.classList.remove('overlay-open');
  overlayImg.src = '';
  overlayImg.classList.remove('loaded');
  resetTransform();
}

function closeOverlay() {
  closeOverlayUIOnly();
  if (location.hash) {
    history.pushState(null, '', window.location.pathname);
  }
}

/* ============================================================
Image indexing
============================================================ */

function showIndex(index) {
  if (index < 0)
    index = imgs.length - 1;

  if (index >= imgs.length)
    index = 0;

  currentIndex = index;

  const img = imgs[index];

  captionEl.textContent = img.dataset.caption || '';
  dateEl.textContent = img.dataset.taken || '';

  resetTransform();
  loadOverlayImage(img.dataset.full);

  history.replaceState(
    null,
    '',
    `#${img.dataset.id}`
  );

  if (counterEl) {
    counterEl.textContent =
      `${index + 1} / ${imgs.length}`;
  }
}

function nextImage() {
  showIndex(currentIndex + 1);
}

function previousImage() {
  showIndex(currentIndex - 1);
}

/* ============================================================
Overlay zoom & pan
============================================================ */

let zoomed = false;
let scale = 1;

let translateX = 0;
let translateY = 0;

let startX = 0;
let startY = 0;

let dragging = false;
let dragDistance = 0;

const ZOOM_SCALE = 2.5;
const DRAG_THRESHOLD = 10;

function applyTransform() {
  overlayImg.style.transform =
    `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

function resetTransform() {
  zoomed = false;
  scale = 1;
  translateX = 0;
  translateY = 0;
  overlayImg.classList.remove('zoomed');
  applyTransform();
}

/* ============================================================
   Event wiring
   ============================================================ */

imgs.forEach(img => {
  img.addEventListener('click', () => openOverlay(img));
});

overlay.addEventListener('click', closeOverlay);

overlayInner.addEventListener('click', e => {
  e.stopPropagation();
});

overlayImg.addEventListener('click', e => {
  if (!overlay.classList.contains('visible'))
    return;

  e.stopPropagation();

  if (dragDistance > DRAG_THRESHOLD) {
    dragDistance = 0;
    return;
  }

  const rect = overlayImg.getBoundingClientRect();

  const offsetX =
    e.clientX - rect.left - rect.width / 2;

  const offsetY =
    e.clientY - rect.top - rect.height / 2;

  if (!zoomed) {
    zoomed = true;
    scale = ZOOM_SCALE;

    translateX = -offsetX * (scale - 1);
    translateY = -offsetY * (scale - 1);

    overlayImg.classList.add('zoomed');
    applyTransform();
  } else {
    resetTransform();
  }
});

overlayImg.addEventListener('mousedown', e => {
  if (!zoomed)
    return;

  dragging = true;
  dragDistance = 0;

  startX = e.clientX - translateX;
  startY = e.clientY - translateY;

  e.preventDefault();
});

window.addEventListener('mousemove', e => {
  if (!dragging)
    return;

  const newX = e.clientX - startX;
  const newY = e.clientY - startY;

  dragDistance +=
    Math.abs(newX - translateX) +
    Math.abs(newY - translateY);

  translateX = newX;
  translateY = newY;

  const limitX = overlayImg.clientWidth;
  const limitY = overlayImg.clientHeight;

  translateX =
    Math.max(-limitX, Math.min(limitX, translateX));

  translateY =
    Math.max(-limitY, Math.min(limitY, translateY));

  applyTransform();
});

window.addEventListener('mouseup', () => {
  dragging = false;
});

overlayImg.addEventListener('touchstart', e => {
  if (!zoomed || e.touches.length !== 1) return;
  dragging = true;
  startX = e.touches[0].clientX - translateX;
  startY = e.touches[0].clientY - translateY;
});

overlayImg.addEventListener('touchmove', e => {
  if (!dragging) return;
  translateX = e.touches[0].clientX - startX;
  translateY = e.touches[0].clientY - startY;
  applyTransform();
});

overlayImg.addEventListener('touchend', () => {
  dragging = false;
});

prevBtn?.addEventListener('click', e => {
  e.stopPropagation();
  previousImage();
});

nextBtn?.addEventListener('click', e => {
  e.stopPropagation();
  nextImage();
});

document.addEventListener('keydown', e => {
  if (!overlay.classList.contains('visible'))
    return;

  switch (e.key) {
    case 'Escape':
      closeOverlay();
      break;

    case 'ArrowLeft':
      previousImage();
      break;

    case 'ArrowRight':
      nextImage();
      break;
  }
});

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(layoutMasonry, 150);
});

window.addEventListener('popstate', () => {
  if (!location.hash && overlay.classList.contains('visible')) {
    closeOverlayUIOnly();
    return;
  }

  if (location.hash && !overlay.classList.contains('visible')) {
    const id = location.hash.slice(1);
    const target = imgs.find(img => img.dataset.id === id);
    if (target) openOverlay(target);
  }
});


/* ============================================================
   Bootstrap
   ============================================================ */

window.addEventListener('load', () => {
  shuffleItems();
  layoutMasonry();

  if (location.hash) {
    const id = location.hash.slice(1);
    const target = imgs.find(img => img.dataset.id === id);
    if (target) openOverlay(target);
  }
});
