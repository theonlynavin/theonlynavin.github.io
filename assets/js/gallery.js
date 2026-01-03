const imgs = document.querySelectorAll('.gallery-img');

const overlay = document.getElementById('overlay');
const overlayInner = overlay.querySelector('.overlay-inner');
const overlayImg = document.getElementById('overlay-img');
const captionEl = document.getElementById('overlay-caption');
const dateEl = document.getElementById('overlay-date');

/* ------------------------------------------------------------
   Utility: load image with correct blur semantics
   ------------------------------------------------------------ */

function loadImage(imgEl, src) {
  // If already loaded (cache hit), do not blur
  if (imgEl.complete && imgEl.src === src) {
    imgEl.classList.add('loaded');
    return;
  }

  imgEl.classList.remove('loaded');

  imgEl.onload = () => {
    imgEl.classList.add('loaded');
  };

  imgEl.src = src;
}

/* ------------------------------------------------------------
   Lazy-load thumbnails
   ------------------------------------------------------------ */

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const img = entry.target;
    loadImage(img, img.dataset.thumb);
    io.unobserve(img);
  });
}, { rootMargin: '300px' });

imgs.forEach(img => io.observe(img));

/* ------------------------------------------------------------
   Overlay open / close
   ------------------------------------------------------------ */

function openOverlay(img) {
  overlay.classList.remove('hidden');

  captionEl.textContent = img.dataset.caption || '';
  dateEl.textContent = img.dataset.taken || '';

  loadImage(overlayImg, img.dataset.full);

  // push hash (idempotent)
  if (location.hash !== `#${img.dataset.id}`) {
    history.pushState(null, '', `#${img.dataset.id}`);
  }

  // prevent background scroll
  document.body.style.overflow = 'hidden';
}

function closeOverlay() {
  overlay.classList.add('hidden');
  overlayImg.src = '';

  document.body.style.overflow = '';

  // clear hash without reload
  history.pushState(null, '', window.location.pathname);
}

/* ------------------------------------------------------------
   Event wiring
   ------------------------------------------------------------ */

// Thumbnail click → open overlay
imgs.forEach(img => {
  img.addEventListener('click', () => openOverlay(img));
});

// Backdrop click → close
overlay.addEventListener('click', closeOverlay);

// Click inside overlay content → do nothing
overlayInner.addEventListener('click', e => {
  e.stopPropagation();
});

// ESC key → close
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
    closeOverlay();
  }
});

/* ------------------------------------------------------------
   Restore overlay from URL hash
   ------------------------------------------------------------ */

window.addEventListener('load', () => {
  if (!location.hash) return;

  const id = location.hash.slice(1);
  const target = [...imgs].find(img => img.dataset.id === id);
  if (target) openOverlay(target);
});
