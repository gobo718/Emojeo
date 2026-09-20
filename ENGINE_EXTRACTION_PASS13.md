# Reusable Engine Extraction — Pass 13

## Scope
Persistent data/record-layer extraction. This pass adds an application-neutral record store beside the preserved Genreactrix persistence, dataset-version, import/export, history, image-record, and project/runtime implementations.

## Added
- `engine/record-store-engine.js`
  - arbitrary application-defined record payloads
  - schema versions and application-supplied migrations
  - status and arbitrary flags
  - provenance/source/evidence metadata
  - revision history and undo
  - merge/replace import and portable export
  - pluggable persistence adapter
  - validation hooks
- `test/record-store.test.js`
  - arbitrary record/status/flag/provenance behavior
  - history + undo
  - schema migration during import
  - persistence restoration

## Preservation rule
This does **not** replace, flatten, or delete Genreactrix's specialized persistence knowledge. `persistence-engine.js`, `dataset-version-engine.js`, project/runtime boundaries, IndexedDB schemas, binary-safe backup/restore, image records, history, imports, reports, and legacy `genreactrix-*` compatibility remain intact. Those implementations encode proven behavior and remain reusable assets.

The generic record layer exists so future applications can define their own records without inheriting Genreactrix vocabulary or personalized instance data.

## Validation
- 16/16 automated tests pass.
- JavaScript syntax validation passes.
- No Emojeo vocabulary/content added.
- No personalized instance data added.
- No specialized Genreactrix capability deleted.
