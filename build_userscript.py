import re

with open('content.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

with open('content.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

header = '''// ==UserScript==
// @name         EWU-Toolkit
// @namespace    https://github.com/sowmiksudo/EWU-Toolkit
// @version      1.3.0
// @description  Complete student utility suite for EWU Portal: visual weekly class routine generator, 1-click Excel export, unhide faculty info, seat availability & filters, accounts ledger breakdown, and more.
// @author       Sowmik
// @match        https://portal.ewubd.edu/*
// @match        http://portal.ewubd.edu/*
// @icon         https://portal.ewubd.edu/favicon.ico
// @grant        GM_setClipboard
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/sowmiksudo/EWU-Toolkit/main/ewu-toolkit.user.js
// @downloadURL  https://raw.githubusercontent.com/sowmiksudo/EWU-Toolkit/main/ewu-toolkit.user.js
// ==/UserScript==

(function () {
  'use strict';

  // Inject Styles
  const style = document.createElement('style');
  style.id = 'ewu-toolkit-all-styles';
  style.textContent = `''' + css_content.replace('`', '\\`') + '''`;
  document.head.appendChild(style);

  // Core Logic
''' + js_content + '''
})();
'''

with open('ewu-toolkit.user.js', 'w', encoding='utf-8') as f:
    f.write(header)

with open('ewu-faculty-reveal.user.js', 'w', encoding='utf-8') as f:
    f.write(header)

print('Updated ewu-toolkit.user.js and ewu-faculty-reveal.user.js successfully.')
