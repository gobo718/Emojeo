# EMOJEO PASS 57 — SUBJECT-FACT + PROVENANCE GUARDS

## Why Pass 57 exists

The Pass 56 3-subject checkpoint completed successfully, but audit found four
accepted assertions whose evidence should not have survived the strict gate:

1. 😀 HAS_TONE — evidence falsely said the grinning face has closed eyes.
2. 😀 EXPRESSES_EMOTION — same false closed-eyes premise.
3. 🤠 SYMBOLIZES_STATE — evidence falsely said cowboy hat face lacks a face.
4. 🤠 COLLECTIVE_IDENTITY_SYMBOL — evidence asserted an unsourced exact
   time-series statistic ("increased 3x from 2018 to 2022").

Pass 57 makes the smallest targeted change: strict validator v2.

## New deterministic checks

In addition to every Pass 56 rule, an accepted assertion is rejected when:

- its evidence directly contradicts the canonical subject identity by claiming
  a named `... face` subject has no face;
- 😀 grinning face evidence relies on the false premise that its eyes are closed;
- evidence contains numerical/time-series precision such as `3x`, percentages,
  or a year-to-year range without source provenance carried by the assertion
  (source/citation/reference/URL/DOI).

## Resume behavior

Pass 57 keeps the same IndexedDB database namespace and can directly load the
downloaded Pass 56 checkpoint.

The three completed subjects are re-audited locally. Their 36 discovery calls
and three mapper/reconciliation calls are **not repeated**.

For the uploaded Pass 56 3-subject checkpoint, the deterministic expected
re-audit is:

- completed subjects: 3
- discovery shards saved: 36
- accepted PRESENT assertions: 14
- strict-evidence rejects: 9

That is the prior 18 accepted / 5 strict rejects, with four additional accepted
assertions moved to strict rejection.

## Scope

No Worker route changes.
No ontology changes.
No discovery prompt changes.
No mapper/reconciler changes.
No rerun of completed AI work.
