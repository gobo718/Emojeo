# Emojeo Pass 51 — Portable Step 3 Recovery Resume

## Purpose
Pass 50 correctly added deterministic post-reconciliation target-shape validation, but its resume logic still depended on the browser's IndexedDB checkpoint. If that local checkpoint was absent or did not match the selected file fingerprint, a recovered JSON containing valid `recoveryResults` still displayed `0/79`.

Pass 51 makes the recovered JSON itself a portable checkpoint source.

## Change
- Preserve the Pass 50 target-shape validator unchanged.
- On file load, inspect top-level `recoveryResults` in addition to IndexedDB.
- Verify embedded recovered subjects are an exact prefix of the 79-subject Step 3 corpus before importing them.
- Prefer whichever source contains more completed subjects: embedded recovered JSON or the saved browser checkpoint.
- Run the existing Pass 50 validator over imported results before saving them into the current browser checkpoint.
- Do not rerun already recovered subjects.
- Do not change the Worker.
- Do not change the original 6,399 Step 3 results.

## Current expected resume
Load:

`emojeo-step3-recovered-2026-09-22T23-05-40-997Z.json`

Expected:
- `3/79 subjects recovered`
- target-shape audit: `3 malformed accepted assertion(s) rejected and preserved for review`
- `RUN THROUGH 10` enabled

The three preserved/rejected malformed assertions remain:
- 😀 `HAS_SAME_COLOR_AS -> yellow`
- 😀 `IS_IN_SAME_UNICODE_SUBGROUP_AS -> Smiling Face with Open Mouth`
- 🤠 `HAS_SAME_COLOR_AS -> warm earthy brown`

The valid 😭 peer assertions remain accepted.
