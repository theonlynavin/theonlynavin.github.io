---
layout: gallery 
title: Gallery
---
<style>
  /* Masonry layout */
  .masonry {
    column-count: auto;
    column-width: 250px;
    column-gap: 1rem;
  }
  .masonry a {
    display: block;
    margin-bottom: 1rem;
    break-inside: avoid;
  }
  .masonry img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 12px;
    transform: scale(1);
    opacity: 0;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.6s ease;
  }
  .masonry img:hover {
    transform: scale(1.03);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }
</style>

<!-- Masonry gallery -->
<div class="masonry" id="gallery">
  {% assign gallery_path = "assets/gallery" %}
  {% for file in site.static_files %}
    {% if file.path contains gallery_path %}
      <a href="{{ file.path | relative_url }}" 
         class="glightbox" 
         data-gallery="gallery1" 
         data-title="{{ file.name }}">
        <img src="{{ file.path | relative_url }}" loading="lazy" alt="{{ file.name }}">
      </a>
    {% endif %}
  {% endfor %}
</div>

<!-- Load GLightbox only if not already loaded -->
<script>
(function() {
  // Fade-in effect
  document.querySelectorAll('#gallery img').forEach(img => {
    img.onload = () => img.style.opacity = '1';
  });

  function initGLightbox() {
    // Only target links inside #gallery
    if (!window.galleryLightbox) {
      window.galleryLightbox = GLightbox({
        selector: '#gallery .glightbox',
        touchNavigation: true,
        loop: true,
        zoomable: true,
        autoplayVideos: false
      });
    }
  }

  // Load GLightbox if not loaded already
  if (typeof GLightbox === 'undefined') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/glightbox/dist/js/glightbox.min.js';
    script.onload = initGLightbox;
    document.body.appendChild(script);
  } else {
    initGLightbox();
  }
})();
</script>
