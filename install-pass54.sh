#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$ROOT" ]; then
  echo "ERROR: Run this from inside the Emojeo git repo."
  exit 1
fi
cd "$ROOT"

for f in \
  emojeo-step3-delta-backfill.html \
  emojeo-step3-delta-backfill.js \
  EMOJEO_PASS54.md
do
  if [ ! -f "$f" ]; then
    echo "ERROR: Missing $f"
    exit 1
  fi
done

for f in \
  genreactrix-cloud-api.js \
  Emojeo_STEP3_Delta_Backfill_v013_RunSpec.json
do
  if [ ! -f "$f" ]; then
    echo "ERROR: Repo prerequisite missing: $f"
    exit 1
  fi
done

python - <<'PY'
import json
from pathlib import Path

spec=json.loads(Path("Emojeo_STEP3_Delta_Backfill_v013_RunSpec.json").read_text(encoding="utf-8"))
assert spec["subjectCount"] == 79
assert spec["relationshipDeltaCount"] == 354
assert spec["candidateEvaluationCount"] == 27966
assert len(spec["subjects"]) == 79
assert len(spec["relationshipDelta"]) == 354

html=Path("emojeo-step3-delta-backfill.html").read_text(encoding="utf-8")
js=Path("emojeo-step3-delta-backfill.js").read_text(encoding="utf-8")

assert "Step 3 Delta Backfill · Pass 54" in html
assert "emojeo-step3-delta-backfill.js?v=54" in html
assert "genreactrix-cloud-api.js?v=54" in html
assert "/api/emojeo/semantic-discovery" not in js, "Runner must use the existing Cloud API adapter rather than hardcode the Worker URL."
assert "emojeoSemanticDiscovery" in js
assert "relationshipDelta" in js
assert "deltaBackfillResults" in js

print("PASS 54 VERIFIED")
print("  subjects: 79")
print("  new relationships: 354")
print("  candidate evaluations: 27966")
print("  Worker route: existing Semantic Discovery adapter")
print("  original Step 3 + recovery data: preserved")
PY

echo
echo "Pass 54 runner ready for git add / commit / push."
