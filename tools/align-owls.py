"""Flow redraws the whole owl for every pose, so the body, feet and props drift a little between poses.
python3 tools/align-owls.py [owl ...]
Keeps ONE body per owl (its rest pose) and only takes the face from the other poses: each pose is first registered to
the rest pose (scale + shift, matched on the body's ink lines), then its face area (and any sweat drops) is blended onto
the rest drawing. Writes concept/flow-owls/aligned/<owl>-<pose>.png, which tools/cut-owls.py then cuts."""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage.registration import phase_cross_correlation
from skimage.transform import SimilarityTransform, warp, rescale

ROOT = Path(__file__).resolve().parent.parent
RAW, OUT = ROOT / "concept/flow-owls/raw", ROOT / "concept/flow-owls/aligned"
# face ellipse in the rest drawing (1024 px raw): centre x, centre y, radius x, radius y (Angel 17 Oct: "rapiin")
FACE = {"hoot": (500, 410, 230, 170), "plume": (500, 410, 230, 120), "twitchy": (480, 360, 220, 150), "boomer": (432, 390, 185, 138),
        "grandma": (440, 400, 150, 105), "dj": (520, 380, 170, 120), "twins": (500, 345, 170, 120), "boss": (480, 350, 180, 120),
        "guide": (496, 400, 165, 105)}
WHOLE = {"guide-talk"}   # poses that change more than the face (the guide raises a wing): taken as drawn


def load(p):
    return np.asarray(Image.open(p).convert("RGB")).astype(np.float32) / 255


def ink(a, face):   # the body's dark lines, blurred, with the face blanked out so expressions don't steer the match
    m = ndimage.gaussian_filter((a.mean(axis=2) < 0.43).astype(np.float32), 2)
    cx, cy, rx, ry = face
    yy, xx = np.mgrid[: m.shape[0], : m.shape[1]]
    m[((xx - cx) / (rx * 1.3)) ** 2 + ((yy - cy) / (ry * 1.3)) ** 2 < 1] = 0
    return m


def register(rest, pose, face):
    """scale s and shift so that pose(s * x + t) lines up with rest(x)"""
    k = 0.25
    a = rescale(ink(rest, face), k, anti_aliasing=True)
    best = None
    for s in np.arange(0.9, 1.101, 0.005):
        b = rescale(ink(pose, face), k * s, anti_aliasing=True)
        canvas = np.zeros_like(a); h, w = min(a.shape[0], b.shape[0]), min(a.shape[1], b.shape[1])
        canvas[:h, :w] = b[:h, :w]
        shift, err, _ = phase_cross_correlation(a, canvas, upsample_factor=4, normalization=None)
        if best is None or err < best[0]:
            best = (err, s, shift / k)
    return best[1], best[2]


def align(owl):
    rest_p = RAW / f"{owl}-rest.png"
    rest = load(rest_p)
    face = FACE[owl]
    cx, cy, rx, ry = face
    yy, xx = np.mgrid[: rest.shape[0], : rest.shape[1]]
    ell = (((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 < 1).astype(np.float32)
    OUT.mkdir(parents=True, exist_ok=True)
    Image.fromarray((rest * 255).astype(np.uint8)).save(OUT / f"{owl}-rest.png")
    for p in sorted(RAW.glob(f"{owl}-*.png")):
        pose_name = p.stem.split("-", 1)[1]
        if pose_name == "rest":
            continue
        pose = load(p)
        if p.stem in WHOLE:
            Image.open(p).convert("RGB").save(OUT / p.name); print(f"{p.stem}: whole"); continue
        s, (dy, dx) = register(rest, pose, face)
        # output pixel x (rest frame) reads pose at (x - shift) / s
        tf = SimilarityTransform(scale=1 / s, translation=(-dx / s, -dy / s))
        al = warp(pose, tf, output_shape=rest.shape[:2], mode="edge")
        # sweat drops and other light-blue bits the pose adds on the paper around the head
        blue = (al[..., 2] > al[..., 0] + 0.1) & (al[..., 2] > 0.6)
        paper = rest.mean(axis=2) > 0.85
        drops = ndimage.binary_dilation(blue & paper, iterations=6) & (yy < cy + ry * 1.5)
        w = np.maximum(ndimage.gaussian_filter(ell, 10), ndimage.gaussian_filter(drops.astype(np.float32), 3))[..., None]
        out = rest * (1 - w) + al * w
        Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).save(OUT / f"{owl}-{pose_name}.png")
        print(f"{owl}-{pose_name}: scale {s:.3f}, shift {dx:+.0f},{dy:+.0f}")


for owl in sys.argv[1:] or FACE:
    align(owl)
