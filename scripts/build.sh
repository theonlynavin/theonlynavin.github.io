#!/usr/bin/env bash
set -e

echo "Generating thumbnails"
bash scripts/sync_gallery.sh

echo "Building site"
bundle install
bundle exec jekyll build

echo "All done"
