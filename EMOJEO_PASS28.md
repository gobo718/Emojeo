# Emojeo Pass 28 — AI Inheritance + Unicode 18 Semantic Pilot

Purpose: prepare the first real emoji semantic-analysis campaign without recreating credentials or spending AI calls prematurely.

Changes:
- Pins the Unicode source to the official versioned Unicode Emoji 18.0 `emoji-test.txt` URL instead of the moving `latest` alias.
- Removes the previously assumed fixed RGI count; the count must be derived from the actual Unicode 18.0 file.
- Adds `emojeo-semantic-pilot.js`:
  - selects several complete Unicode subgroups;
  - creates a reproducible seeded random sample from the remaining canonical subject universe;
  - saves stable subject IDs/code points;
  - keeps Unicode Group/Subgroup as source metadata but excludes them from the discovery prompt;
  - creates the Scan-1 rich-description + unconstrained-tag request contract.
- Adds `emojeo-ai-inheritance.js`, a read-only diagnostic wrapper over the existing Genreactrix Worker contract. It reports whether the Worker and analysis key are present but never returns the secret value. `verify()` delegates to the existing Worker connection/provider-readiness probe.
- No credential values were added, changed, regenerated, copied, or exposed.
- No AI calls are made by this pass.

Next live boundary: run the inherited Worker readiness probe in Billy's configured browser, then use the pilot manifest for the first paid semantic discovery calls only after provider readiness is confirmed.
