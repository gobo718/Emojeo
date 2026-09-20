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


## Emojeo Pass 10 — Multi-Domain Design Graph
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


## Emojeo Pass 17
Adds `emojeo-decision-workspace.js`: a human-controlled decision lifecycle over Pass 16 what-if previews. Draft, review, approve/reject, implementation-plan generation, and implementation confirmation preserve history without silently mutating graph or canon. See `EMOJEO_PASS17.md`.

## Emojeo Pass 18
Adds `emojeo-design-change-application.js`: human-authorized transactional application and undo for approved Pass 17 decisions, with stale-plan rejection and rollback protection. See `EMOJEO_PASS18.md`.

## Emojeo Pass 19
Adds `emojeo-import-reconciliation.js`: provenance-aware identity matching and conflict surfacing for incoming design evidence. Machine matches remain advisory; an identified human must resolve each item before a downstream import plan can be exported. See `EMOJEO_PASS19.md`.

## Emojeo Pass 20
Adds `emojeo-design-workbench.js`: a practical read-only multi-domain browser and inspector over the MASHPEDITION design graph, with composable filters, linked-Thing inspection, exportable view state, and a mountable browser surface. See `EMOJEO_PASS20.md`.

## Emojeo Pass 21
Adds `emojeo-design-operations.js`: a read-only Design Operations Center that combines health findings, active decisions, and unresolved import reconciliation into one prioritized human work queue without creating any new mutation path. See `EMOJEO_PASS21.md`.

## Emojeo Pass 22
Adds `emojeo-design-recovery.js`: portable checksum-verified graph/canon checkpoints, storage round-trips, recovery previews, and explicit human-approved reconstruction into fresh state without silent live-state overwrite. See `EMOJEO_PASS22.md`.


## Emojeo Pass 23
Adds `emojeo-design-runtime.js`: one explicit shared runtime wiring canon, analysis, decisions, transactional application, reconciliation, workbench, operations, and recovery around the same design graph. No game content is seeded and human mutation boundaries remain intact. See `EMOJEO_PASS23.md`.


## Emojeo Pass 24
Adds durable runtime persistence and restoration for the shared design graph, canon, decision workflow, and reconciliation state while rebuilding derived services from restored source state. See `EMOJEO_PASS24.md`.

## Emojeo Pass 25
Adds end-to-end workflow hardening across human-approved application, durable persistence/restoration, advisory reconciliation, and isolated checkpoint recovery. See `EMOJEO_PASS25.md`.

## Emojeo Pass 26
Adds `emojeo-release-qualification.js`: a read-only release qualification gate that verifies runtime invariants and reports blockers without repairing or mutating state. See `EMOJEO_PASS26.md`.

## Emojeo Pass 27 — Release Baseline v1
Closes the architecture sequence with a verified release baseline: complete pass documentation, root integration wiring checks, qualification-gate presence, and a frozen handoff statement. No new subsystem or game content is introduced. See `EMOJEO_PASS27.md` and `EMOJEO_RELEASE_BASELINE_V1.md`.


## Post-baseline product work

- Pass 28 — AI inheritance diagnostics + official Unicode Emoji 18.0 semantic pilot planning. See `EMOJEO_PASS28.md`.

### Pass 30 — canonical AI credential inheritance
The root Emojeo UI now loads the inherited Genreactrix Settings Engine before the Cloud API so Worker URL/access-key resolution uses the canonical shared IndexedDB settings registry rather than relying only on legacy localStorage fallback values. No secret is embedded in the repository.
