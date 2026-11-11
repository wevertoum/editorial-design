#!/usr/bin/env python3
"""Bake editorial duotone into ProfileCard portraits (shadow #493975 · highlight #FBF9F6).

Vivliostyle does not reliably apply SVG filters or mix-blend-mode on <img>, so the
two-color map is written into the PNG pixels. Color masters live under
assets/media/_incoming/portraits-color/ so the script can be re-run safely.
"""

from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / "assets" / "media"
MASTERS = MEDIA / "_incoming" / "portraits-color"

# Shadows deep purple · highlights warm ivory
SHADOW = (0x49, 0x39, 0x75)
HIGHLIGHT = (0xFB, 0xF9, 0xF6)

PROFILE_PHOTOS = (
    "org-image6.png",
    "org-image7.png",
    "org-image9.png",
    "org-image10.png",
    "org-image14.png",
    "org-image15.png",
)


def ensure_master(name: str) -> Path:
    dest = MEDIA / name
    master = MASTERS / name
    MASTERS.mkdir(parents=True, exist_ok=True)
    if not master.is_file():
        if not dest.is_file():
            raise SystemExit(f"Missing portrait: {dest}")
        shutil.copy2(dest, master)
        print(f"master saved: {master.relative_to(ROOT)}")
    return master


def luminance(r: int, g: int, b: int) -> float:
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255.0


def lerp(a: int, b: int, t: float) -> int:
    return int(round(a + (b - a) * t))


def tone_map(values: list[float]) -> list[float]:
    """Stretch luminance so deeps hit purple and brights hit ivory (true two stops)."""
    ordered = sorted(values)
    n = len(ordered)
    lo = ordered[int(n * 0.02)]
    hi = ordered[int(n * 0.98)]
    span = max(hi - lo, 1e-6)

    mapped: list[float] = []
    for raw in values:
        t = (raw - lo) / span
        t = max(0.0, min(1.0, t))
        # soft midtones: slight lift, keep facial detail without neon
        t = pow(t, 0.92)
        mapped.append(t)
    return mapped


def apply_duotone(src: Path, dest: Path) -> None:
    img = Image.open(src).convert("RGBA")
    pixels = img.load()
    assert pixels is not None
    w, h = img.size

    coords: list[tuple[int, int, int]] = []
    lums: list[float] = []
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            coords.append((x, y, a))
            lums.append(luminance(r, g, b))

    tones = tone_map(lums)
    for (x, y, a), t in zip(coords, tones):
        pixels[x, y] = (
            lerp(SHADOW[0], HIGHLIGHT[0], t),
            lerp(SHADOW[1], HIGHLIGHT[1], t),
            lerp(SHADOW[2], HIGHLIGHT[2], t),
            a,
        )

    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, format="PNG", optimize=True)


def main() -> None:
    for name in PROFILE_PHOTOS:
        master = ensure_master(name)
        out = MEDIA / name
        print(f"{master.name} -> duotone {out.name}")
        apply_duotone(master, out)


if __name__ == "__main__":
    main()
