# Emojeo

Emojeo is a child application of **StringBoard Engine v1**.

Pass 1 establishes the application boundary only: Emojeo has its own identity and application namespaces while inheriting the qualified StringBoard capability baseline. No emoji catalog, tag vocabulary, classifications, Mosaic candidates, or other emoji-content decisions are seeded in this pass.

The reusable engine remains preservation-first. Genreactrix-derived specialized implementations and compatibility machinery remain available as encoded know-how; Emojeo supplies its own application meaning separately.

See `EMOJEO_PASS1.md` for this pass and `STRINGBOARD_ENGINE_V1.md` / `ENGINE_BASELINE_V1.md` for the parent engine baseline.


## Emojeo application passes

- Pass 1: application boundary and StringBoard child identity.
- Pass 2: extensible Emoji Record model.
- Pass 3: official Unicode Emoji 18.0 catalog loader/importer; RGI subjects remain separate from later Emojeo interpretation.

## Emojeo Pass 4
The root application surface is now the Emoji Explorer: a responsive browser/search/filter/inspection UI over the official Unicode Emoji universe. See `EMOJEO_PASS4.md`.

## Emojeo Pass 6
Pass 6 adds the Vocabulary Lab: corpus-wide recurring-phrase inventory, advisory synonym/concept proposals, explicit approval/rejection, and curated-trait materialization without altering raw discovery evidence. See `EMOJEO_PASS6.md`.

## Emojeo Pass 7
Pass 7 adds full-vocabulary reclassification: every emoji can be evaluated consistently against every approved curated trait while Unicode Group/Subgroup remain authoritative traits. Decisions preserve present/absent/uncertain/unreviewed state and provenance. See `EMOJEO_PASS7.md`.
