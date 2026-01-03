#!/usr/bin/env bash
set -euo pipefail

ORIG_DIR="assets/gallery/originals"
THUMB_DIR="assets/gallery/thumbs"
META_DIR="_gallery"

mkdir -p "$THUMB_DIR"
mkdir -p "$META_DIR"

echo "Syncing gallery assets and metadata..."

shopt -s nullglob
for img in "$ORIG_DIR"/*.{jpg,jpeg,png,JPG,JPEG,PNG}; do
  filename=$(basename "$img")
  name="${filename%.*}"

  thumb="$THUMB_DIR/$filename"
  meta="$META_DIR/$name.md"

  # Generate thumbnail if missing
  if [ ! -f "$thumb" ]; then
    echo "Generating thumbnail: $filename"
    convert "$img" \
      -resize 300x \
      -strip \
      -quality 78 \
      "$thumb"
  fi

  # Generate metadata file if missing
  if [ ! -f "$meta" ]; then
    echo "Creating metadata file: $name.md"
    cat <<EOF > "$meta"
---
image: $filename
caption: ""
taken: ""
---
EOF
  fi
done
shopt -u nullglob

echo "Gallery sync completed successfully."
