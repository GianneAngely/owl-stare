#!/bin/sh
# Builds the itch.io web upload: itch/owl-stare-web.zip with index.html at the root and every runtime file
# (game code, Phaser, MediaPipe wasm, face model, fonts). No dev pages, tests or tools.
set -e
cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist itch
cp -R index.html src lib models dist/
mkdir -p dist/assets && cp -R assets/fonts dist/assets/
find dist -name .DS_Store -delete
rm -f itch/owl-stare-web.zip
(cd dist && zip -qr -X ../itch/owl-stare-web.zip .)
echo "itch/owl-stare-web.zip $(du -h itch/owl-stare-web.zip | cut -f1), $(unzip -l itch/owl-stare-web.zip | tail -1 | awk '{print $2}') files"
