---
layout: gallery 
title: Gallery
permalink: /gallery/
gallery: true
---

<div id="gallery" class="gallery-grid">
  {% for item in site.gallery %}
    {% assign id = item.path | split:'/' | last | split:'.' | first %}
    <div class="gallery-item">
      <img
        class="gallery-img"
        data-id="{{ id }}"
        data-thumb="{{ '/assets/gallery/thumbs/' | append: item.image | relative_url }}"
        data-full="{{ '/assets/gallery/originals/' | append: item.image | relative_url }}"
        data-caption="{{ item.caption }}"
        data-taken="{{ item.taken }}"
        alt="{{ item.caption }}"
      >
    </div>
  {% endfor %}
</div>

<div id="overlay" class="overlay hidden">
  <div class="overlay-inner">
    <img id="overlay-img">
    <div class="overlay-meta">
      <p id="overlay-caption"></p>
      <p id="overlay-date"></p>
    </div>
  </div>
</div>
