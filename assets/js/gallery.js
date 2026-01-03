/* ============================================================
   DOM references
   ============================================================ */

const grid = document.querySelector('.gallery-grid');
const items = Array.from(document.querySelectorAll('.gallery-item'));
const imgs = Array.from(document.querySelectorAll('.gallery-img'));

const overlay = document.getElementById('overlay');
const overlayInner = overlay.querySelector('.overlay-inner');
const overlayImg = document.getElementById('overlay-img');
const captionEl = document.getElementById('overlay-caption');
const dateEl = document.getElementById('overlay-date');


/* ============================================================
   Masonry configuration
   ============================================================ */

function getColumnConfig() {
    // Mobile-first tuning
    if (window.innerWidth < 420) {
        return { columns: 2, gap: 3 }; // gap in %
    }

    return { columns: 3, gap: 2 };
}

let resizeTimer = null;


/* ============================================================
   Image loading helper
   ============================================================ */

function loadImage(img, src, onDone) {
    // Cached image → no loading state
    if (img.complete && img.src === src) {
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


/* ============================================================
   Masonry layout engine
   ============================================================ */

function layoutMasonry() {
    const { columns, gap } = getColumnConfig();

    const gridWidth = grid.clientWidth;
    const gapPx = (gap / 100) * gridWidth;
    const columnWidthPx =
        (gridWidth - gapPx * (columns - 1)) / columns;

    const columnHeights = new Array(columns).fill(0);

    items.forEach(item => {
        item.style.width = `${columnWidthPx}px`;

        // Find shortest column
        let minCol = 0;
        for (let i = 1; i < columns; i++) {
            if (columnHeights[i] < columnHeights[minCol]) {
                minCol = i;
            }
        }

        const x = minCol * (columnWidthPx + gapPx);
        const y = columnHeights[minCol];

        item.style.transform = `translate(${x}px, ${y}px)`;
        columnHeights[minCol] += item.offsetHeight + gapPx;
    });

    grid.style.height = `${Math.max(...columnHeights)}px`;
}


/* ============================================================
   Lazy-loading thumbnails
   ============================================================ */

const observer = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const img = entry.target;
            loadImage(img, img.dataset.thumb, layoutMasonry);
            observer.unobserve(img);
        });
    },
    { rootMargin: '300px' }
);

imgs.forEach(img => observer.observe(img));


/* ============================================================
   Overlay state management
   ============================================================ */

function openOverlay(img) {
    overlay.classList.add('visible');
    document.body.classList.add('overlay-open');

    captionEl.textContent = img.dataset.caption || '';
    dateEl.textContent = img.dataset.taken || '';

    loadImage(overlayImg, img.dataset.full);

    // Sync URL → overlay state
    const newHash = `#${img.dataset.id}`;
    if (location.hash !== newHash) {
        history.pushState(null, '', newHash);
    }
}

function closeOverlayUIOnly() {
    overlay.classList.remove('visible');
    document.body.classList.remove('overlay-open');
    overlayImg.src = '';
}

function closeOverlay() {
    closeOverlayUIOnly();

    // Sync overlay state → URL
    if (location.hash) {
        history.pushState(null, '', window.location.pathname);
    }
}


/* ============================================================
   Event wiring
   ============================================================ */

// Thumbnails → open overlay
imgs.forEach(img => {
    img.addEventListener('click', () => openOverlay(img));
});

// Backdrop → close overlay
overlay.addEventListener('click', closeOverlay);

// Overlay content → do not close
overlayInner.addEventListener('click', e => {
    e.stopPropagation();
});

// ESC → close overlay
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) {
        closeOverlay();
    }
});

// Resize → recompute masonry (debounced)
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layoutMasonry, 150);
});


/* ============================================================
   URL / history synchronization
   ============================================================ */

// Initial load (deep-link support)
window.addEventListener('load', () => {
    layoutMasonry();

    if (!location.hash) return;

    const id = location.hash.slice(1);
    const target = imgs.find(img => img.dataset.id === id);
    if (target) openOverlay(target);
});

// Back / forward navigation
window.addEventListener('popstate', () => {
    // Back → close overlay
    if (!location.hash && overlay.classList.contains('visible')) {
        closeOverlayUIOnly();
        return;
    }

    // Forward → reopen overlay
    if (location.hash && !overlay.classList.contains('visible')) {
        const id = location.hash.slice(1);
        const target = imgs.find(img => img.dataset.id === id);
        if (target) openOverlay(target);
    }
});
