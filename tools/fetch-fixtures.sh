#!/bin/sh
# Downloads the public-domain test footage listed in test/fixtures/SOURCES.md.
set -e
cd "$(dirname "$0")/../test/fixtures"
UA="OwlStareTest/0.1 (testing)"
curl -sf -A "$UA" -o address.webm "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/29/2017-01-07_President_Obama%27s_Weekly_Address.webm/2017-01-07_President_Obama%27s_Weekly_Address.webm.480p.vp9.webm"
curl -sf -o portrait.jpg https://storage.googleapis.com/mediapipe-assets/portrait.jpg
curl -sf -A "$UA" -o turn2.jpg "https://upload.wikimedia.org/wikipedia/commons/8/86/Portrait_of_HB_Herrick%27s_wife%2C_Elizabeth_Herrick%2C_looking_away%2C_between_1903_and_1908_%28PORTRAITS_2593%29.jpg"
mkdir -p frames && ffmpeg -loglevel error -y -ss 10 -t 30 -i address.webm -vf scale=640:-1 frames/f_%03d.jpg
echo ok
