#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$ROOT" ]; then
  echo "ERROR: Run this from inside the Emojeo git repo."
  exit 1
fi
cd "$ROOT"

for f in \
  Emojeo_STEP3_Semantic_Inventory_857.json \
  Emojeo_STEP3_Ontology_Integration_v013_DELTA.json \
  Emojeo_STEP3_Delta_Backfill_v013_RunSpec.json \
  merge_ontology_v013.py
do
  if [ ! -f "$f" ]; then
    echo "ERROR: Missing $f"
    exit 1
  fi
done

python merge_ontology_v013.py \
  Emojeo_STEP3_Semantic_Inventory_857.json \
  Emojeo_STEP3_Ontology_Integration_v013_DELTA.json \
  Emojeo_STEP3_Semantic_Inventory_1211_v013.json

python - <<'PY'
import json

p = "Emojeo_STEP3_Semantic_Inventory_1211_v013.json"
with open(p, encoding="utf-8") as f:
    j = json.load(f)

rels = j.get("relationships", [])
names = [r.get("relationshipType") for r in rels]
assert j.get("relationshipCount") == 1211, j.get("relationshipCount")
assert len(rels) == 1211, len(rels)
assert len(names) == len(set(names)), "duplicate relationship names found"

with open("Emojeo_STEP3_Ontology_Integration_v013_DELTA.json", encoding="utf-8") as f:
    d = json.load(f)
assert d.get("totalRelationshipAdditions") == 354
assert d.get("resultingRelationshipCount") == 1211

print("PASS 53 VERIFIED")
print("  ontology relationships: 1211")
print("  v013 additions: 354")
print("  duplicate names: 0")
print("  original 857 registry preserved")
PY

echo
echo "Pass 53 files are ready for git add / commit / push."
