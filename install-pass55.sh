#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$ROOT" ]; then
  echo "ERROR: Run this from inside the Emojeo git repo."
  exit 1
fi
cd "$ROOT"

for f in emojeo-step3-delta-backfill.html emojeo-step3-delta-backfill.js EMOJEO_PASS55.md; do
  [ -f "$f" ] || { echo "ERROR: Missing $f"; exit 1; }
done

python - <<'PY'
from pathlib import Path
html=Path("emojeo-step3-delta-backfill.html").read_text(encoding="utf-8")
js=Path("emojeo-step3-delta-backfill.js").read_text(encoding="utf-8")

assert "Step 3 Delta Backfill · Pass 55" in html
assert "emojeo-step3-delta-backfill.js?v=55" in html
assert "genreactrix-cloud-api.js?v=55" in html
assert "emojeo-step3-delta-backfill-v1" in js, "Pass 54 IndexedDB checkpoint namespace must be preserved"
assert "/api/emojeo/step3-recovery/subject" in js
assert "deltaBackfillDiscoveryResults" in js
assert "deltaBackfillResults" in js
assert "mappedSubjects()" in js

print("PASS 55 VERIFIED")
print("  reuses Pass 54 IndexedDB checkpoint")
print("  preserves fresh discovery shards")
print("  adds Step 3 mapper + reconciliation stage")
print("  emoji completion now requires structured mapped result")
PY

git diff --check -- emojeo-step3-delta-backfill.html emojeo-step3-delta-backfill.js EMOJEO_PASS55.md
echo
echo "Pass 55 ready for git add / commit / push."
