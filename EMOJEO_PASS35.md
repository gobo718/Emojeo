# Emojeo Pass 35 — Semantic Adapter Contract Repair

- Repairs the actual Pass 31–34 adapter contract mismatch.
- Semantic pilot runner now consumes the exported `window.GenreactrixCloudApi` API (with compatibility fallbacks) instead of looking only for nonexistent lowercase `globalThis.genreactrixCloudApi`.
- Loads open-discovery normalization before the pilot runner/UI.
- No Worker credentials, provider configuration, Unicode data, or Mutosis behavior changed.
