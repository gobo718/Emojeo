# EMOJEO PASS 50 — STEP 3 RECOVERY TARGET-SHAPE VALIDATOR

Pass 50 is a narrow browser-side correction on top of the deployed Pass 49 recovery architecture.

## What changed

- Worker recovery endpoint is **not changed or redeployed**.
- Original 6,399-unit Step 3 corpus is never rewritten.
- IndexedDB stays `emojeo-step3-recovery-v5`, so the existing 3/79 checkpoint is retained.
- A deterministic post-reconciliation validator now runs before checkpoint/save.
- Existing saved Pass 49 recovery results are sanitized in place when the completed original Step 3 export is re-selected.
- Assertions rejected by the validator are preserved in `rejectedCandidates` and `targetShapeRejectedAssertions` for audit.
- `newTags` is pruned only when a tag belonged solely to an assertion rejected by this validator.

## Validator v1

1. `HAS_SAME_COLOR_AS`
   - Rejects pure color literals such as `yellow` or `warm earthy brown`.
   - Does not reject entity-like targets such as `brown bear` merely because they contain a color word.

2. Cross-emoji peer relationships
   - `SIMILAR_TO`
   - `CONTRASTS_WITH`
   - `IS_IN_SAME_UNICODE_GROUP_AS`
   - `IS_IN_SAME_UNICODE_SUBGROUP_AS`
   - Targets must resolve to an emoji glyph/codepoint or an official Unicode 18 emoji name.
   - The page loads the already-present `data/unicode/18.0/emoji-test.txt` catalog for this check.

## Verified against the uploaded 3/79 Pass 49 recovery

- 😀 grinning face: 10 accepted assertions → 8
  - rejected `HAS_SAME_COLOR_AS → yellow`
  - rejected `IS_IN_SAME_UNICODE_SUBGROUP_AS → Smiling Face with Open Mouth`
- 😭 loudly crying face: 20 → 20
  - retained `SIMILAR_TO → 😢 crying face`
  - retained `CONTRASTS_WITH → crying_face`
- 🤠 cowboy hat face: 6 → 5
  - rejected `HAS_SAME_COLOR_AS → warm earthy brown`

Total target-shape rejections: **3**.

The sanitizer is idempotent: reloading the checkpoint does not duplicate or repeatedly alter the audit data.

## Next gate

After installing Pass 50, open the recovery page and re-select the same **original completed Step 3 export** used for the current checkpoint. The page should report 3/79 recovered and a target-shape audit of 3 rejected malformed accepted assertions. Then use **RUN THROUGH 10**.
