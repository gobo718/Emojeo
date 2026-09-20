# Emojeo Pass 19 — Import Reconciliation and Identity Matching

Pass 19 adds a narrow reconciliation layer for bringing recovered or external MASHPEDITION design material toward the existing design graph without silently duplicating or merging identities.

- Requires source provenance for every reconciliation session.
- Compares incoming Things/claims with existing same-domain design Things.
- Surfaces exact-ID, normalized-name, and partial-name candidate matches as advisory evidence.
- Surfaces current-canon value conflicts alongside likely matches.
- Leaves every incoming item unresolved until an identified human chooses match, create-new, or skip.
- Never mutates the graph or canon ledger during matching or resolution.
- Exports a human-resolved, non-mutating downstream import plan only after every item is resolved.
- Preserves resolution history and source provenance.

No UI rewrite and no unrelated refactor are included in this pass.
