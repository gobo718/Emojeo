#!/usr/bin/env python3
import json
import sys

if len(sys.argv) != 4:
    raise SystemExit(
        "Usage: merge_ontology_v013.py "
        "Emojeo_STEP3_Semantic_Inventory_857.json "
        "Emojeo_STEP3_Ontology_Integration_v013_DELTA.json "
        "Emojeo_STEP3_Semantic_Inventory_1211_v013.json"
    )

source_path, delta_path, output_path = sys.argv[1:4]

with open(source_path, encoding="utf-8") as f:
    source = json.load(f)
with open(delta_path, encoding="utf-8") as f:
    delta = json.load(f)

existing = {r["relationshipType"] for r in source["relationships"]}
additions = []
for rel in delta["relationshipsToAdd"]:
    name = rel["relationshipType"]
    if name not in existing:
        additions.append(rel)
        existing.add(name)

merged = dict(source)
merged["relationshipCount"] = len(source["relationships"]) + len(additions)
merged["relationships"] = source["relationships"] + additions
merged["integrationMetadata"] = {
    "sourceRegistryRelationshipCount": source.get("relationshipCount"),
    "integrationDelta": delta.get("kind"),
    "newRelationshipCount": len(additions),
    "resultingRelationshipCount": merged["relationshipCount"],
    "sourceReviewWorkbook": delta.get("sourceReviewWorkbook"),
    "basePairRule": delta.get("basePairRule"),
}

expected = delta["resultingRelationshipCount"]
if merged["relationshipCount"] != expected:
    raise RuntimeError(
        f"Count mismatch: produced {merged['relationshipCount']}, expected {expected}"
    )

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(merged, f, ensure_ascii=False, indent=2)
    f.write("\n")

print(f"Wrote {output_path}: {merged['relationshipCount']} relationships")
