"""Flow downloads -> game sprites.
python3 tools/cut-owls.py [owl ...]   (default: every owl found in concept/flow-owls/raw/)
For each raw/<owl>-<pose>.png: the off-white background connected to the edges becomes transparent, then all poses
of one owl are cropped to the same box (the union of their content) so swapping poses doesn't jump, scaled to 640 px
tall and saved as assets/owls/<owl>-<pose>.webp. Prints sizes and the total."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
RAW, OUT = ROOT / "concept/flow-owls/raw", ROOT / "assets/owls"
HEIGHT, QUALITY, TOL = 640, 78, 28


def cut(path):
    im = Image.open(path).convert("RGB")
    # flood the background from every edge pixel that looks like paper; the ink outline stops the fill
    mask = Image.new("L", im.size, 0)
    work = im.copy()
    w, h = im.size
    seeds = [(x, y) for x in range(0, w, 8) for y in (0, h - 1)] + [(x, y) for y in range(0, h, 8) for x in (0, w - 1)]
    MARK = (255, 0, 255)
    for s in seeds:
        if work.getpixel(s) != MARK and min(work.getpixel(s)) > 200:
            ImageDraw.floodfill(work, s, MARK, thresh=TOL)
    px, mp = work.load(), mask.load()
    for y in range(h):
        for x in range(w):
            if px[x, y] != MARK:
                mp[x, y] = 255
    mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))   # trim the paper halo, soften the edge
    out = im.convert("RGBA")
    out.putalpha(mask)
    return out


def main(owls):
    OUT.mkdir(parents=True, exist_ok=True)
    files = sorted(RAW.glob("*.png"))
    owls = owls or sorted({f.stem.split("-")[0] for f in files})
    total = 0
    for owl in owls:
        poses = {f.stem.split("-", 1)[1]: cut(f) for f in files if f.stem.split("-")[0] == owl}
        if not poses:
            print(f"{owl}: no raw files"); continue
        boxes = [p.getchannel("A").getbbox() for p in poses.values()]
        box = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
        for pose, img in poses.items():
            c = img.crop(box)
            c = c.resize((round(c.width * HEIGHT / c.height), HEIGHT), Image.LANCZOS)
            dest = OUT / f"{owl}-{pose}.webp"
            c.save(dest, "WEBP", quality=QUALITY, method=6)
            total += dest.stat().st_size
            print(f"{dest.relative_to(ROOT)} {c.width}x{c.height} {dest.stat().st_size // 1024} KB")
    print(f"total {total / 1048576:.2f} MB")


main(sys.argv[1:])
