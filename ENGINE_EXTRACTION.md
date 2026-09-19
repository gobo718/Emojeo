# Reusable Engine Extraction — Baseline Pass

This checkpoint begins extracting the reusable application engine inherited from Genreactrix before Emojeo-specific functionality is added.

## Rule
Do not delete a subsystem merely because its current Genreactrix meaning is irrelevant. Separate the reusable mechanism from the product-specific semantics first.

## Preserved as reusable infrastructure
- Project/runtime context and local persistence
- Import/export and job handling
- Queue, Batch, lifecycle and maintenance machinery
- Settings and notifications
- AI request/pipeline infrastructure
- Reporting and analytics foundations
- Matrix UI/mechanics (the PrimFusion taxonomy is product-specific; the matrix mechanism is reusable)
- Validation, history/event logging, failure handling and housekeeping

## Preserved but disabled in the reusable-engine extraction profile
- Research Dashboard and Research Sessions
- Predictive Classification Laboratory
- Adaptive Research Intelligence
- Publication/knowledge-paper surfaces
- Community/Public Research surfaces
- AI Training Comparison surface

The source remains present so useful mechanisms can be generalized later instead of being lost.

## Intentionally NOT migrated yet
Legacy `genreactrix-*` IndexedDB/localStorage keys, global API names, and Worker contracts remain unchanged in this pass. Renaming them before a migration layer exists risks breaking a known-working system or orphaning stored data. They should be generalized behind compatibility aliases in a later engine pass.

## Matrix direction
Keep the PrimFusion Matrix shell/mechanics. Later, remove the fixed Prim/PrimFusion semantics and adapt the shell for arbitrary tag/attribute vocabularies. Do not destroy the matrix implementation while extracting the engine.

## Checkpoint goal
The application should remain structurally compatible with the inherited code while product-specific surfaces can be disabled by profile. Emojeo-specific tag, metric, achievement, Mosaic, NPC, or unlockable systems are not added in this checkpoint.

## Pass 4 — Interlocked Matrix Extraction
- Extracted the proven landscape/interlocked matrix renderer into `interlocked-matrix-ui.js`.
- The renderer is product-neutral: axes, rows, tones, IDs, labels, and selection callbacks are supplied by the application.
- Genreactrix's current interlocked layout remains as a compatibility definition in `app.js`; its taxonomy is no longer embedded in the renderer.
- No Emojeo content was added.

## Pass 5 preservation rule
Specialized Genreactrix implementations are engine assets, not cleanup targets. Application profiles may disable a capability without deleting it. Generalized interfaces may sit beside specialized implementations. When reuse is uncertain, preserve the implementation.

## Pass 6 — tags as reusable classification primitives
The engine now supports unlimited typed tags and relationships between tags. Genreactrix Reactions and Themes can be exposed through an additive compatibility adapter: their specialized behavior remains preserved while their reusable classification structure becomes available to other applications. Theme composition/implication is modeled as tag relationships rather than a fixed engine-wide assumption.

## Pass 7 — classification assignments
The generic tag layer now separates vocabulary/relationships from assignments. Arbitrary subjects can receive unlimited typed tags while preserving weight, confidence, provenance/source, evidence, status, and metadata. This is additive: specialized Genreactrix Reaction, Theme, PrimFusion, Director, AI, and SLOP implementations remain intact.

## Pass 8 — tag rule evaluation + first real smoke tests
Typed tag relationships are now executable through a generic, non-destructive rule evaluator. Explicit tags can imply/contain other tags, component sets can suggest composite tags, and derived results preserve provenance when deliberately materialized. Specialized Genreactrix classification behavior remains intact beside this generic capability. Pass 8 also adds the first actual automated smoke tests for the extracted engine.


## Pass 9 — application detachment boundary
Application identity, namespaces, vocabulary/configuration, defaults, and compatibility metadata can now live in declarative application definitions rather than being assumed to be engine identity. Genreactrix is preserved as an optional application definition, including its legacy namespace knowledge and specialized-capability profile. This does not migrate or delete the working `genreactrix-*` storage/global/API contracts; it creates the safe compatibility boundary needed before any such migration is considered. Personalized instance records remain outside the reusable definition.

## Pass 10 — capability directory boundary
Pass 10 introduces one shallow architectural split: reusable capability implementations live under `/engine/`, while application identity, meaning, compatibility, entry points, deployment files, and application definitions remain at root. This is a detachment boundary, not a cleanup/deletion pass. Specialized Genreactrix-derived implementations are preserved when they encode reusable engineering knowledge. Automated tests remain 5/5 passing after path rewiring.

## Pass 11 — generic staged AI pipeline beside specialized Genreactrix AI
Pass 11 extracts a product-neutral staged AI pipeline mechanism without replacing or simplifying Genreactrix's proven AI Analysis Engine. Applications can supply arbitrary stages, validators, retries, timeouts, fallbacks, metadata, and lifecycle hooks; application vocabulary and policy remain external. The specialized Genreactrix AI pipeline—including Theme-derived Reactions, SLOP handling, Theme reruns/sweeps, provider behavior, diagnostics, lifecycle guards, and accumulated production fixes—remains intact as a reusable specialized implementation beside the generic mechanism.

## Pass 12 — Work processing
Added `engine/work-processing-engine.js` as a product-neutral orchestration capability for concurrent queued work, retries, persistence/resumption, pause/resume, safe stop, and immediate kill. Existing Genreactrix Queue/Batch/Lifecycle implementations remain preserved beside it; this is an additive abstraction, not a replacement.

## Pass 13 — Persistent record layer
Added `engine/record-store-engine.js` as an application-neutral record capability for arbitrary data, schema migration/versioning, status/flags, provenance/evidence, history/undo, import/export, validation, and pluggable persistence. Existing Genreactrix persistence/dataset/import/history machinery remains preserved beside it; this is additive detachment, not replacement.

## Pass 14 — Workspace / console capability
Added an application-neutral workspace state/action/panel engine while preserving Genreactrix's specialized Image Console, Director workspace, Investigation UI, and other consoles intact. Generic extraction does not replace specialized implementations.

## Pass 15 — query / analysis / report extraction
Added generic query, analysis, and report-composition capabilities beside the preserved Genreactrix analytics/report/research implementations. Specialized Genreactrix heuristics and application vocabulary remain available; generic capability does not replace encoded application knowledge.

## Pass 16 — storage / API / namespace boundary
Added a product-neutral namespace resolver for application-owned storage keys, database names, events, globals, and API routes, with explicit legacy compatibility candidates. Existing Genreactrix `genreactrix-*` contracts were preserved rather than mass-renamed; the new boundary is additive and lets future applications supply their own namespaces without erasing proven compatibility behavior.

## Pass 17 — Neutral qualification / Baseline v1
A neutral non-Genreactrix, non-emoji qualification fixture now exercises the generic engine across application activation, namespaces, tags, classification intersections, records, querying, workspace editing, and work processing. This establishes **Reusable Engine Baseline v1** without deleting or flattening preserved specialized Genreactrix implementations. See `ENGINE_EXTRACTION_PASS17.md` and `ENGINE_BASELINE_V1.md`.
