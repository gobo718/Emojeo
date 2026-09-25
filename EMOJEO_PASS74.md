# EMOJEO PASS 74 — LOOSE-REINS CALIBRATION + AUTO-RETRY

Pass 74 fixes the two problems exposed by Pass 73.

- **No manual retry ladder.** Provider/parser-pending fixtures automatically rerun until all 12 complete or Billy presses STOP. Completed fixtures remain checkpointed. Retry delay backs off and caps at 30 seconds.
- **No forced verdict for debatable cases.** 🥓 `CONTRASTS_WITH → 😊` and 💦 `HAS_SYMPTOM → sobbing` are interpretive fixtures with no expected state. PRESENT, ABSENT, or UNCERTAIN can all be surfaced and then reviewed with Billy.
- **Hard mismatches are not silently corrected.** They are marked `REVIEW · ASK BILLY`.
- **UNCERTAIN is explicitly valid.** Conditional/non-universal relationships are allowed when they satisfy the exact predicate.
- **Route labels are diagnostic only.** A non-preferred route creates a warning but does not overwrite a defensible semantic state.
- **Parser is broader.** It accepts direct structured state/confidence/route/basis/evidence fields as well as the existing text-block format.

The sealed ontology definition remains authoritative. The ontology domain remains descriptive rather than a hard applicability gate.

When all 12 complete, download the checkpoint. Any hard mismatch and each interpretive result should be reviewed with Billy individually.
