import os
import urllib.request

base_dir = "c:/coding files/college project(codex)/assets"

# 1. Download Avatars (Real people faces from Unsplash)
avatars = {
    "rahul": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80",  # Men portrait
    "amit": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",   # Men portrait
    "priya": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",  # Women portrait
    "sarah": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"   # Women portrait
}

print("Downloading realistic avatars...")
for name, url in avatars.items():
    try:
        urllib.request.urlretrieve(url, os.path.join(base_dir, f"images/avatars/{name}.jpg"))
    except Exception as e:
        print(f"Failed to download avatar {name}: {e}")

# 2. Download Food Placeholders (Real food images instead of cutlery SVGs)
foods = {
    "placeholder_starter": "https://images.unsplash.com/photo-1599487405705-81781c81804c?w=400&q=80",
    "placeholder_main": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80",
    "placeholder_dessert": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80",
    "placeholder_drink": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80"
}

print("Downloading realistic food placeholders...")
for name, url in foods.items():
    try:
        urllib.request.urlretrieve(url, os.path.join(base_dir, f"images/food/{name}.jpg"))
    except Exception as e:
        print(f"Failed to download food {name}: {e}")

print("Done downloading real images!")
