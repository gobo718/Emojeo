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
