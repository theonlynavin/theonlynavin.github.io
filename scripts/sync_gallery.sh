#!/usr/bin/env bash
set -euo pipefail

ORIG_DIR="assets/gallery/originals"
THUMB_DIR="assets/gallery/thumbs"
META_DIR="_gallery"

echo "Syncing gallery assets and metadata..."

mkdir -p "$THUMB_DIR"
mkdir -p "$META_DIR"

shopt -s nullglob globstar

for img in "$ORIG_DIR"/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}; do
  # Path relative to originals/
  rel_path="${img#$ORIG_DIR/}"

  filename="$(basename "$img")"
  name="${filename%.*}"
  taken="$(exiftool -s3 -DateTimeOriginal -d '%d %b %Y' "$img")"

  # Category = first directory component
  category="$(dirname "$rel_path")"
  if [[ "$category" == "." ]]; then
    category="uncategorized"
  fi

  # Output paths
  thumb="$THUMB_DIR/$rel_path"
  meta="$META_DIR/$category-$name.md"

  # Ensure thumbnail directory exists
  mkdir -p "$(dirname "$thumb")"

  # Generate thumbnail if missing
  if [[ ! -f "$thumb" ]]; then
    echo "Generating thumbnail: $rel_path"
    convert "$img" \
      -resize 600x \
      -strip \
      -quality 80 \
      "$thumb"
  fi

  # Generate metadata file if missing
  if [[ ! -f "$meta" ]]; then
    echo "Creating metadata file: $(basename "$meta")"
    cat <<EOF > "$meta"
---
image: $rel_path
thumb: $rel_path
category: $category
caption: ""
taken: "$taken"
---
EOF
  fi
done

shopt -u nullglob globstar

echo "Gallery sync completed successfully."
