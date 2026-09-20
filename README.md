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

## Emojeo Pass 8
Feature intersections and advisory cluster/Mosaic-candidate discovery are implemented in `emojeo-cluster-discovery.js`. See `EMOJEO_PASS8.md`.


## Emojeo Pass 9 — Mosaic Candidate Review
Pass 9 adds an explicit human review boundary between advisory cluster discovery and canonical Mosaic creation. See `EMOJEO_PASS9.md`.


## Emojeo Pass 11 — Multi-Domain Design Graph
Pass 10 establishes Emojeo as the MASHPEDITION-wide design graph. Emoji and human-approved Mosaics are the first connected domains; future design domains are extensible rather than prematurely hard-coded. See `EMOJEO_PASS10.md`.


## Emojeo Pass 11
Adds the MASHPEDITION-facing multi-domain design catalog and shared connection vocabulary, plus structural gap detection. No game content is invented by the catalog.

## Emojeo Pass 12 — Canon Ledger
Pass 12 adds provenance-aware design assertions, lifecycle states, contradiction detection, and a protected current-canon view across every Emojeo design domain.

## Pass 13 — Evidence Intake
Recovered/design evidence can now be staged and previewed before it mutates the design graph. Source provenance is mandatory and commit requires explicit human approval. See `EMOJEO_PASS13.md`.


## Emojeo Pass 14
Progression and dependency analysis: reachability, chains, cycles, bottlenecks, roots, sinks, and unreachable content. Advisory relationships are excluded by default.

## Emojeo Pass 15
Pass 15 adds `emojeo-design-health.js`, a read-only health report and attention queue combining catalog gaps, progression diagnostics, domain coverage, and canon contradictions. Findings never automatically alter design or canon.


## Emojeo Pass 16
Adds read-only change-impact / what-if previews so proposed design changes can be traced through connected MASHPEDITION content before a human chooses whether to apply them. See `EMOJEO_PASS16.md`.
