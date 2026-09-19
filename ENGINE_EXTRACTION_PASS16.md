# Reusable Engine Extraction — Pass 16

## Storage / API / application namespace boundary

Pass 16 adds a generic namespace boundary without rewriting or deleting the proven Genreactrix contracts.

### Added
- `engine/namespace-engine.js`
  - application-owned storage key generation
  - database naming
  - event naming
  - global naming
  - API route generation
  - explicit compatibility candidate resolution
- Genreactrix application definition now declares its API namespace and legacy API base explicitly.
- Automated tests verify a neutral application can generate its own names while Genreactrix's existing names remain unchanged.

### Preservation rule applied
The many existing `genreactrix-*` localStorage keys, IndexedDB database names, globals, event names, API routes, cleanup plans, and specialized compatibility behavior were deliberately **not** mass-renamed. They are proven application contracts and encoded compatibility knowledge. The generic namespace engine is additive and provides the boundary future applications use; Genreactrix can continue using its existing contracts unchanged.

No personalized Genreactrix instance data and no Emojeo content were added.
