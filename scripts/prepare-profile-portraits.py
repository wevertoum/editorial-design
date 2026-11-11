#!/usr/bin/env python3
"""Square, face-biased crops for ProfileCard photos. Run after replacing _incoming sources.

Also writes color masters and bakes editorial duotone (#493975 / #FBF9F6) into the
published PNGs — see apply-profile-duotone.py.
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
INCOMING = ROOT / "assets" / "media" / "_incoming"
MASTERS = INCOMING / "portraits-color"
OUT_DIR = ROOT / "assets" / "media"
OUTPUT_SIZE = 800


def face_square_crop(img: Image.Image, fx: float, fy: float) -> Image.Image:
    w, h = img.size
    side = min(w, h)
    cx = fx * w
    cy = fy * h
    left = int(round(cx - side / 2))
    top = int(round(cy - side / 2))
    left = max(0, min(left, w - side))
    top = max(0, min(top, h - side))
    return img.crop((left, top, left + side, top + side))


def save_portrait(src: Path, dest: Path, fx: float, fy: float) -> None:
    img = Image.open(src).convert("RGBA")
    img.load()
    cropped = face_square_crop(img, fx, fy)
    resized = cropped.resize((OUTPUT_SIZE, OUTPUT_SIZE), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    target = dest
    if src.resolve() == dest.resolve():
        target = dest.with_name(f".{dest.stem}.tmp.png")
    resized.save(target, format="PNG", optimize=True)
    if target != dest:
        target.replace(dest)


def main() -> None:
    jobs: list[tuple[Path, Path, float, float]] = [
        (INCOMING / "anna-ritzema.jpg", OUT_DIR / "org-image7.png", 0.52, 0.34),
        (INCOMING / "grace-chartered.png", OUT_DIR / "org-image15.png", 0.5, 0.42),
        (INCOMING / "alfredo-grez.png", OUT_DIR / "org-image9.png", 0.5, 0.3),
        (INCOMING / "michael-cohen-edweek.jpg", OUT_DIR / "org-image14.png", 0.5, 0.48),
        (OUT_DIR / "org-image10.png", OUT_DIR / "org-image10.png", 0.5, 0.36),
        (OUT_DIR / "org-image6.png", OUT_DIR / "org-image6.png", 0.5, 0.32),
    ]

    MASTERS.mkdir(parents=True, exist_ok=True)
    for src, dest, fx, fy in jobs:
        if not src.is_file():
            raise SystemExit(f"Missing source: {src}")
        print(f"{src.name} -> {dest.name} (focal {fx}, {fy})")
        save_portrait(src, dest, fx, fy)
        # Color master for re-duotone without re-cropping from raw incoming
        shutil.copy2(dest, MASTERS / dest.name)

    subprocess.check_call([sys.executable, str(ROOT / "scripts" / "apply-profile-duotone.py")])


if __name__ == "__main__":
    main()

