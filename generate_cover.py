import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def make_rounded_card(content_img, title_text, tag_text, tag_color='#3b82f6', target_h=None):
    pad = 10
    header_h = 38
    cw = content_img.width + pad * 2
    
    if target_h:
        ch = target_h
    else:
        ch = content_img.height + header_h + pad * 2

    card = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(card)

    # Card background
    cdraw.rounded_rectangle([0, 0, cw, ch], radius=16, fill='#0d1526', outline='#22314d', width=1)
    
    # Top header bar
    cdraw.rounded_rectangle([1, 1, cw - 1, header_h + pad], radius=15, fill='#162035')
    cdraw.rectangle([1, 15, cw - 1, header_h + pad], fill='#162035')
    cdraw.line([(1, header_h + pad), (cw - 1, header_h + pad)], fill='#22314d', width=1)

    # Window controls (mac-style dots)
    dots = [('#ef4444', 18), ('#f59e0b', 36), ('#10b981', 54)]
    cy = (header_h + pad) // 2
    for color, dx in dots:
        cdraw.ellipse([dx - 5, cy - 5, dx + 5, cy + 5], fill=color)

    # Fonts
    try:
        font_title = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 13)
        font_tag = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 11)
    except:
        font_title = ImageFont.load_default()
        font_tag = font_title

    # Title text
    cdraw.text((75, cy - 9), title_text, font=font_title, fill='#f8fafc')

    # Feature tag pill on top-right of header
    tb = cdraw.textbbox((0, 0), tag_text, font=font_tag)
    tw = tb[2] - tb[0]
    tag_w = tw + 18
    tag_x = cw - tag_w - 14
    tag_y = cy - 11
    cdraw.rounded_rectangle([tag_x, tag_y, tag_x + tag_w, tag_y + 22], radius=11, fill='#1e293b', outline=tag_color, width=1)
    cdraw.text((tag_x + 9, tag_y + 3), tag_text, font=font_tag, fill=tag_color)

    # Content image pasting
    content_rgba = content_img.convert('RGBA')
    # If target_h is specified, crop or center
    avail_h = ch - (header_h + pad * 2)
    if content_rgba.height > avail_h:
        content_rgba = content_rgba.crop((0, 0, content_rgba.width, avail_h))
    
    card.paste(content_rgba, (pad, header_h + pad))

    return card

def add_card_shadow(base_img, card, x, y):
    shadow_pad = 24
    shadow = Image.new('RGBA', (card.width + shadow_pad * 2, card.height + shadow_pad * 2), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle([shadow_pad, shadow_pad + 8, shadow_pad + card.width, shadow_pad + card.height + 8], radius=18, fill=(0, 0, 0, 180))
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    
    base_img.paste(shadow, (x - shadow_pad, y - shadow_pad), shadow)
    base_img.paste(card, (x, y), card)

def build_banner():
    canvas_w = 1600
    canvas_h = 1040

    img = Image.new('RGB', (canvas_w, canvas_h), color='#080c14')
    draw = ImageDraw.Draw(img)

    # Gradient background
    for y in range(canvas_h):
        r = int(7 + (14 - 7) * (y / canvas_h))
        g = int(11 + (22 - 11) * (y / canvas_h))
        b = int(18 + (38 - 18) * (y / canvas_h))
        draw.line([(0, y), (canvas_w, y)], fill=(r, g, b))

    # Glows
    glow = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([canvas_w//2 - 450, 20, canvas_w//2 + 450, 500], fill=(37, 99, 235, 45))
    gdraw.ellipse([80, 400, 850, 1000], fill=(14, 165, 233, 22))
    gdraw.ellipse([800, 450, 1550, 1000], fill=(99, 102, 241, 25))
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    img.paste(glow, (0, 0), glow)

    # Grid dots
    dot_layer = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    ddraw = ImageDraw.Draw(dot_layer)
    for x in range(16, canvas_w, 36):
        for y in range(16, canvas_h, 36):
            ddraw.point((x, y), fill=(255, 255, 255, 12))
    img.paste(dot_layer, (0, 0), dot_layer)

    # Fonts
    f_title = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 44)
    f_badge = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 12)
    f_sub = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 16)

    # Header
    hy = 26
    icon_sz = 48
    icon = Image.open('icons/icon128.png').convert('RGBA').resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
    imask = Image.new('L', (icon_sz, icon_sz), 0)
    ImageDraw.Draw(imask).rounded_rectangle([0, 0, icon_sz, icon_sz], radius=11, fill=255)

    title = "EWU TOOLKIT"
    tb = draw.textbbox((0, 0), title, font=f_title)
    tw = tb[2] - tb[0]
    badge_text = "STUDENT UTILITY SUITE"
    bb = draw.textbbox((0, 0), badge_text, font=f_badge)
    bw = bb[2] - bb[0]
    badge_box_w = bw + 22
    
    total_hw = icon_sz + 16 + tw + 18 + badge_box_w
    hx = (canvas_w - total_hw) // 2

    img.paste(icon, (hx, hy - 2), imask)
    draw.text((hx + icon_sz + 16, hy - 8), title, font=f_title, fill='#ffffff')

    bx = hx + icon_sz + 16 + tw + 18
    by = hy + 8
    draw.rounded_rectangle([bx, by, bx + badge_box_w, by + 26], radius=13, fill='#1e293b', outline='#3b82f6', width=1)
    draw.text((bx + 11, by + 5), badge_text, font=f_badge, fill='#60a5fa')

    sub = "Visual Class Routine  •  Unhidden Faculty Info  •  Seat Availability  •  Accounts Ledger Breakdown"
    sb = draw.textbbox((0, 0), sub, font=f_sub)
    draw.text(((canvas_w - (sb[2] - sb[0])) // 2, hy + 50), sub, font=f_sub, fill='#94a3b8')

    # Card 1: Faculty Card (Tier 1 Left)
    f_raw = Image.open('icons/faculty name tab.png')
    f_crop = f_raw.crop((15, 68, f_raw.width - 15, 430))
    target_fw = 730
    target_fh = int(f_crop.height * (target_fw / f_crop.width))
    f_resized = f_crop.resize((target_fw, target_fh), Image.Resampling.LANCZOS)
    
    # Card 2: Ledger Card (Tier 1 Right)
    l_raw = Image.open('icons/account ledger.png')
    # Crop header + 4 bento cards + first rows (y=98 to 445)
    l_crop = l_raw.crop((18, 98, l_raw.width - 18, 445))
    target_lw = 730
    target_lh = int(l_crop.height * (target_lw / l_crop.width))
    l_resized = l_crop.resize((target_lw, target_lh), Image.Resampling.LANCZOS)

    # Standardize Tier 1 card height for aesthetic balance
    tier1_card_h = max(target_fh, target_lh) + 48 + 20
    card_faculty = make_rounded_card(f_resized, "Class Schedule — Unhidden Faculty Names, Initials & Emails", "FACULTY INFO", '#38bdf8', target_h=tier1_card_h)
    card_ledger = make_rounded_card(l_resized, "Accounts Ledger — Financial Breakdown & Outstanding Dues", "ACCOUNTS LEDGER", '#a855f7', target_h=tier1_card_h)

    # Card 3: Routine Card (Tier 2 Center)
    r_raw = Image.open('icons/EWU_Class_Routine_Fall-2026.png')
    r_crop = r_raw.crop((30, 615, r_raw.width - 30, 1445))
    target_rw = 1496
    target_rh = int(r_crop.height * (target_rw / r_crop.width))
    r_resized = r_crop.resize((target_rw, target_rh), Image.Resampling.LANCZOS)
    card_routine = make_rounded_card(r_resized, "Interactive Visual Weekly Class Routine Timetable & Conflict Detector", "WEEKLY ROUTINE", '#22c55e')

    # Placements
    tier1_y = 102
    gap = 20
    add_card_shadow(img, card_faculty, 44, tier1_y)
    add_card_shadow(img, card_ledger, 44 + card_faculty.width + gap, tier1_y)

    tier2_y = tier1_y + tier1_card_h + 18
    add_card_shadow(img, card_routine, (canvas_w - card_routine.width) // 2, tier2_y)

    # Save as both jpg and png for backwards compatibility
    img.save('icons/readme_cover.jpg', quality=96, optimize=True)
    img.save('icons/readme_cover.png', optimize=True)
    print(f"Banner generated successfully: {canvas_w}x{canvas_h}")

if __name__ == '__main__':
    build_banner()
