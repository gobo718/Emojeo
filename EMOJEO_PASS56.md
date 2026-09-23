# EMOJEO PASS 56 — STRICT EVIDENCE GATE

Base repository checked before packaging:
`0b7cb34da05d16a1877cb9824c0830bc96965647`

## Why Pass 56 exists

The Pass 55 2-subject checkpoint proved that the two-stage pipeline works, but
the reconciler still allowed a few weak accepted assertions through.

The uploaded checkpoint contains:

- 2/79 fully mapped subjects
- 24/948 fresh discovery shards
- 7 accepted PRESENT assertions before Pass 56 evidence validation
- no mapper/reconciliation failures

## Narrow change only

Pass 56 keeps the existing Pass 55 pipeline and adds a deterministic
post-reconciliation evidence gate.

An accepted assertion is rejected by this gate when:

1. its accepted confidence is `low`;
2. its tag is self-referential sentence-style prose containing the subject emoji
   or subject name instead of a semantic target; or
3. the accepted tag/evidence still explicitly describes the connection as
   speculative, hypothetical, a stretch, niche, context-dependent, etc.

Rejected rows are not deleted. They are moved into
`strictEvidenceRejectedAssertions` and also retained in `rejectedCandidates`
with a Pass 56 audit reason.

## Existing 2-subject checkpoint is reused

Pass 56 keeps the same IndexedDB database namespace as Pass 55.

It can also directly load a downloaded Pass 55 backfill checkpoint JSON. Its
embedded:

- `deltaBackfillDiscoveryResults`
- `deltaBackfillResults`

are imported, re-audited locally, and used as the starting checkpoint.

No discovery calls and no mapper calls are repeated for already completed
subjects.

## Expected re-audit of the uploaded 2/79 checkpoint

The Pass 56 rules should turn the current 7 accepted assertions into 4 kept
assertions and 3 strict-evidence rejects.

Expected strict rejects:

- `SYMBOLIC_WEIGHT_TROPE` — self-referential sentence-style target
- `IS_EXPRESSIVE_OF_CULTURAL_PRACTICE` — low-confidence + self-referential target
- `QUEER_ICONOGRAPHY` — low-confidence + self-referential/speculative evidence

The rejected assertions stay in the JSON for audit.

## Continue gate

After loading the Pass 55 checkpoint, Pass 56 should show:

- 2/79 subjects complete
- 24 discovery shards saved
- 4 accepted PRESENT assertions
- 3 strict-evidence rejections

Then `RUN THROUGH 3` is the next gate.
