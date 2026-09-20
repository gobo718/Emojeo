# Emojeo Pass 32 — Reachable Semantic Pilot UI

Pass 32 fixes the Pass 31 product defect: the live semantic runner existed but had no application control.

- Adds a visible Semantic Discovery Pilot panel to the Emoji Explorer.
- Builds and displays the deterministic Unicode 18 pilot manifest.
- Adds a guarded one-emoji live test before the full pilot can be started.
- Unlocks the full pilot only after the one-emoji endpoint test succeeds.
- Adds stop/progress/result display and JSON result download.
- Makes no AI calls automatically.
- Does not alter Unicode selection logic, credential storage, provider configuration, or Mutosis.
- A 404/Not found from the one-emoji test is treated as evidence that the Pass 31 Worker route still needs deployment; it does not trigger a full run.
