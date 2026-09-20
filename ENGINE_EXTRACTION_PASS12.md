# Reusable Engine Extraction — Pass 12

## Scope
Work-processing extraction. This pass adds a product-neutral orchestration layer beside the preserved Genreactrix Queue, Batch, Lifecycle, import-job, post-processing, and related implementations.

## Added
- `engine/work-processing-engine.js`
  - arbitrary application-supplied work items
  - configurable concurrency
  - retries and retry delay
  - pluggable persistence adapter
  - interruption restoration (`processing` -> resumable `queued`)
  - safe pause/resume
  - safe stop
  - distinct immediate kill capability
  - failed-item retry
  - lifecycle hooks and application metadata
- `test/work-processing.test.js`
  - generic completion
  - retry behavior
  - persisted interruption recovery
  - immediate kill semantics

## Preservation rule
This does **not** replace, simplify, or delete the Genreactrix work machinery. The existing `queue-engine.js`, `batch-engine.js`, `lifecycle-engine.js`, and their specialized behaviors remain intact. Their product-specific states, isolation/quarantine behavior, notifications, IndexedDB compatibility, image lifecycle semantics, and accumulated special cases remain reusable engineering assets.

The generic layer exists so future applications can use the underlying work-processing pattern without first adopting Genreactrix vocabulary.

## Validation
- 12/12 automated tests pass.
- JavaScript syntax validation passes.
- No Emojeo vocabulary/content added.
- No personalized instance data added.
- No specialized capability deleted.
