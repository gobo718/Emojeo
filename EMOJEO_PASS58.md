# EMOJEO PASS 58 — AUTO-RESUME ON REFRESH / REOPEN

Pass 58 is a narrow browser-resume change on top of Pass 57.

## What changes

- The latest delta-backfill job is found automatically in IndexedDB on page load.
- If Android/browser refreshes or closes while a gate is running, the requested
  gate is persisted and resumes automatically when the page is reopened.
- Existing Pass 54–57 partial-subject work is detected. If a subject is already
  partway through its 12 discovery shards, Pass 58 resumes only that interrupted
  subject automatically.
- A deliberate `STOP AFTER CURRENT REQUEST` disables auto-resume.
- When the user selects the source/checkpoint JSON, Pass 58 caches that source
  separately in IndexedDB so later refreshes do not require choosing it again.
- If an older job predates the source cache, AI work can still continue without
  reselecting the file. The source JSON only has to be chosen once before the
  final downloadable merged JSON can be produced.

## What does NOT change

Pass 57 discovery prompts, 354-type delta, mapper/reconciliation, strict evidence
validator, subject order, shard order, and safety gates are unchanged.

Base expected before installation:
Pass 57 `emojeo-step3-delta-backfill.js` / `.html`.
