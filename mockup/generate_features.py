from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.join(os.path.dirname(__file__), "features")
W, H = 600, 400

BG = "#0F172A"
CARD_BG = "#1E293B"
ACCENT = "#0EA5E9"
GREEN = "#22C55E"
ORANGE = "#F59E0B"
RED = "#EF4444"
WHITE = "#FFFFFF"
GRAY_200 = "#E2E8F0"
GRAY_400 = "#94A3B8"
GRAY_500 = "#64748B"
GRAY_700 = "#334155"

try:
    font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
    font_sub = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
    font_body = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13)
    font_badge = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
except:
    font_title = font_sub = font_body = font_badge = ImageFont.load_default()

FEATURES = [
    {
        "name": "home",
        "title": "Home Page",
        "subtitle": "Landing page with role-based portal cards",
        "badge": "Public",
        "badge_color": GRAY_500,
        "desc": "Public landing page presenting Denti-Code brand with three role-based portal cards (Admin, Doctor, Patient) and language switcher.",
    },
    {
        "name": "login",
        "title": "Login",
        "subtitle": "Authentication with role-based routing",
        "badge": "Public",
        "badge_color": GRAY_500,
        "desc": "Split-screen login page with branded left panel and login form. Routes to role-specific dashboard on success.",
    },
    {
        "name": "admin-dashboard",
        "title": "Admin Dashboard",
        "subtitle": "Clinic overview statistics",
        "badge": "Admin",
        "badge_color": ACCENT,
        "desc": "Summary stats: total patients, doctors, appointments, today's count. Appointment breakdown by status.",
    },
    {
        "name": "admin-patients",
        "title": "Admin Patients",
        "subtitle": "Patient list & registration",
        "badge": "Admin",
        "badge_color": ACCENT,
        "desc": "Sortable patient table with register form. Detail page shows full profile with edit capability.",
    },
    {
        "name": "admin-doctors",
        "title": "Admin Doctors",
        "subtitle": "Doctor list management",
        "badge": "Admin",
        "badge_color": ACCENT,
        "desc": "Lists all clinic doctors with ID, name, email, phone, license, room, and active status.",
    },
    {
        "name": "admin-appointments",
        "title": "Admin Appointments",
        "subtitle": "All appointments overview",
        "badge": "Admin",
        "badge_color": ACCENT,
        "desc": "Lists all appointments sorted by date with patient, doctor, purpose, and status badge.",
    },
    {
        "name": "admin-inventory",
        "title": "Admin Inventory",
        "subtitle": "Material & stock management",
        "badge": "Admin",
        "badge_color": ACCENT,
        "desc": "Consultory management, material line registration, stock view with RECEIVE/REMOVE/CONSUME actions, movement history.",
    },
    {
        "name": "admin-system-services",
        "title": "System Services",
        "subtitle": "Microservice health monitoring",
        "badge": "Admin",
        "badge_color": ACCENT,
        "desc": "Health status of all backend microservices with color-coded badges, base URLs, and endpoint catalogs.",
    },
    {
        "name": "admin-settings",
        "title": "Admin Settings",
        "subtitle": "Organization locale settings",
        "badge": "Admin",
        "badge_color": ACCENT,
        "desc": "Change the organization's default locale/language from supported options.",
    },
    {
        "name": "admin-profile",
        "title": "Admin Profile",
        "subtitle": "User profile view",
        "badge": "Admin",
        "badge_color": ACCENT,
        "desc": "Shows logged-in admin's display name, email, user ID, and formatted auth roles.",
    },
    {
        "name": "doctor-dashboard",
        "title": "Doctor Dashboard",
        "subtitle": "Home page with stats & overview",
        "badge": "Doctor",
        "badge_color": GREEN,
        "desc": "Welcome section with quick links, upcoming appointments preview, and analytics with period selector.",
    },
    {
        "name": "doctor-appointments",
        "title": "Doctor Appointments",
        "subtitle": "My appointments & visits",
        "badge": "Doctor",
        "badge_color": GREEN,
        "desc": "Lists doctor's appointments with upcoming/past sections. Create new appointments via modal.",
    },
    {
        "name": "doctor-add-treatment",
        "title": "Add Treatment",
        "subtitle": "Register clinical procedures",
        "badge": "Doctor",
        "badge_color": GREEN,
        "desc": "Form for procedure type, quantity, price, tooth, surfaces, anesthesia, and inventory materials with stock indicators.",
    },
    {
        "name": "doctor-calendar",
        "title": "Doctor Calendar",
        "subtitle": "Multi-view appointment calendar",
        "badge": "Doctor",
        "badge_color": GREEN,
        "desc": "Week/Month/Day views with navigation. Double-click to create appointments. Appointment count per period.",
    },
    {
        "name": "doctor-patients",
        "title": "Doctor Patients",
        "subtitle": "Treated patients list",
        "badge": "Doctor",
        "badge_color": GREEN,
        "desc": "Lists doctor's treated patients with visit count, last visit date, and actions to open/edit.",
    },
    {
        "name": "doctor-patient-detail",
        "title": "Patient Detail",
        "subtitle": "Full patient info & payments",
        "badge": "Doctor",
        "badge_color": GREEN,
        "desc": "Demographics, medical history, payments summary, payment registration, and visits history table.",
    },
    {
        "name": "doctor-profile",
        "title": "Doctor Profile",
        "subtitle": "Profile & avatar management",
        "badge": "Doctor",
        "badge_color": GREEN,
        "desc": "User profile info and clinic doctor card with avatar upload/remove capability.",
    },
    {
        "name": "patient-dashboard",
        "title": "Patient Dashboard",
        "subtitle": "Home with upcoming visits",
        "badge": "Patient",
        "badge_color": ORANGE,
        "desc": "Patient info summary, upcoming appointments preview cards, and quick links to appointments and profile.",
    },
    {
        "name": "patient-appointments",
        "title": "Patient Appointments",
        "subtitle": "My appointments with actions",
        "badge": "Patient",
        "badge_color": ORANGE,
        "desc": "Upcoming and past appointments as cards. Accept, reschedule, or cancel upcoming appointments.",
    },
    {
        "name": "patient-profile",
        "title": "Patient Profile",
        "subtitle": "View & edit personal info",
        "badge": "Patient",
        "badge_color": ORANGE,
        "desc": "View all profile fields in read-only mode with edit button to update name, email, phone, DOB, gender, address, medical history.",
    },
    {
        "name": "notifications",
        "title": "Notifications",
        "subtitle": "Real-time notification system",
        "badge": "Cross",
        "badge_color": "#8B5CF6",
        "desc": "Bell icon with unread count badge. Dropdown shows recent notifications with mark-read and mark-all-read. Polls every 30s.",
    },
    {
        "name": "language-switcher",
        "title": "Language Switcher",
        "subtitle": "Internationalization (EN/ES)",
        "badge": "Cross",
        "badge_color": "#8B5CF6",
        "desc": "Dropdown to switch between English and Spanish. Syncs preference with backend for authenticated users, localStorage for guests.",
    },
    {
        "name": "session-management",
        "title": "Session Management",
        "subtitle": "Auto-logout & token persistence",
        "badge": "Cross",
        "badge_color": "#8B5CF6",
        "desc": "Reads auth cookie on load, restores session, monitors activity, auto-logouts on idle, proactively refreshes token.",
    },
]

ICONS = {
    "home": "\u2302",
    "login": "\u26BF",
    "admin": "\u2699",
    "doctor": "\u2695",
    "patient": "\u2630",
    "notifications": "\uD83D\uDD14",
    "language": "\uD83C\uDF10",
    "session": "\uD83D\uDD12",
}

def get_icon(name):
    key = name.split("-")[0]
    if key in ("admin",):
        if "inventory" in name: return "\u2693"
        if "services" in name: return "\u26A1"
        if "settings" in name: return "\u2699"
        if "profile" in name: return "\uD83D\uDC64"
        if "dashboard" in name: return "\u25A3"
        if "patients" in name: return "\u2630"
        if "doctors" in name: return "\u2695"
        if "appointments" in name: return "\uD83D\uDCC5"
        return "\u2699"
    if key == "doctor":
        if "dashboard" in name: return "\u25A3"
        if "appointments" in name: return "\uD83D\uDCC5"
        if "add-treatment" in name: return "\uD83D\uDC8A"
        if "calendar" in name: return "\uD83D\uDCC5"
        if "patients" in name and "detail" in name: return "\uD83D\uDC64"
        if "patients" in name: return "\u2630"
        if "profile" in name: return "\uD83D\uDC64"
        return "\u2695"
    if key == "patient":
        if "dashboard" in name: return "\u25A3"
        if "appointments" in name: return "\uD83D\uDCC5"
        if "profile" in name: return "\uD83D\uDC64"
        return "\u2630"
    if key == "login": return "\u26BF"
    if key == "home": return "\u2302"
    if key == "notifications": return "\uD83D\uDD14"
    if key == "language": return "\uD83C\uDF10"
    if key == "session": return "\uD83D\uDD12"
    return "\u2B1A"

for feat in FEATURES:
    name = feat["name"]
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Accent top bar
    draw.rectangle([(0, 0), (W, 8)], fill=feat["badge_color"])

    # Feature icon circle
    icon = get_icon(name)
    cx, cy = 60, 80
    draw.ellipse([(cx - 32, cy - 32), (cx + 32, cy + 32)], fill=feat["badge_color"] + "30")
    draw.text((cx - 14, cy - 14), icon, fill=feat["badge_color"], font=font_title)

    # Title
    draw.text((120, 52), feat["title"], fill=WHITE, font=font_title)
    draw.text((120, 90), feat["subtitle"], fill=GRAY_400, font=font_sub)

    # Badge
    badge = feat["badge"]
    bw = draw.textlength(badge, font=font_badge) + 20
    draw.rounded_rectangle([(20, 140), (20 + bw, 166)], radius=8, fill=feat["badge_color"])
    draw.text((30, 144), badge, fill=WHITE, font=font_badge)

    # Description box
    dx, dy = 20, 190
    draw.rounded_rectangle([(dx, dy), (W - 20, dy + 80)], radius=10, fill=CARD_BG)
    draw.text((dx + 16, dy + 14), "Description", fill=GRAY_500, font=font_sub)

    desc = feat["desc"]
    lines = []
    words = desc.split()
    line = ""
    for w in words:
        test = line + " " + w if line else w
        if draw.textlength(test, font=font_body) < W - 72:
            line = test
        else:
            lines.append(line)
            line = w
    if line:
        lines.append(line)

    y_off = dy + 44
    for l in lines:
        draw.text((dx + 16, y_off), l, fill=GRAY_200, font=font_body)
        y_off += 18

    # Portal info
    draw.rounded_rectangle([(dx, dy + 100), (W - 20, dy + 140)], radius=10, fill=CARD_BG)
    draw.text((dx + 16, dy + 108), "Portal: ", fill=GRAY_500, font=font_sub)
    draw.text((dx + 80, dy + 108), feat["badge"], fill=feat["badge_color"], font=font_sub)

    # Decorative bottom dots
    for i in range(3):
        dot_x = W // 2 - 20 + i * 20
        draw.ellipse([(dot_x, H - 30), (dot_x + 8, H - 22)], fill=feat["badge_color"])

    path = os.path.join(OUT, f"{name}.png")
    img.save(path)
    print(f"Generated: {path}")

print(f"\nDone! {len(FEATURES)} feature images generated.")
