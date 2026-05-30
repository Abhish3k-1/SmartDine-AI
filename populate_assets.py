import os

base_dir = "c:/coding files/college project(codex)/assets"

# Directories to populate
dirs = [
    "images/avatars",
    "images/food",
    "images/logo",
    "images/qr",
    "icons"
]

for d in dirs:
    os.makedirs(os.path.join(base_dir, d), exist_ok=True)

# 1. Generate Avatars (Waiters)
avatar_svg = """<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill="{color}"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40" fill="#ffffff" font-family="Arial, sans-serif">{initial}</text>
</svg>"""

waiters = [("rahul", "R", "#ef4444"), ("amit", "A", "#3b82f6"), ("priya", "P", "#10b981"), ("sarah", "S", "#f59e0b")]
for name, initial, color in waiters:
    with open(os.path.join(base_dir, f"images/avatars/{name}.svg"), "w") as f:
        f.write(avatar_svg.format(color=color, initial=initial))

# 2. Generate Logo
logo_svg = """<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" rx="40" fill="#1a1a1a"/>
  <circle cx="100" cy="100" r="60" fill="none" stroke="#f59e0b" stroke-width="12"/>
  <path d="M 70,100 Q 100,60 130,100 Q 100,140 70,100 Z" fill="#f59e0b"/>
</svg>"""
with open(os.path.join(base_dir, "images/logo/logo.svg"), "w") as f:
    f.write(logo_svg)

# 3. Generate QR Placeholder
qr_svg = """<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="#ffffff"/>
  <rect x="30" y="30" width="60" height="60" fill="none" stroke="#000" stroke-width="15"/>
  <rect x="210" y="30" width="60" height="60" fill="none" stroke="#000" stroke-width="15"/>
  <rect x="30" y="210" width="60" height="60" fill="none" stroke="#000" stroke-width="15"/>
  <!-- some random blocks -->
  <rect x="120" y="30" width="30" height="30" fill="#000"/>
  <rect x="180" y="60" width="30" height="30" fill="#000"/>
  <rect x="30" y="120" width="30" height="30" fill="#000"/>
  <rect x="90" y="150" width="60" height="30" fill="#000"/>
  <rect x="210" y="150" width="30" height="90" fill="#000"/>
  <rect x="120" y="210" width="60" height="60" fill="#000"/>
</svg>"""
with open(os.path.join(base_dir, "images/qr/table_qr_template.svg"), "w") as f:
    f.write(qr_svg)

# 4. Generate Food Placeholders
food_svg = """<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#2d2d2d"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="60" fill="#666666">🍽️</text>
  <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="#666666" font-family="sans-serif">{name}</text>
</svg>"""

foods = ["placeholder_starter", "placeholder_main", "placeholder_dessert", "placeholder_drink"]
for food in foods:
    with open(os.path.join(base_dir, f"images/food/{food}.svg"), "w", encoding="utf-8") as f:
        f.write(food_svg.format(name=food.replace('_', ' ').title()))

# 5. Icons
icon_svg = """<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"></circle>
  <line x1="12" y1="8" x2="12" y2="16"></line>
  <line x1="8" y1="12" x2="16" y2="12"></line>
</svg>"""
for icon in ["add", "cart", "user", "settings", "menu"]:
    with open(os.path.join(base_dir, f"icons/{icon}.svg"), "w") as f:
        f.write(icon_svg)

print("Successfully populated empty directories with high-quality SVG placeholder files.")
