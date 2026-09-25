# EMOJEO PASS 75 — NATIVE-SCHEMA PARSER FIX

Pass 74's retry loop worked, but its remaining items repeatedly returned responses the front-end parser could not read.

## Root cause

The Worker endpoint already enforces a native Semantic Discovery JSON schema:

- `rawDiscovery.summary`
- `rawDiscovery.observations[]`
  - `phrase`
  - `dimension`
  - `description`
  - `evidence[]`
  - numeric `confidence`
- `rawDiscovery.ambiguities[]`
- `rawDiscovery.rawNotes[]`

Pass 74 still required `STATE / CONFIDENCE / ROUTE / BASIS / EVIDENCE` to be embedded inside one specially formatted description string. A valid native response could therefore be thrown away simply because its prose did not follow that sentence template.

## Pass 75

Pass 75 reads the native Worker schema directly.

The model is asked to put a compact verdict token in both `summary` and `observations[0].phrase`, for example:

`P01|STATE=PRESENT|ROUTE=CONVENTIONAL_SEMANTIC`

The runner then uses the native numeric observation confidence and normal description/evidence fields.

If the first response is still unreadable, attempts 2 and 3 switch to a stricter verdict-token repair prompt.

If a case still cannot be parsed, its raw provider envelopes are saved in `parseDiagnostics` so the next checkpoint shows what was actually returned.

## Preservation and retry

Completed Pass 74 results are imported automatically from local storage. Only unfinished items run. Auto-retry continues until completion or STOP.

## Semantics

No semantic tightening was added.

Bacon/😊 and 💦/sobbing remain interpretive. Route labels are diagnostic and do not override semantic state.
