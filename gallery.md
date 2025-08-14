---
layout: gallery 
title: Gallery
permalink: /gallery/
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
    opacity: 1;
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