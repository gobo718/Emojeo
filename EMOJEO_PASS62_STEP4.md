# EMOJEO PASS 62 — STEP 4 ASSERTION UNIVERSE + RUN SPEC

Step 4 input construction is complete.

## What was built

- **1,278** unique exact `(relationshipType, tag)` assertion candidates from the sealed Step 3 canonical dataset.
- **79** subjects, preserving the sealed Step 3 subject order.
- **100,962** total subject × assertion matrix cells.
- **1,326** cells are already known from accepted Step 3 work and are locked as prefill:
  - 1,222 PRESENT
  - 104 UNCERTAIN
- **99,636** cells remain for Step 4 evaluation.
- Assertion universe is split into **43 deterministic shards**, maximum 30 assertion IDs per shard.
- Gates are **1 → 3 → 10 → 79** completed subjects.

## Non-negotiable Step 4 rules

- No new relationship types.
- No synonym merging.
- No tag rewriting.
- No overwriting locked Step 3 assignments.
- Evaluate exact assertion IDs only.
- States: PRESENT / ABSENT / UNCERTAIN / NOT_EVALUATED.
- Checkpoint every successful subject-shard and every completed subject.

## Files

- `Emojeo_STEP4_Assertion_Universe_v001.json` — exact assertion universe with Step 3 seed provenance.
- `Emojeo_STEP4_Prefill_v001.json` — 1,326 locked known cells from Step 3.
- `Emojeo_STEP4_RunSpec_v001.json` — deterministic Step 4 execution contract.
- `Emojeo_STEP4_Assertion_Universe_v001_AUDIT.json` — construction/integrity audit.

This pass does **not** run the 99,636 remaining evaluations. It produces the sealed inputs for the Step 4 runner.
