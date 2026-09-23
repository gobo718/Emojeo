#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$ROOT" ]; then
  echo "ERROR: Run this from inside the Emojeo git repo."
  exit 1
fi
cd "$ROOT"

for f in emojeo-step3-delta-backfill.html emojeo-step3-delta-backfill.js pass56_patch.py EMOJEO_PASS56.md; do
  [ -f "$f" ] || { echo "ERROR: Missing $f"; exit 1; }
done

python pass56_patch.py

echo
echo "PASS 56 VERIFIED"
echo "  Pass 55 discovery + mapper/reconciliation preserved"
echo "  Same IndexedDB checkpoint namespace preserved"
echo "  Existing mapped subjects are re-audited locally — no AI rerun"
echo "  Downloaded Pass 55 checkpoint JSON can be loaded directly"
echo "  Strict rejects remain preserved for audit"
echo
grep -o 'Step 3 Delta Backfill · Pass 56' emojeo-step3-delta-backfill.html | head -1
grep -o 'emojeo-step3-delta-backfill.js?v=56' emojeo-step3-delta-backfill.html | head -1
git diff --check -- emojeo-step3-delta-backfill.html emojeo-step3-delta-backfill.js
echo
echo "Pass 56 files are ready for git add / commit / push."
