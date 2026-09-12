import os
import shutil

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ANDROID_APP_DIR = os.path.join(ROOT_DIR, 'android', 'app')
ASSETS_DIR = os.path.join(ANDROID_APP_DIR, 'src', 'main', 'assets')
RES_DIR = os.path.join(ANDROID_APP_DIR, 'src', 'main', 'res')

os.makedirs(ASSETS_DIR, exist_ok=True)

# 1. Sync compiled userscript
userscript_src = os.path.join(ROOT_DIR, 'ewu-toolkit.user.js')
if os.path.exists(userscript_src):
    userscript_dest = os.path.join(ASSETS_DIR, 'ewu-toolkit.user.js')
    shutil.copyfile(userscript_src, userscript_dest)
    print(f'Synced userscript: {userscript_dest}')

# 2. Sync App Launcher Icons
icon128 = os.path.join(ROOT_DIR, 'icons', 'icon128.png')
icon48 = os.path.join(ROOT_DIR, 'icons', 'icon48.png')

mipmap_dirs = [
    'mipmap-mdpi',
    'mipmap-hdpi',
    'mipmap-xhdpi',
    'mipmap-xxhdpi',
    'mipmap-xxxhdpi'
]

for mdir in mipmap_dirs:
    target_dir = os.path.join(RES_DIR, mdir)
    os.makedirs(target_dir, exist_ok=True)
    if os.path.exists(icon128):
        shutil.copyfile(icon128, os.path.join(target_dir, 'ic_launcher.png'))
        shutil.copyfile(icon128, os.path.join(target_dir, 'ic_launcher_round.png'))

print('Synced app launcher icons.')
