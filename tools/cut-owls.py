"""Flow downloads -> game sprites.
python3 tools/cut-owls.py [owl ...]   (default: every owl found in concept/flow-owls/raw/)
For each aligned/<owl>-<pose>.png (tools/align-owls.py): the off-white background connected to the edges becomes transparent, then all poses
of one owl are cropped to the same box (the union of their content) so swapping poses doesn't jump, kept at full
resolution and saved as assets/owls/<owl>-<pose>.webp. Prints sizes and the total."""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
RAW, OUT = ROOT / "concept/flow-owls/aligned", ROOT / "assets/owls"   # aligned/: made by tools/align-owls.py from raw/
QUALITY = 80   # full Flow resolution (no downscale): ~730-880 px tall, about 1.7x the on-screen size


def cut(path, fluffy=False):
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    lum = a.mean(axis=2)
    sat = (a.max(axis=2) - a.min(axis=2)) / 255
    paper = (lum > 196) & (sat < 0.12)                     # off-white paper, its texture and faint grey shadows
    ink = ndimage.binary_dilation(lum < 110, iterations=5)  # thick outlines, grown to seal gaps between fluff strokes
    # background = paper reachable from the image edge without crossing the sealed outline...
    labels, _ = ndimage.label(paper & ~ink)
    edge = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    bg = np.isin(labels, list(edge))
    # ...then the paper halo under the grown outline, and loose paper flecks that touch the background
    for _ in range(8):
        bg |= ndimage.binary_dilation(bg) & paper
    fg = ~bg
    if fluffy:   # Hoot and the guide: paper-coloured bodies with gaps in the outline, so fill the body inside the outline instead
        solid = ~paper
        fg = ndimage.binary_fill_holes(ndimage.binary_closing(solid, iterations=14)) | solid
    # drop tiny islands (dust) but keep drops, shake lines and other small ink bits of a few hundred px
    lab, n = ndimage.label(fg)
    sizes = ndimage.sum(fg, lab, range(1, n + 1))
    fg &= np.isin(lab, np.nonzero(sizes >= 60)[0] + 1)
    alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert("RGBA")
    out.putalpha(alpha)
    return out


def main(owls):
    OUT.mkdir(parents=True, exist_ok=True)
    files = sorted(RAW.glob("*.png"))
    owls = owls or sorted({f.stem.split("-")[0] for f in files})
    total = 0
    for owl in owls:
        poses = {f.stem.split("-", 1)[1]: cut(f, owl in ("hoot", "guide")) for f in files if f.stem.split("-")[0] == owl}
        if not poses:
            print(f"{owl}: no raw files"); continue
        boxes = [p.getchannel("A").getbbox() for p in poses.values()]
        box = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
        for pose, img in poses.items():
            c = img.crop(box)
            dest = OUT / f"{owl}-{pose}.webp"
            c.save(dest, "WEBP", quality=QUALITY, method=6)
            total += dest.stat().st_size
            print(f"{dest.relative_to(ROOT)} {c.width}x{c.height} {dest.stat().st_size // 1024} KB")
    print(f"total {total / 1048576:.2f} MB")


main(sys.argv[1:])
