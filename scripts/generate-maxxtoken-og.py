#!/usr/bin/env python3
"""Generate MaxxToken Open Graph / Twitter card image (1200x630)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "maxxtoken" / "og.png"
ICON = ROOT / "public" / "maxxtoken" / "icon-1.png"

W, H = 1200, 630

BG = (10, 11, 9)
PANEL = (18, 19, 16)
LINE = (37, 39, 31)
GREEN = (182, 242, 74)
GREEN_DIM = (143, 194, 58)
TEXT = (244, 245, 242)
MUTED = (139, 143, 132)
AMBER = (240, 160, 48)


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/SFNSDisplay-Bold.otf" if bold else "/System/Library/Fonts/SFNSDisplay-Regular.otf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
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


def progress_bar(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    width: int,
    height: int,
    pct: float,
) -> None:
    rounded_rect(draw, (x, y, x + width, y + height), height // 2, LINE)
    fill_w = max(height, int(width * pct / 100))
    if fill_w > 0:
        rounded_rect(draw, (x, y, x + fill_w, y + height), height // 2, GREEN)


def main() -> None:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img, "RGBA")

    # Ambient glow
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((720, -80, 1180, 380), fill=(182, 242, 74, 28))
    glow_draw.ellipse((-120, 320, 420, 720), fill=(182, 242, 74, 12))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(img, "RGBA")

    draw_dot_grid(draw, W, H)

    title_font = load_font(54, bold=True)
    sub_font = load_font(28)
    label_font = load_font(18)
    small_font = load_font(15)
    tiny_font = load_font(13)
    stat_font = load_font(34, bold=True)

    # Logo
    icon = Image.open(ICON).convert("RGBA")
    icon = icon.resize((96, 96), Image.Resampling.LANCZOS)
    img.paste(icon, (72, 72), icon)

    draw.text((188, 78), "Maxx", font=title_font, fill=TEXT)
    token_w = draw.textlength("Maxx", font=title_font)
    draw.text((188 + token_w, 78), "Token", font=title_font, fill=GREEN)

    draw.text((72, 188), "You paid for the tokens.", font=sub_font, fill=TEXT)
    draw.text((72, 228), "Go spend them.", font=sub_font, fill=GREEN)

    draw.text(
        (72, 292),
        "Menu bar tracker for Claude, ChatGPT, Cursor & more",
        font=label_font,
        fill=MUTED,
    )
    draw.text((72, 326), "Pay what you want · Private by design", font=label_font, fill=MUTED)

    # Stat pills
    pill_y = 392
    for i, (label, value, color) in enumerate(
        [
            ("SPENT", "$91", GREEN),
            ("LEFT", "$443", AMBER),
            ("macOS", "Menu bar", MUTED),
        ]
    ):
        x = 72 + i * 168
        rounded_rect(draw, (x, pill_y, x + 150, pill_y + 58), 12, PANEL, LINE)
        draw.text((x + 14, pill_y + 10), label, font=tiny_font, fill=MUTED)
        draw.text((x + 14, pill_y + 28), value, font=stat_font if i < 2 else load_font(22, bold=True), fill=color)

    # Popover mock
    card_x, card_y, card_w, card_h = 640, 56, 500, 518
    rounded_rect(draw, (card_x, card_y, card_x + card_w, card_y + card_h), 22, PANEL, LINE)

    # Header
    icon_sm = icon.resize((34, 34), Image.Resampling.LANCZOS)
    img.paste(icon_sm, (card_x + 18, card_y + 18), icon_sm)
    draw.text((card_x + 62, card_y + 20), "MaxxToken", font=load_font(20, bold=True), fill=TEXT)
    draw.text((card_x + 62, card_y + 44), "May cycle · 9d left", font=tiny_font, fill=MUTED)

    # Summary strip
    summary_y = card_y + 78
    rounded_rect(draw, (card_x + 16, summary_y, card_x + card_w - 16, summary_y + 92), 14, (16, 17, 14), LINE)
    draw.text((card_x + 30, summary_y + 16), "$91", font=load_font(28, bold=True), fill=GREEN)
    draw.text((card_x + 30, summary_y + 52), "spent value", font=tiny_font, fill=MUTED)
    draw.text((card_x + 190, summary_y + 16), "$443", font=load_font(28, bold=True), fill=AMBER)
    draw.text((card_x + 190, summary_y + 52), "left to maxx", font=tiny_font, fill=MUTED)
    progress_bar(draw, card_x + 30, summary_y + 72, card_w - 60, 6, 17)

    providers = [
        ("Claude", "Pro 20x · $200/mo", 24),
        ("Cursor", "Pro · $70/mo", 1),
        ("Grok", "SuperGrok · $300/mo", 36),
    ]

    row_y = summary_y + 108
    for name, plan, pct in providers:
        rounded_rect(draw, (card_x + 16, row_y, card_x + card_w - 16, row_y + 98), 12, (20, 21, 18), LINE)
        draw.text((card_x + 28, row_y + 14), name, font=load_font(17, bold=True), fill=TEXT)
        draw.text((card_x + 28, row_y + 38), plan, font=tiny_font, fill=MUTED)
        pct_text = f"{pct}%"
        pct_w = draw.textlength(pct_text, font=load_font(24, bold=True))
        draw.text((card_x + card_w - 40 - pct_w, row_y + 16), pct_text, font=load_font(24, bold=True), fill=TEXT)
        draw.text((card_x + card_w - 58, row_y + 44), "used", font=tiny_font, fill=MUTED)
        progress_bar(draw, card_x + 28, row_y + 68, card_w - 72, 5, pct)
        row_y += 108

    # Footer strip
    foot_y = card_y + card_h - 52
    draw.line((card_x + 16, foot_y, card_x + card_w - 16, foot_y), fill=LINE, width=1)
    for i, label in enumerate(["LEFT $443", "SPENT $91", "PLANS 5"]):
        x = card_x + 18 + i * 118
        rounded_rect(draw, (x, foot_y + 10, x + 104, foot_y + 34), 7, (16, 17, 14), LINE)
        draw.text((x + 8, foot_y + 16), label, font=tiny_font, fill=TEXT)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print(f"Wrote {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
