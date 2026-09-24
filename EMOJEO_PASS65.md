# EMOJEO PASS 65 — ROBUST SPARSE STEP 4 RUNNER

Pass 65 fixes the Pass 64 screening failure.

## What failed in Pass 64

The existing `/api/emojeo/semantic-discovery` route returns its normal structured discovery schema (observations/rawNotes). It did not reliably obey Pass 64's demand for one custom pipe-delimited line per assertion, so a 12-assertion batch could come back with zero parseable assertion lines.

## Pass 65 fix

- Uses the route's **native observation structure** instead of assuming custom flat text.
- Screens **6 assertions per request** across all 79 emoji.
- Runs **4 requests concurrently**.
- Requests one native observation per assertion:
  - phrase = assertion ID
  - description contains `C=[...] ; N=[...] ; R=...`
- Missing/unparseable assertions are retried **individually**.
- If an individual fallback still cannot be parsed, Pass 65 does **not** silently mark anything absent: every nonlocked subject for that assertion becomes a deep-verification candidate.
- Deep verification remains exact-ID / exact-tag.
- Fresh IndexedDB database; failed Pass 64 checkpoints are ignored.

## Call shape

- Maximum normal batch screen calls: **213**
- Plus only individual fallback calls for missed batch items
- Four-way concurrency
- Deep verification limited to candidate cells

This is still dramatically smaller than Pass 63's maximum **3,397** subject-shard calls.

## Run

Open:

`https://gobo718.github.io/Emojeo/emojeo-step4-sparse-runner-v2.html`

Run **PILOT 24 ASSERTIONS**, then download the checkpoint JSON for audit.
