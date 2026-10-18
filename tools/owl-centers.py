"""Writes src/art/owl-centers.js: how far each owl's body sits from the middle of its sprite, as a share of the
sprite width. Props stick out to one side (the guide's wing and tail, Boomer's megaphone, Grandma's yarn), so
centring the image box makes the owl itself look off-centre (Angel, 19 Oct). The body is the run of columns where
the drawing is at least half as tall as its tallest column, on the rest pose (every pose shares that body).
python3 tools/owl-centers.py"""
import glob, os, json
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = {}
for f in sorted(glob.glob(f"{ROOT}/assets/owls/*-rest.webp")):
    a = np.asarray(Image.open(f).convert("RGBA"))[..., 3] > 128
    col = a.sum(0)
    core = np.nonzero(col > col.max() * 0.5)[0]
    out[os.path.basename(f).split("-")[0]] = round(float((core.min() + core.max()) / 2 / a.shape[1] - 0.5), 4)
with open(f"{ROOT}/src/art/owl-centers.js", "w") as fh:
    fh.write("// Made by tools/owl-centers.py: each owl's body centre minus the sprite centre, as a share of the sprite width.\n")
    fh.write(f"export const BODY_X = {json.dumps(out)};\n")
print(out)
