# Emojeo Pass 31 — First Live Semantic Pilot Wiring

Pass 31 moves from readiness verification to a real, deliberately bounded semantic-discovery path.

- Adds authenticated `POST /api/emojeo/semantic-discovery` to the inherited Genreactrix Worker.
- Reuses the existing Workers AI binding and ANALYSIS_KEY; no new provider credentials.
- Adds a browser Cloud API adapter for the endpoint.
- Adds an explicit pilot runner that consumes the deterministic Pass 28 manifest.
- Preserves provider raw discovery separately from normalized open-discovery interpretation.
- Does not run AI automatically and does not redesign Mutosis.
- Unicode group/subgroup remain source metadata and are not inserted into the semantic prompt.
