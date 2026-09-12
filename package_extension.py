import json
import os
import zipfile

def package():
    with open('manifest.json', 'r', encoding='utf-8') as f:
        manifest = json.load(f)
    version = manifest.get('version', '1.0.0')
    name = manifest.get('name', 'EWU-Toolkit')

    os.makedirs('dist', exist_ok=True)
    zip_path = os.path.join('dist', f'{name}-v{version}.zip')

    files_to_include = [
        'manifest.json',
        'content.css',
        'content.js',
        'popup.html',
        'popup.css',
        'popup.js',
        'LICENSE',
        'README.md'
    ]

    extension_icons = [
        os.path.join('icons', 'icon16.png'),
        os.path.join('icons', 'icon48.png'),
        os.path.join('icons', 'icon128.png')
    ]

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for f in files_to_include:
            if os.path.exists(f):
                zipf.write(f, arcname=f)
        for icon in extension_icons:
            if os.path.exists(icon):
                zipf.write(icon, arcname=icon)

    print(f'Done! Packaged: {zip_path} ({os.path.getsize(zip_path)} bytes)')
    print('Ready to attach to your GitHub Release.')

if __name__ == '__main__':
    package()
