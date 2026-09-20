# Reusable Engine Extraction — Pass 2

## Completed
- Added `classification-matrix-engine.js`, a product-neutral matrix registry.
- Matrix definitions now support arbitrary items (`id`, `label`, optional `symbol`, arbitrary metadata).
- Pair/intersection identity and labels are handled by the generic engine.
- Supports configurable self-pairs and ordered/unordered pair semantics.
- Genreactrix's PrimFusion vocabulary now enters through a compatibility definition instead of being the only possible matrix vocabulary.
- Existing PrimFusion behavior remains available while extraction continues.

## Deliberately not done yet
- No Emojeo data or features were added.
- Genreactrix vocabulary was not deleted; it remains the compatibility fixture proving the extracted engine still supports the source application.
- The specialized interlocked landscape presentation still contains Genreactrix layout data. That presentation is a separate extraction target; it was not risked in the same pass.
- Legacy storage/global names remain unchanged until a compatibility migration exists.

## Architectural rule
Mechanism is generalized first. Product semantics remain adapters/fixtures until every consumer has been detached safely.
