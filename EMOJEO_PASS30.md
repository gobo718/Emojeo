# Emojeo Pass 30 — Canonical AI Credential Inheritance

## Repair
- Loads the existing Genreactrix Settings Engine in the Emojeo root before the inherited Cloud API.
- This lets Emojeo read the canonical `ai.worker.base` and sensitive `ai.worker.accessKey` values already stored in the shared Genreactrix IndexedDB settings registry on the same browser origin.
- The Cloud API already listens for `genreactrix:settings-ready` and reloads after settings initialization, so the canonical setting replaces any stale legacy localStorage fallback before the user runs the readiness probe.
- No key value is copied into source, exposed in the UI, regenerated, normalized, or changed.
- The legacy localStorage fallback remains intact for compatibility.

## Why Pass 29 could say “Analysis key rejected”
Pass 29 loaded the Cloud API without loading the canonical Settings Engine. The Cloud API therefore had to use its legacy localStorage fallback. A stale fallback value can be present while the current accepted key remains safely stored in the canonical Genreactrix settings database. Pass 30 restores the intended settings-first inheritance path.

## Live verification
Reload Emojeo after deploying Pass 30, then run `RUN AI READINESS CHECK` once. A READY result proves Worker connectivity, canonical auth inheritance, and provider readiness without submitting a semantic analysis run.
