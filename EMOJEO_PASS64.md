# EMOJEO PASS 64 — STEP 4 SPARSE / TRANSPOSE RUNNER

Pass 64 replaces the brute-force full-run strategy from Pass 63.

## Why

Pass 63 evaluates subject × assertion shards serially. The first subject showed that the overwhelming majority of new cells are negative, so detailed AI reasoning on every cell wastes time.

Pass 64 keeps the same sealed **79 × 1,278 matrix** and locked Step 3 prefill, but changes execution:

1. **Transpose screening:** 12 exact assertions are screened across all 79 emoji in one request.
2. The screen is **high recall**. Any emoji with plausible PRESENT/UNCERTAIN support enters a sparse candidate queue.
3. Explicitly context-impossible subjects become NOT_EVALUATED.
4. Other nonlocked omitted subjects become ABSENT.
5. Only sparse candidate cells receive the expensive detailed verification pass.
6. **Four independent requests run concurrently.**
7. Every screening and verification request checkpoints to its own Pass 64 IndexedDB database.

## Request-count shape

- Brute-force Pass 63 maximum subject-shard calls: **3,397**
- Pass 64 full screening calls: **107**
- Deep verification calls: variable, driven only by sparse candidates

## Safety

- Same Pass 62 universe/prefill/run-spec hashes are verified before running.
- No relationship creation.
- No synonym merging.
- No tag rewriting.
- Locked Step 3 cells are immutable.
- Exact assertion IDs are preserved.
- Pass 64 uses a separate IndexedDB database and does not destroy Pass 63 checkpoints.

## First run

Open:

`https://gobo718.github.io/Emojeo/emojeo-step4-sparse-runner.html`

Run **PILOT 24 ASSERTIONS**.

That completes those 24 assertions across all 79 emoji (1,896 cells), including deep verification of only sparse candidates. Download the checkpoint JSON for audit before starting the full 1,278.
