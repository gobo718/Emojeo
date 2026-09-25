# EMOJEO PASS 71 — DUAL-SCREEN / DUAL-REVIEW TYPED-PREDICATE PILOT

## Why Pass 71 exists
Pass 70 completed mechanically, but its semantic audit failed. The typed-predicate prompt improved obvious literal cases, yet broad relationship types still allowed the model to manufacture contrast/function/setting/symptom rationales.

Observed Pass 70 failures included:
- `CONTRASTS_WITH`: category difference was treated as contrast (for example, bacon vs. a smiling face).
- `IMPLIES_SETTING`: broken heart was still accepted for an audible-crying environment.
- `HAS_FUNCTION`: guitar was accepted for `express_distress` because it *can* be used cathartically.
- `HAS_SYMPTOM`: broken heart -> sobbing was appropriately retained, but sweat droplets -> sobbing showed predicate drift.

The preserved Pass 65 screen also had both overinclusive and false-negative behavior, so Pass 71 does not reuse it.

## Pass 71 architecture
1. Fresh IndexedDB namespace: `emojeo-step4-pass71`.
2. Pilot remains exactly 24 assertions; Full 1,278 stays locked.
3. Each assertion is screened twice independently, one assertion per request.
4. Candidate set is the UNION of both screens.
5. A nonlocked cell becomes screen-negative ABSENT only if BOTH high-recall screens omit it.
6. Every candidate gets two independent one-cell reviews:
   - RECALL REVIEWER protects legitimate conditional/sometimes-true semantic links.
   - PREDICATE CRITIC attacks invented scenarios, category-difference tricks, consequence drift, co-occurrence, and neighboring-predicate substitutions.
7. Reviewer disagreement goes to a third ADJUDICATOR.
8. Provider failures remain pending and are not counted as verified.
9. The ontology and exact tags are not renamed, merged, normalized, or expanded.

## Governing semantic rule
When in reasonable doubt, include a legitimate semantic relationship so Billy can judge it later. But never invent a scenario, and never bend the relationship predicate to make the assertion fit.

`PRESENT` does not mean universally true. A conditional/sometimes-true relationship may be PRESENT when the exact predicate licenses that kind of semantic inference.

## Explicit predicate safeguards
Pass 71 adds operational contracts for high-risk relationship types while preserving the sealed ontology definitions. In particular:
- `CONTRASTS_WITH` requires a salient shared comparison axis plus meaningful opposition; mere difference is not contrast.
- `IMPLIES_SETTING` requires the emoji to imply the environment/context itself; a possible consequence does not become a setting.
- `HAS_FUNCTION` requires a conventional function/use/affordance; a possible creative use is not enough.
- `HAS_SYMPTOM` requires a condition/state -> recognized manifestation route; this permits broken-heart -> sobbing while rejecting sweat-droplets -> sobbing.
- Visible predicates (`HAS_EXPRESSION`, `HAS_POSE_GESTURE`, `HAS_OBJECT`, `HAS_PART`) remain visually grounded.
- Broad semantic predicates stay broad when their ontology definition actually licenses symbolic/conventional association.

## Audit gate
Do not unlock the full 1,278 assertions from this runner. Complete the 24-assertion pilot, download the Pass 71 checkpoint, and audit it first.
