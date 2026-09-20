# Emojeo Pass 2 — Emoji Record Model

Pass 2 defines the first application-owned data model on top of StringBoard Engine v1.

## Added

- `emojeo-emoji-record.js`: one extensible record per emoji subject.
- Stable identity from Unicode code-point sequence, while allowing an explicit imported ID.
- Separate fields for glyph/presentation, Unicode metadata, names/aliases/keywords, official group/subgroup taxonomy, descriptions, relationships, analysis state, and open metadata.
- Adapter into StringBoard's reusable record store, preserving status, flags, provenance, revision history, migrations, import/export, and persistence capability.

## Deliberate boundaries

- No emoji catalog is bundled in this pass.
- No descriptive tag vocabulary is seeded.
- Tags/classifications are not embedded in the emoji record; StringBoard's tag-assignment system remains the classification layer so multiple sources, confidence, evidence, and provenance can coexist.
- Official taxonomy is kept separate from evolving descriptive analysis.
- The model is intentionally extensible; this pass does not pretend every future emoji field is already known.

## Qualification

Pass 2 adds four tests for identity, separation of taxonomy/analysis, absence of embedded tag vocabulary, and StringBoard record-store integration.
