/* ============================================================
   Element references
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
   
   const COLUMN_WIDTH = 315;
   const GAP = 20;
   
   let resizeTimer = null;
   
   /* ============================================================
      Image loading helper
      ============================================================ */
   
   function loadImage(img, src, callback) {
     // Cached image: no loading state
     if (img.complete && img.src === src) {
       img.classList.add('loaded');
       callback && callback();
       return;
     }
   
     img.classList.remove('loaded');
   
     img.onload = () => {
       img.classList.add('loaded');
       callback && callback();
     };
   
     img.src = src;
   }
   
   /* ============================================================
      Masonry layout
      ============================================================ */
   
   function layoutMasonry() {
     if (!grid) return;
   
     const gridWidth = grid.clientWidth;
     const columns = Math.max(
       1,
       Math.floor((gridWidth + GAP) / (COLUMN_WIDTH + GAP))
     );
   
     const columnHeights = new Array(columns).fill(0);
   
     items.forEach(item => {
       const shortestColumn = columnHeights.indexOf(
         Math.min(...columnHeights)
       );
   
       const x = shortestColumn * (COLUMN_WIDTH + GAP);
       const y = columnHeights[shortestColumn];
   
       item.style.transform = `translate(${x}px, ${y}px)`;
       columnHeights[shortestColumn] += item.offsetHeight + GAP;
     });
   
     grid.style.height = `${Math.max(...columnHeights)}px`;
   }
   
   /* ============================================================
      Lazy-load thumbnails
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
      Overlay logic
      ============================================================ */
   
   function openOverlay(img) {
     overlay.classList.add('visible');
     document.body.style.overflow = 'hidden';
   
     captionEl.textContent = img.dataset.caption || '';
     dateEl.textContent = img.dataset.taken || '';
   
     loadImage(overlayImg, img.dataset.full);
   
     if (location.hash !== `#${img.dataset.id}`) {
       history.pushState(null, '', `#${img.dataset.id}`);
     }
   }
   
   function closeOverlay() {
     overlay.classList.remove('visible');
     document.body.style.overflow = '';
     overlayImg.src = '';
   
     history.pushState(null, '', window.location.pathname);
   }
   
   /* ============================================================
      Event wiring
      ============================================================ */
   
   // Thumbnail → open overlay
   imgs.forEach(img => {
     img.addEventListener('click', () => openOverlay(img));
   });
   
   // Backdrop → close overlay
   overlay.addEventListener('click', closeOverlay);
   
   // Inner content → do not close
   overlayInner.addEventListener('click', e => {
     e.stopPropagation();
   });
   
   // ESC → close overlay
   document.addEventListener('keydown', e => {
     if (e.key === 'Escape' && overlay.classList.contains('visible')) {
       closeOverlay();
     }
   });
   
   // Window resize → relayout masonry (debounced)
   window.addEventListener('resize', () => {
     clearTimeout(resizeTimer);
     resizeTimer = setTimeout(layoutMasonry, 150);
   });
   
   /* ============================================================
      Restore overlay from URL hash
      ============================================================ */
   
   window.addEventListener('load', () => {
     layoutMasonry();
   
     if (!location.hash) return;
   
     const id = location.hash.slice(1);
     const target = imgs.find(img => img.dataset.id === id);
     if (target) openOverlay(target);
   });
   