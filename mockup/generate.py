from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.join(os.path.dirname(__file__), "home.png")
W, H = 1280, 800

# Colors
BG = "#F1F5F9"
SIDEBAR = "#0F172A"
SIDEBAR_HOVER = "#1E293B"
ACCENT = "#0EA5E9"
WHITE = "#FFFFFF"
GRAY_100 = "#F8FAFC"
GRAY_200 = "#E2E8F0"
GRAY_400 = "#94A3B8"
GRAY_500 = "#64748B"
GRAY_700 = "#334155"
GRAY_900 = "#0F172A"
GREEN = "#22C55E"
ORANGE = "#F59E0B"
RED = "#EF4444"
CARD_BG = "#FFFFFF"

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

try:
    font_lg = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
    font_md = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
    font_sm = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
    font_xs = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 11)
    font_icon = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
except:
    font_lg = ImageFont.load_default()
    font_md = font_sm = font_xs = font_icon = font_lg

SIDE_W = 220

# --- SIDEBAR ---
draw.rectangle([(0, 0), (SIDE_W, H)], fill=SIDEBAR)

# Logo area
draw.rectangle([(0, 0), (SIDE_W, 70)], fill="#1E293B")
draw.text((30, 22), "Denti-Code", fill=ACCENT, font=font_md)
draw.text((30, 48), "Dental Clinic", fill=GRAY_500, font=font_xs)

logo_items = [
    ("\u25A3", "Dashboard", True),
    ("\u25CB", "Appointments", False),
    ("\u2630", "Patients", False),
    ("\u2605", "Doctors", False),
    ("\u2699", "Settings", False),
]
for i, (icon, label, active) in enumerate(logo_items):
    y = 90 + i * 48
    if active:
        draw.rectangle([(0, y), (SIDE_W, y + 44)], fill=ACCENT + "20")
        draw.rectangle([(0, y), (4, y + 44)], fill=ACCENT)
    draw.text((24, y + 10), icon, fill=WHITE if active else GRAY_400, font=font_icon)
    draw.text((54, y + 12), label, fill=WHITE if active else GRAY_400, font=font_sm)

# User at bottom
draw.line([(20, H - 100), (SIDE_W - 20, H - 100)], fill=GRAY_700)
draw.ellipse([(30, H - 80), (60, H - 50)], fill=GRAY_400)
draw.text((72, H - 76), "Dr. Sarah Chen", fill=WHITE, font=font_xs)
draw.text((72, H - 58), "Administrator", fill=GRAY_500, font=font_xs)

# --- TOP BAR ---
draw.rectangle([(SIDE_W, 0), (W, 64)], fill=WHITE)
draw.line([(SIDE_W, 64), (W, 64)], fill=GRAY_200)
draw.text((SIDE_W + 28, 20), "Dashboard", fill=GRAY_900, font=font_md)

# Top bar right icons
for ix, label in enumerate(["Today: Jul 3, 2026"]):
    w = draw.textlength(label, font=font_xs)
    draw.text((W - w - 24, 24), label, fill=GRAY_500, font=font_xs)

# --- STAT CARDS ---
card_data = [
    ("Total Patients", "1,284", "+12%", GREEN),
    ("App. Today", "18", "+3", GREEN),
    ("Upcoming", "42", "-2", RED),
    ("Revenue", "$48,250", "+8.3%", GREEN),
]
cx = SIDE_W + 28
cw = (W - SIDE_W - 88) // 4
for i, (title, value, change, color) in enumerate(card_data):
    x = cx + i * (cw + 12)
    draw.rounded_rectangle([(x, 84), (x + cw, 160)], radius=10, fill=CARD_BG)
    draw.text((x + 16, 96), title, fill=GRAY_500, font=font_xs)
    draw.text((x + 16, 114), value, fill=GRAY_900, font=font_lg)
    draw.text((x + cw - 16 - draw.textlength(change, font=font_xs), 122), change, fill=color, font=font_xs)

# --- MAIN CONTENT LAYOUT ---
# Left column: Appointments list
lx = SIDE_W + 28
ly = 184
lw = (W - SIDE_W - 64) * 3 // 5
draw.rounded_rectangle([(lx, ly), (lx + lw, ly + 280)], radius=10, fill=CARD_BG)
draw.text((lx + 20, ly + 16), "Today's Appointments", fill=GRAY_900, font=font_md)

apps = [
    ("09:00", "Alice Johnson", "Checkup", "\u2713"),
    ("10:00", "Bob Martinez", "Root Canal", "..."),
    ("11:00", "Carol Smith", "Cleaning", "\u2713"),
    ("13:00", "David Lee", "Crown Fitting", "..."),
    ("14:30", "Eva Wong", "Extraction", "\u2713"),
    ("15:30", "Frank Brown", "Consultation", "..."),
]
for j, (time, name, proc, status) in enumerate(apps):
    y = ly + 54 + j * 34
    draw.text((lx + 20, y), time, fill=GRAY_900, font=font_sm)
    draw.text((lx + 90, y), name, fill=GRAY_700, font=font_sm)
    draw.text((lx + 240, y), proc, fill=GRAY_500, font=font_xs)
    c = GREEN if status == "\u2713" else GRAY_400
    draw.text((lx + lw - 36, y), status, fill=c, font=font_sm)
    if j < len(apps) - 1:
        draw.line([(lx + 20, y + 30), (lx + lw - 20, y + 30)], fill=GRAY_200)

# Right column: Quick actions & Patient of the Day
rx = lx + lw + 12
rw = W - SIDE_W - 64 - lw - 12
draw.rounded_rectangle([(rx, ly), (rx + rw, ly + 280)], radius=10, fill=CARD_BG)
draw.text((rx + 20, ly + 16), "Quick Actions", fill=GRAY_900, font=font_md)

actions = ["New Appointment", "Register Patient", "View Reports", "Manage Inventory"]
for j, a in enumerate(actions):
    ay = ly + 56 + j * 48
    bcolor = ACCENT if j == 0 else GRAY_200
    draw.rounded_rectangle([(rx + 16, ay), (rx + rw - 16, ay + 36)], radius=6, fill=bcolor)
    tc = WHITE if j == 0 else GRAY_700
    draw.text((rx + 28, ay + 8), a, fill=tc, font=font_sm)

# Patient of the day section (below quick actions)
draw.text((rx + 20, ly + 256 + 16), "Patient of the Day", fill=GRAY_500, font=font_xs)

# --- BOTTOM ROW: Role Portals ---
por = ly + 296
pw = (W - SIDE_W - 64) // 3
roles = [
    ("Admin Portal", "Full access to all\nsystem features", SIDEBAR, ACCENT),
    ("Doctor Portal", "Manage appointments,\ntreatments & patients", GRAY_900, GREEN),
    ("Patient Portal", "View visits, history\n& manage profile", GRAY_900, ORANGE),
]
for i, (title, desc, bg, accent_c) in enumerate(roles):
    px = cx + i * (pw + 12)
    draw.rounded_rectangle([(px, por), (px + pw, por + 180)], radius=10, fill=CARD_BG)
    draw.rounded_rectangle([(px, por), (px + pw, por + 8)], radius=10, fill=accent_c)
    draw.rounded_rectangle([(px, por), (px + pw, por + 8)], radius=10, fill=accent_c)
    draw.ellipse([(px + 20, por + 24), (px + 52, por + 56)], fill=accent_c)
    draw.text((px + 62, por + 32), title, fill=GRAY_900, font=font_md)
    draw.text((px + 20, por + 74), desc, fill=GRAY_500, font=font_sm)
    draw.rounded_rectangle([(px + 16, por + 134), (px + pw - 16, por + 164)], radius=6, fill=accent_c)
    draw.text((px + pw // 2 - draw.textlength("Open", font=font_sm)//2, por + 144), "Open", fill=WHITE, font=font_sm)

img.save(OUT)
print(f"Saved to {OUT}")
