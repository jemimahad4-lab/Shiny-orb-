import os
import zipfile

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
PUBLIC_DIR = os.path.join(ROOT_DIR, "public")
DIST_DIR = os.path.join(ROOT_DIR, "dist")

os.makedirs(PUBLIC_DIR, exist_ok=True)

# 1. Clean any zip files from dist to keep the build strictly HTML5 game assets
for f in os.listdir(DIST_DIR):
    if f.endswith(".zip"):
        try:
            os.remove(os.path.join(DIST_DIR, f))
        except Exception:
            pass

# 2. Create PORTAL BUILD ZIP (Contents of dist directly at root of zip, ready for itch.io / CrazyGames / Poki)
portal_zip_path = os.path.join(PUBLIC_DIR, "game-portal-html5.zip")
with zipfile.ZipFile(portal_zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(DIST_DIR):
        for file in files:
            if file.endswith(".zip"):
                continue
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, DIST_DIR)
            z.write(full_path, rel_path)
print(f"Created: {portal_zip_path} ({os.path.getsize(portal_zip_path)} bytes)")

# 3. Create FULL SOURCE CODE ZIP (src, public, config files, excluding node_modules and dist and zips)
source_zip_path = os.path.join(PUBLIC_DIR, "dodge-the-spikes-2-source.zip")
EXCLUDE_DIRS = {"node_modules", ".git", "dist", ".vite", "__pycache__"}
EXCLUDE_EXTS = {".zip", ".pyc"}

with zipfile.ZipFile(source_zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for file in files:
            if any(file.endswith(ext) for ext in EXCLUDE_EXTS):
                continue
            if file == "package_game.py":
                continue
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, ROOT_DIR)
            z.write(full_path, rel_path)
print(f"Created: {source_zip_path} ({os.path.getsize(source_zip_path)} bytes)")

# 4. Create COMPLETE ALL-IN-ONE ZIP with Source, Build, and Monetization Guide
complete_zip_path = os.path.join(PUBLIC_DIR, "dodge-the-spikes-2-complete-pack.zip")
with zipfile.ZipFile(complete_zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    # Add source files
    for root, dirs, files in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for file in files:
            if any(file.endswith(ext) for ext in EXCLUDE_EXTS):
                continue
            if file == "package_game.py":
                continue
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, ROOT_DIR)
            z.write(full_path, os.path.join("source_code", rel_path))

    # Add clean dist files
    for root, dirs, files in os.walk(DIST_DIR):
        for file in files:
            if file.endswith(".zip"):
                continue
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, DIST_DIR)
            z.write(full_path, os.path.join("ready_to_upload_html5_build", rel_path))

print(f"Created: {complete_zip_path} ({os.path.getsize(complete_zip_path)} bytes)")
