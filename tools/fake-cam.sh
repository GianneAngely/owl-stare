#!/bin/sh
# Builds the fake webcam clip for the headless checks (Chrome --use-file-for-fake-video-capture), 640x480 30 fps y4m:
# 15 s talking head (natural blinks) -> 3 s smile -> 3 s head turned away -> 3 s empty room.
# Inputs are public-domain files in test/fixtures (see test/fixtures/SOURCES.md). Usage: tools/fake-cam.sh out.y4m
set -e
cd "$(dirname "$0")/../test/fixtures"
ffmpeg -loglevel error -y -ss 10 -t 15 -i address.webm -loop 1 -t 3 -i portrait.jpg -loop 1 -t 3 -i turn2.jpg \
  -f lavfi -t 3 -i color=c=0x403830:s=640x480:r=30 \
  -filter_complex "[0:v]scale=640:360,pad=640:480:0:60,fps=30,format=yuv420p,setsar=1[a];\
[1:v]crop=820:615:0:0,scale=640:480,fps=30,format=yuv420p,setsar=1[b];\
[2:v]scale=640:-2,crop=640:480,fps=30,format=yuv420p,setsar=1[c];[3:v]format=yuv420p,setsar=1[d];\
[a][b][c][d]concat=n=4:v=1[o]" -map "[o]" -pix_fmt yuv420p "$1"
