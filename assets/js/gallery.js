/* ============================================================
   DOM references
   ============================================================ */

   const grid = document.querySelector('.gallery-grid');
   let items = Array.from(document.querySelectorAll('.gallery-item'));
   let imgs  = Array.from(document.querySelectorAll('.gallery-img'));
   
   const overlay = document.getElementById('overlay');
   const overlayInner = overlay.querySelector('.overlay-inner');
   const overlayImg = document.getElementById('overlay-img');
   const captionEl = document.getElementById('overlay-caption');
   const dateEl = document.getElementById('overlay-date');
   
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
   
   function openOverlay(img) {
     overlay.classList.add('visible');
     document.body.classList.add('overlay-open');
   
     captionEl.textContent = img.dataset.caption || '';
     dateEl.textContent = img.dataset.taken || '';
   
     loadOverlayImage(img.dataset.full);
   
     const newHash = `#${img.dataset.id}`;
     if (location.hash !== newHash) {
       history.pushState(null, '', newHash);
     }
   }
   
   function closeOverlayUIOnly() {
     overlay.classList.remove('visible');
     document.body.classList.remove('overlay-open');
     overlayImg.src = '';
     overlayImg.classList.remove('loaded');
   }
   
   function closeOverlay() {
     closeOverlayUIOnly();
     if (location.hash) {
       history.pushState(null, '', window.location.pathname);
     }
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
   
   document.addEventListener('keydown', e => {
     if (e.key === 'Escape' && overlay.classList.contains('visible')) {
       closeOverlay();
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
   