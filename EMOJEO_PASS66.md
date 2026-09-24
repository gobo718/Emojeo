# EMOJEO PASS 66 — RESILIENT STEP 4 VERIFICATION

Pass 65 screening worked: the pilot reached **24/1,278 assertions screened** and found **641 sparse candidate cells**. The failure was in deep verification: one batched response omitted `A0018`.

Pass 66 fixes only that layer.

- Reuses the **same Pass 65 IndexedDB database and job ID**.
- Keeps every valid result returned by a verification batch.
- Retries only missing assertion IDs individually.
- Individual retry uses the Semantic Discovery route's native observation structure with explicit STATE / CONFIDENCE / EVIDENCE fields.
- Gives an individual assertion up to 3 semantic attempts.
- If all 3 remain mechanically unparseable, preserves that cell as **UNCERTAIN / LOW** with `mechanical-fallback-uncertain` provenance. It is never silently forced PRESENT or ABSENT.
- Pass 66 cancels the stale Pass 65 auto-resume flag on load, so it restores the 24 screened assertions and waits for you to press FINISH PILOT.

Open:

`https://gobo718.github.io/Emojeo/emojeo-step4-sparse-runner-v3.html`

It should immediately show **24 assertions screened**. Press **FINISH PILOT 24 ASSERTIONS**. When it completes, download the checkpoint JSON for audit.
