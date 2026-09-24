# EMOJEO PASS 70 — STEP 4 TYPED-PREDICATE PILOT

Pass 70 re-verifies the existing 24-assertion Step 4 pilot from fresh single-cell decisions while preserving the successful sparse-screen candidate set.

## Settled semantic rule

Err toward inclusion when there is a recognizable, defensible semantic relationship that actually satisfies the exact relationship predicate. A relationship may be conditional, sometimes true, symbolic, metaphorical, conventional, cultural, functional, contextual, or not visually literal and still be PRESENT.

Reject invented-scenario reasoning. A relation is ABSENT when it works only by inventing an outside event, owner, gift, recipient, location, or other context that is not inherent or conventional to the emoji. It is also ABSENT when the evidence really supports a different relationship type instead of the fixed predicate.

PRESENT does not mean universally true. UNCERTAIN is reserved for genuine ambiguity over whether the exact predicate is satisfied, not merely for non-universality. NOT_EVALUATED is reserved for truly unjudgeable semantics; "would require invented context" is ABSENT.

The relationship definition is authoritative. Ontology domain is descriptive context, not a hard applicability gate. This preserves legitimate cases such as heartbreak having sobbing as a possible symptom while rejecting heartbreak as implying an audible-crying setting.

## Pass 70 mechanics

- Loads `Emojeo_STEP3_Semantic_Inventory_1211_v013.json` and requires exactly 1,211 relationship types.
- Uses the exact relationship definition, exact relationship type, exact tag, emoji identity, and Step 3 seed context in every candidate-cell prompt.
- Preserves the existing sparse screen as the candidate generator.
- Quarantines all Pass 68 and Pass 69 verification results from active decisions; they remain stored for audit/history.
- Creates only `emojeo-step4-cell-verify-result-v70` active verification records.
- Re-verifies every pilot candidate cell under the Pass 70 rule; old results do not count toward completion.
- Converts preserved screen `N` / invented-context-only noncandidates to `ABSENT`, not `NOT_EVALUATED`.
- Provider failures remain pending and do not count as verified. Re-running the pilot retries only unfinished Pass 70 cells.
- Full 1,278-assertion execution remains locked until the Pass 70 pilot checkpoint is audited.

## Uploaded Pass 69 checkpoint preflight

The audited checkpoint contains 24 screened assertions, 641 unique candidate cells, 349 Pass 69 single-cell results, 280 Pass 68 assertion-batch cells, no overlap between those two historical sets, and 12 candidate cells that had no historical verification. Pass 70 intentionally starts with all 641 candidate cells requiring fresh Pass 70 verification.
