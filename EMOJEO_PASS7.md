# Emojeo Pass 7 — Full-Vocabulary Reclassification

Pass 7 closes the discovery bias loop. A trait is no longer limited to the emoji on which it happened to be noticed first.

## Behavior
- Builds one established vocabulary from authoritative Unicode traits plus explicitly approved curated Emojeo traits.
- Unicode Group/Subgroup remain authoritative facts and are not needlessly re-inferred.
- Creates the Cartesian evaluation plan of every emoji × every curated trait.
- Requires an explicit `present`, `absent`, or `uncertain` decision; unreviewed is preserved until a decision actually exists.
- Positive assignments carry source, confidence, evidence, run ID, and reclassification provenance into StringBoard.
- Negative/uncertain decisions remain in the reclassification session rather than masquerading as positive tags.
- The evaluator is forbidden from inventing vocabulary during this pass. New observations belong back in discovery/vocabulary review.

This produces the consistent feature matrix needed for later intersections, clustering, and Mosaic-candidate discovery without silently converting machine suggestions into canon.
