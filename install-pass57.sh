#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$ROOT" ]; then
  echo "ERROR: Run this from inside the Emojeo git repo."
  exit 1
fi
cd "$ROOT"

for f in emojeo-step3-delta-backfill.html emojeo-step3-delta-backfill.js pass57_patch.py EMOJEO_PASS57.md; do
  [ -f "$f" ] || { echo "ERROR: Missing $f"; exit 1; }
done

python pass57_patch.py

python - <<'PY'
from pathlib import Path

html=Path("emojeo-step3-delta-backfill.html").read_text(encoding="utf-8")
js=Path("emojeo-step3-delta-backfill.js").read_text(encoding="utf-8")

assert "Step 3 Delta Backfill · Pass 57" in html
assert "emojeo-step3-delta-backfill.js?v=57" in html
assert "STRICT_EVIDENCE_VALIDATOR_VERSION=2" in js
assert "STRICT_FACE_NEGATION_RE" in js
assert "STRICT_GRINNING_FACE_FALSE_EYE_RE" in js
assert "STRICT_UNSOURCED_EMPIRICAL_RE" in js
assert "emojeo-step3-delta-backfilled-pass57-" in js

print("PASS 57 VERIFIED")
print("  Pass 56 discovery + mapper/reconciliation preserved")
print("  same IndexedDB checkpoint namespace preserved")
print("  existing mapped subjects re-audit locally — no AI rerun")
print("  direct subject-fact contradiction guards active")
print("  unsupported numerical/time-series provenance guard active")
PY

git diff --check -- emojeo-step3-delta-backfill.html emojeo-step3-delta-backfill.js

echo
echo "Pass 57 files are ready for git add / commit / push."
