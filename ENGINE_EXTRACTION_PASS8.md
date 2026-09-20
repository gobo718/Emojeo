# Reusable Engine Extraction — Pass 8

## Purpose
Turn the tag relationships extracted in Passes 6–7 into reusable behavior without flattening or replacing Genreactrix's specialized classification logic.

## Added
- `tag-rule-engine.js`: generic evaluation of typed-tag relationships.
- Explicit assignments can be expanded through `implies` and `composed-from` relationships, recursively when desired.
- Composite tags can be suggested when all of their component tags are present.
- Derived results are advisory by default. They do not silently rewrite explicit classifications.
- Optional materialization records derived tags through the assignment engine with rule provenance/evidence.
- The rule evaluator is vocabulary-neutral and supports unlimited tag types/relationships.

## Why this matters for inherited Genreactrix behavior
Genreactrix Themes/Reactions demonstrated that a tag can carry semantics about other tags. The reusable engine now preserves that general mechanism while leaving the actual Genreactrix Theme, Reaction, PrimFusion, Director, AI, SLOP, and customization implementations intact.

## Preservation / detachment boundary
- No specialized Genreactrix implementation was deleted.
- No Genreactrix vocabulary was removed.
- No user classifications, images, credentials, histories, or personalized instance data were added.
- Generic rule evaluation sits beside specialized behavior; it does not replace it.

## Validation improvement
Pass 8 adds the engine's first real automated smoke tests. They verify typed relationship preservation, non-destructive derivation, advisory composite suggestions, and explicit materialization. The existing `npm test` command now executes actual tests instead of reporting zero tests.

## Deliberately not done
- No Emojeo vocabulary or functionality.
- No forced migration of existing Genreactrix records.
- No storage-key/global-name migration.
- No deletion based on apparent product specificity.
