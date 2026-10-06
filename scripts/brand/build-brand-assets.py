#!/usr/bin/env python3
"""Builds the CULT brand assets from scripts/brand/cult-logo-source.png.

The source is bone letters on pure black. Luminance becomes alpha, so the soft
smudge where letters overlap survives on any dark surface.

Usage (needs Pillow + numpy):  python3 scripts/brand/build-brand-assets.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "scripts/brand/cult-logo-source.png"
BRAND_DIR = ROOT / "public/brand"
APP_DIR = ROOT / "app"

BONE = (240, 238, 224)  # sampled from the logo: #f0eee0
CREAM_LUMINANCE = 236.0  # mean luminance of the cream letters

PAD = 6
WORD_BOX = (282 - PAD, 225 - PAD, 1309 + PAD + 1, 750 + PAD + 1)
C_BOX = (282 - PAD, 225 - PAD, 604, 750 + PAD + 1)

source = Image.open(SRC).convert("RGB")
alpha = np.clip(np.asarray(source).astype(np.float32).mean(axis=2) / CREAM_LUMINANCE, 0, 1)


def cutout(box):
    x0, y0, x1, y1 = box
    rgba = np.zeros((y1 - y0, x1 - x0, 4), dtype=np.uint8)
    rgba[..., 0:3] = BONE
    rgba[..., 3] = (alpha[y0:y1, x0:x1] * 255).round().astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def resized(img, width=None, height=None):
    if width:
        height = round(img.height * width / img.width)
    else:
        width = round(img.width * height / img.height)
    return img.resize((width, height), Image.LANCZOS)


def save_webp(img, path):
    img.save(path, "WEBP", quality=92, alpha_quality=100, method=6)
    print(f"{path.relative_to(ROOT)}  {img.width}x{img.height}  {path.stat().st_size / 1024:.1f} KB")


def save_png(img, path):
    img.save(path, "PNG", optimize=True)
    print(f"{path.relative_to(ROOT)}  {img.width}x{img.height}  {path.stat().st_size / 1024:.1f} KB")


def icon(size, rounded):
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    glyph = resized(cutout(C_BOX), height=round(size * 0.66))
    canvas.alpha_composite(glyph, ((size - glyph.width) // 2, (size - glyph.height) // 2))
    if rounded:
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=round(size * 0.22), fill=255)
        canvas.putalpha(mask)
    return canvas


def og_image():
    canvas = Image.new("RGB", (1200, 630), (0, 0, 0))
    word = resized(cutout(WORD_BOX), width=780)
    canvas.paste(word, ((1200 - word.width) // 2, (630 - word.height) // 2), word)
    return canvas


BRAND_DIR.mkdir(parents=True, exist_ok=True)

wordmark = cutout(WORD_BOX)
for width in (240, 480, 960):
    save_webp(resized(wordmark, width=width), BRAND_DIR / f"cult-wordmark-{width}.webp")

save_webp(resized(cutout(C_BOX), height=192), BRAND_DIR / "cult-mark.webp")

save_png(icon(512, rounded=True), APP_DIR / "icon.png")
save_png(icon(180, rounded=False).convert("RGB"), APP_DIR / "apple-icon.png")

og = og_image()
save_png(og, APP_DIR / "opengraph-image.png")
save_png(og, APP_DIR / "twitter-image.png")
