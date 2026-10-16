#!/bin/sh
# Builds the itch.io web upload: itch/owl-stare-web.zip with index.html at the root and every runtime file
# (game code, Phaser, MediaPipe wasm, face model, fonts). No dev pages, tests or tools.
set -e
cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist itch
cp -R index.html src lib models dist/
mkdir -p dist/assets && cp -R assets/fonts assets/owls dist/assets/
find dist -name .DS_Store -delete
# SIMD wasm only: keeps the zip under itch's 10 MB browser upload limit (browsers without SIMD get a friendly screen)
rm -f dist/lib/mediapipe/wasm/vision_wasm_nosimd_internal.*
rm -f itch/owl-stare-web.zip
(cd dist && zip -qr -X ../itch/owl-stare-web.zip .)
bytes=$(wc -c < itch/owl-stare-web.zip | tr -d ' ')
echo "itch/owl-stare-web.zip $bytes bytes ($(echo "scale=2; $bytes/1048576" | bc) MB), $(unzip -l itch/owl-stare-web.zip | tail -1 | awk '{print $2}') files"
[ "$bytes" -lt 10485760 ] || { echo "ERROR: over itch's 10 MB limit"; exit 1; }
