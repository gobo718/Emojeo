#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$ROOT" ]; then
  echo "ERROR: Run this from inside the Emojeo git repo."
  exit 1
fi
cd "$ROOT"

for f in emojeo-step3-recovery.html emojeo-step3-recovery.js; do
  if [ ! -f "$f" ]; then
    echo "ERROR: Missing $f"
    exit 1
  fi
done

python - <<'PY'
from pathlib import Path

html_path = Path("emojeo-step3-recovery.html")
js_path = Path("emojeo-step3-recovery.js")

html = html_path.read_text(encoding="utf-8")
js = js_path.read_text(encoding="utf-8")

required_html = [
    "Emojeo · Step 3 Recovery Mapper · Pass 52",
    "Pass 52 adds portable resume",
    "Pass 52 sanitizes imported or saved recovery results",
    'emojeo-step3-recovery.js?v=52',
]
missing = [x for x in required_html if x not in html]
if missing:
    raise SystemExit("ERROR: Expected Pass 52 HTML markers were not all found:\n- " + "\n- ".join(missing))

if "Emojeo Step 3 Recovery Mapper — Pass 52" not in js:
    raise SystemExit("ERROR: Expected Pass 52 JS header marker was not found.")

html = html.replace("Emojeo · Step 3 Recovery Mapper · Pass 52",
                    "Emojeo · Step 3 Recovery Mapper · Pass 53")
html = html.replace("Pass 52 adds portable resume",
                    "Pass 53 adds portable resume")
html = html.replace("Pass 52 sanitizes imported or saved recovery results",
                    "Pass 53 sanitizes imported or saved recovery results")
html = html.replace('emojeo-step3-recovery.js?v=52',
                    'emojeo-step3-recovery.js?v=53')

js = js.replace("Emojeo Step 3 Recovery Mapper — Pass 52",
                "Emojeo Step 3 Recovery Mapper — Pass 53", 1)

html_path.write_text(html, encoding="utf-8")
js_path.write_text(js, encoding="utf-8")
PY

echo
echo "PASS 53 WEBSITE IDENTITY FIX APPLIED"
echo "Visible identity:"
grep -o 'Step 3 Recovery Mapper · Pass 53' emojeo-step3-recovery.html | head -1
echo "Cache-buster:"
grep -o 'emojeo-step3-recovery.js?v=53' emojeo-step3-recovery.html | head -1
echo "JS header:"
head -1 emojeo-step3-recovery.js

if grep -q 'Pass 52' emojeo-step3-recovery.html; then
  echo "ERROR: Pass 52 still appears in recovery HTML."
  exit 1
fi

git diff --check -- emojeo-step3-recovery.html emojeo-step3-recovery.js
echo
echo "Only the Pass 53 website/build identity was changed."
