# EMOJEO PASS 72 — SEMANTIC ROUTE GATE PILOT

## Why Pass 72 exists
Pass 71 completed mechanically, but the semantic audit failed.

Pass 71 successfully finished all 579 candidate cells with zero provider-failure pending, but it still made two opposite classes of semantic error:

1. **False negative from over-literal screening.**
   - `💔 HAS_SYMPTOM sobbing` was screened out, even though the project rule explicitly allows a recognizable condition/state/experience → manifestation relationship when the predicate is `HAS_SYMPTOM`.

2. **False positives from predicate drift.**
   - `🧽 HAS_OBJECT tears` was accepted by inventing a scenario where a sponge could absorb tears.
   - `🔓 HAS_PART exaggerated_mouth` was accepted by reinterpreting an unlocked padlock as mouth anatomy.
   - `🛏️ SIMILAR_TO 😢 crying face` was accepted because someone might cry in bed.
   - `🧙 SYMBOLIZES_ASSOCIATES_WITH loud_crying` was accepted using bespoke fantasy lore.

Pass 72 attacks both failure modes.

## Pass 72 architecture
- Fresh IndexedDB namespace: `emojeo-step4-pass72`.
- Step 3 remains sealed at 1,211 relationship types.
- Pilot remains exactly 24 assertions; Full 1,278 stays locked.
- Three independent high-recall screens:
  1. direct/conventional recall
  2. semantic-bridge scout
  3. false-negative challenge
- Candidate set = union of all three screens plus explicit semantic regression fixtures.
- Every candidate gets:
  1. supporter review
  2. falsifier review
  3. adjudicator only on disagreement
  4. final validator for every provisional PRESENT or UNCERTAIN
- A required review-stage parse/provider failure leaves the cell pending. It is never silently promoted to a verified decision.

## Semantic route gate
Every non-ABSENT model judgment must name one explicit route:

- `DIRECT_VISUAL`
- `CONVENTIONAL_SEMANTIC`
- `SYMBOLIC_METAPHORIC`
- `FUNCTIONAL`
- `CONTEXTUAL`
- `CONDITION_SYMPTOM`
- `SHARED_AXIS`
- `VENDOR_RENDERING`
- `EXACT_REFERENCE`

The runner then enforces which routes are legal for each relationship type.

Examples:
- `HAS_OBJECT`, `HAS_PART`, `HAS_EXPRESSION`, `HAS_POSE_GESTURE` -> `DIRECT_VISUAL` only.
- `HAS_SYMPTOM` -> `CONDITION_SYMPTOM`.
- `CONTRASTS_WITH`, `SIMILAR_TO` -> `SHARED_AXIS`.
- `HAS_FUNCTION` -> `FUNCTIONAL`.
- `IMPLIES_SETTING` -> `CONTEXTUAL`.

This prevents a model from using a valid semantic connection and stuffing it through the wrong relationship predicate.

## Symptom rule
`HAS_SYMPTOM` is explicitly broadened to the project’s settled meaning:

> The subject may conventionally denote a condition, state, or experience—including an emotional or metaphorical state. The tag may be a recognizable manifestation even when it is not universal, diagnostic, or medically literal.

That keeps `💔 → sobbing` eligible while rejecting “this object could make someone sob” scenarios.

## Regression gate
Pass 72 independently re-verifies five known quality fixtures before the pilot can be considered semantically complete:

- `💔 IMPLIES_SETTING audible_crying_environment` -> ABSENT
- `💔 HAS_SYMPTOM sobbing` -> PRESENT
- `🥓 CONTRASTS_WITH 😊` -> ABSENT
- `🧽 HAS_OBJECT tears` -> ABSENT
- `🔓 HAS_PART exaggerated_mouth` -> ABSENT

These are audit fixtures, not hard-coded matrix assignments.

## Audit gate
Full 1,278 remains disabled. Complete the 24-assertion Pass 72 pilot, download the checkpoint, and audit it before any full run.
