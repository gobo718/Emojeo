# EMOJEO PASS 73 — BALANCED CALIBRATION GATE

Pass 73 is deliberately not another broad Step 4 pilot.

It evaluates only 12 known calibration fixtures: 6 expected PRESENT and 6 expected ABSENT.

## Authority
The sealed 1,211-type ontology definition is authoritative. Operational guidance may block reasoning that plainly violates a predicate, but may not add stricter requirements that are absent from the sealed definition. The ontology domain is descriptive context, not a hard applicability gate.

## Core rule
A recognizable, defensible relationship that satisfies the exact predicate should be surfaced even when conditional or only sometimes true. `UNCERTAIN` is for genuine semantic ambiguity, not non-universality.

Reject invented scenarios, possible-consequence-only reasoning, co-occurrence-only reasoning, category difference only, and reasoning that actually proves another relationship type.

## Positive fixtures
- 🥳 `CONVEYS_EMOTION → happiness`
- 🥳 `HAS_POSITIVE_VALENCE → positive`
- 💔 `HAS_NEGATIVE_VALENCE → distress`
- 💔 `HAS_SYMPTOM → sobbing`
- 😀 `HAS_EXPRESSION → grin`
- 😭 `SIMILAR_TO → 😢 crying face`

## Negative fixtures
- 💔 `IMPLIES_SETTING → audible_crying_environment`
- 🥓 `CONTRASTS_WITH → 😊`
- 🧽 `HAS_OBJECT → tears`
- 🔓 `HAS_PART → exaggerated_mouth`
- 🎸 `HAS_FUNCTION → express_distress`
- 💦 `HAS_SYMPTOM → sobbing`

## Architecture
Each fixture gets one typed-predicate Semantic Discovery evaluation. The model sees the exact assertion, tag, sealed ontology definition, domain, and Step 3 seed context. It selects a semantic route label. A deterministic route compatibility check may reject a route that belongs to the wrong relationship type.

There is no screening phase, no adversarial reviewer stack, no matrix expansion, and no Full button.

A larger Step 4 run should not start until all 12 calibration cases pass and the resulting checkpoint survives audit.
