#!/usr/bin/env python3
"""Generate MaxxToken Open Graph / Twitter card image (1200x630)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "maxxtoken" / "og-v4.png"
ICON = ROOT / "public" / "maxxtoken" / "icon-1.png"
SCREENSHOT = ROOT / "public" / "maxxtoken" / "app-screenshot.png"

W, H = 1200, 630

BG = (10, 11, 9)
PANEL = (18, 19, 16)
LINE = (37, 39, 31)
GREEN = (182, 242, 74)
TEXT = (244, 245, 242)
MUTED = (139, 143, 132)


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/SFNSDisplay-Bold.otf" if bold else "/System/Library/Fonts/SFNSDisplay-Regular.otf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_dot_grid(draw: ImageDraw.ImageDraw, width: int, height: int) -> None:
    for x in range(0, width, 24):
        for y in range(0, height, 24):
            draw.point((x, y), fill=(255, 255, 255, 18))


def rounded_rect(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    radius: int,
    fill: tuple[int, ...],
    outline: tuple[int, ...] | None = None,
) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=1 if outline else 0)


def crop_ui_panel(screenshot: Image.Image) -> Image.Image:
    """Trim the screenshot to the app popover window."""
    rgba = screenshot.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()

    threshold = 28
    min_x, min_y, max_x, max_y = width, height, 0, 0
    found = False

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a < 20:
                continue
            if r + g + b > threshold:
                found = True
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)

    if not found:
        return screenshot

    pad = 8
    box = (
        max(0, min_x - pad),
        max(0, min_y - pad),
        min(width, max_x + pad),
        min(height, max_y + pad),
    )
    return screenshot.crop(box)


def add_shadow(image: Image.Image, blur: int = 24, offset: tuple[int, int] = (0, 14)) -> Image.Image:
    shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    mask = Image.new("L", image.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((0, 0, image.size[0], image.size[1]), 22, fill=180)
    shadow.paste((0, 0, 0, 170), (0, 0), mask)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    canvas = Image.new("RGBA", (image.size[0] + 40, image.size[1] + 40), (0, 0, 0, 0))
    canvas.alpha_composite(shadow, (20 + offset[0], 20 + offset[1]))
    canvas.alpha_composite(image, (20, 20))
    return canvas


def main() -> None:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img, "RGBA")

    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((860, -120, 1260, 280), fill=(182, 242, 74, 24))
    glow_draw.ellipse((-80, 360, 360, 700), fill=(182, 242, 74, 10))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(img, "RGBA")
    draw_dot_grid(draw, W, H)

    title_font = load_font(52, bold=True)
    sub_font = load_font(26)
    label_font = load_font(17)
    cta_font = load_font(22, bold=True)

    icon = Image.open(ICON).convert("RGBA").resize((88, 88), Image.Resampling.LANCZOS)
    img.paste(icon, (64, 58), icon)

    draw.text((164, 62), "Maxx", font=title_font, fill=TEXT)
    token_w = draw.textlength("Maxx", font=title_font)
    draw.text((164 + token_w, 62), "Token", font=title_font, fill=GREEN)

    draw.text((64, 168), "You paid for the tokens.", font=sub_font, fill=TEXT)
    draw.text((64, 206), "Go spend them.", font=sub_font, fill=GREEN)

    draw.text(
        (64, 268),
        "Menu bar tracker for Claude, ChatGPT,\nCursor, Kimi & Grok",
        font=label_font,
        fill=MUTED,
    )

    # CTA button
    cta_x, cta_y, cta_w, cta_h = 64, 360, 330, 58
    rounded_rect(draw, (cta_x, cta_y, cta_x + cta_w, cta_y + cta_h), 14, GREEN)
    cta_text = "Download for Mac  →"
    cta_tw = draw.textlength(cta_text, font=cta_font)
    draw.text((cta_x + (cta_w - cta_tw) / 2, cta_y + 16), cta_text, font=cta_font, fill=BG)

    draw.text((64, 434), "Pay what you want · Private by design", font=label_font, fill=MUTED)

    # Real app UI
    panel = crop_ui_panel(Image.open(SCREENSHOT).convert("RGBA"))
    target_h = 560
    scale = target_h / panel.height
    target_w = int(panel.width * scale)
    panel = panel.resize((target_w, target_h), Image.Resampling.LANCZOS)

    mask = Image.new("L", panel.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, panel.size[0], panel.size[1]), 22, fill=255)
    panel.putalpha(mask)

    panel_with_shadow = add_shadow(panel)
    paste_x = W - panel_with_shadow.size[0] - 28
    paste_y = (H - panel_with_shadow.size[1]) // 2 + 6
    img.paste(panel_with_shadow, (paste_x, paste_y), panel_with_shadow)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print(f"Wrote {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
