# EMOJEO PASS 63 — STEP 4 CHECKPOINTED RUNNER

Pass 63 adds the browser runner for the sealed Pass 62 Step 4 inputs.

## Files

- `emojeo-step4-runner.html`
- `emojeo-step4-runner.js`

## Behavior

- Automatically loads the Pass 62 assertion universe, locked Step 3 prefill, and run spec already in the repo.
- Verifies the sealed assertion-universe and prefill SHA256 values before enabling the run.
- Reuses the existing configured Genreactrix Cloud API and `/api/emojeo/semantic-discovery` route.
- Evaluates exact assertion IDs only.
- Does not create relationship types, rewrite tags, merge synonyms, or overwrite Step 3 locked assignments.
- Checkpoints every successful subject/shard in IndexedDB.
- Restores and auto-resumes an interrupted gate.
- Safety gates: 1 → 3 → 10 → 79 subjects.
- STOP AFTER CURRENT REQUEST finishes and saves the in-flight request before stopping.
- Downloads a matrix checkpoint JSON containing locked prefill plus all saved Step 4 evaluations.

## First run

Open:

`https://gobo718.github.io/Emojeo/emojeo-step4-runner.html`

Press **RUN PILOT 1** only.

When subject 1 completes, download the checkpoint JSON and audit it before advancing to 3.
